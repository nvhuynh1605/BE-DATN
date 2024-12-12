const Order = require("../models/Order");
const Product = require("../models/Product");
const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", // Hoặc 'live' nếu triển khai thật
  client_id:
    "AXmQ7VDtgZQNlcEyXzN9lYAYJkaOn3IJS0c-YyxIKWXVKpBEHAGsvNaBnod99s4ssqFmY8ApeDaWiwP4",
  client_secret:
    "EM1oQX_pLE7W-pXduiCIR7j2NwkyNnCnlvgS1FqYG60z2QlwQ0ZnrZR5RfR4jg4r6i06vaH8mXdHIBho",
});

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "-password")
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    let amount = req.body.amount;

    if (!amount) {
      amount = req.body.products.reduce((total, item) => {
        const buyQuantity = parseFloat(item.buyQuantity);
        const currentPrice = parseFloat(item.currentPrice);

        if (isNaN(buyQuantity) || isNaN(currentPrice)) {
          console.error(`Invalid values for product ${item.product.product_id}: buyQuantity = ${item.buyQuantity}, currentPrice = ${item.product.currentPrice}`);
          throw new Error(`Invalid values for product ${item.product.product_id}. Buy quantity or price is not a valid number.`);
        }

        return total + (buyQuantity * currentPrice);
      }, 0);
    }

    if (isNaN(amount)) {
      throw new Error("Total amount calculation failed, amount is NaN");
    }

    const orderData = {
      products: req.body.products,
      amount: parseFloat(amount),
      status: req.body.status,
      fullName: req.body.fullName,
      address: req.body.address,
      phoneNum: req.body.phoneNum,
      note: req.body.note,
      status: req.body.status,
      orderDate: req.body.orderDate || Date.now(),
      userId: req.body.userId,
      product_id: req.body.product_id,
    };

    const order = await Order.create(orderData);

    for (const item of req.body.products) {
      const { product_id, buyQuantity } = item;

      const product = await Product.findById(product_id);
      if (product) {
        product.quantity -= parseInt(buyQuantity);
        product.sold += parseInt(buyQuantity);

        if (product.quantity < 0) {
          product.quantity = 0;
        }

        await product.save();
      } else {
        console.warn(`Product with ID ${product_id} not found.`);
      }
    }
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body, // Use `req.body` to pass fields to be updated
      { new: true } // Return the updated document
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBestSelling = async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $unwind: "$products" }, // Phân rã mảng products
      {
        $group: {
          _id: "$products.product_id", // Nhóm theo product_id của từng sản phẩm
          name: { $first: "$products.name" }, // Lấy tên sản phẩm
          totalQuantity: { $sum: "$products.buyQuantity" }, // Tính tổng số lượng bán ra
          price: { $first: "$products.currentPrice" },
        },
      },
      { $sort: { totalQuantity: -1 } }, // Sắp xếp theo tổng số lượng bán ra giảm dần
      // { $limit: 10 } // Giới hạn danh sách top 10 sản phẩm bán chạy nhất
    ]);

    res.json(result); // Trả về danh sách sản phẩm bán chạy nhất dưới dạng JSON
  } catch (error) {
    res.status(500).json({ error: "Có lỗi xảy ra khi lấy dữ liệu" });
  }
};

const createPayment = (req, res) => {
  const { products } = req.body;

  // Tính tổng tiền
  const totalAmount = products
    .reduce((total, product) => {
      return total + product.currentPrice * product.buyQuantity;
    }, 0)
    .toFixed(2);

  const create_payment_json = {
    intent: "sale",
    payer: { payment_method: "paypal" },
    redirect_urls: {
      return_url: "http://localhost:3000/payment-detail?type=success",
      cancel_url: "http://localhost:3000/payment-detail?type=fail",
    },
    transactions: [
      {
        amount: { currency: "USD", total: totalAmount },
        item_list: {
          items: products.map((product) => ({
            sku: product.product_id,
            name: product.name,
            price: product.currentPrice.toFixed(2),
            currency: "USD",
            quantity: product.buyQuantity,
          })),
        },
        description: "Thanh toán các sản phẩm trong giỏ hàng",
      },
    ],
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      res.status(500).send(error);
    } else {
      const approvalUrl = payment.links.find(
        (link) => link.rel === "approval_url"
      ).href;
      res.json({ approvalUrl });
    }
  });
};

const executePayment = async (req, res) => {
  const { paymentId, PayerID, userId, fullName, address, note, phoneNum } = req.query;

  try {
    const existingOrder = await Order.findOne({ paymentId });
    if (existingOrder) {
      return res
        .status(400)
        .json({ message: "Order already processed.", order: existingOrder });
    }

    const execute_payment_json = { payer_id: PayerID };

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      async (error, payment) => {
        if (error) {
          console.error("PayPal Error:", error.response);
          return res
            .status(500)
            .json({
              message: "Error executing payment",
              error: error.response,
            });
        }

        const { id: payId, payer, transactions } = payment;
        const { email, payer_id } = payer.payer_info;
        const { total, currency } = transactions[0].amount;
        const products = transactions[0].item_list.items;

        const newOrder = new Order({
          userId: userId,
          paymentId: payId,
          payerId: payer_id,
          email,
          amount: parseFloat(total * 22000),
          currency,
          products: products.map((item) => ({
            product_id: item.sku,
            name: item.name,
            price: parseFloat(item.price * 22000),
            buyQuantity: item.quantity,
          })),
          fullName: fullName,
          address: address,
          phoneNum: phoneNum,
          note: note,
          status: parseInt(2),
        });

        await newOrder.save();

        for (const item of products) {
          const { sku, quantity } = item;

          const product = await Product.findById(sku);
          if (product) {
            product.quantity -= parseInt(quantity);
            product.sold += parseInt(quantity);

            if (product.quantity < 0) {
              product.quantity = 0;
            }

            await product.save();
          } else {
            console.warn(`Product with ID ${sku} not found.`);
          }
        }

        res.json({
          message: "Payment successful, order saved.",
          order: newOrder,
        });
      }
    );
  } catch (dbError) {
    console.error("Database Error:", dbError);
    res.status(500).json({ message: "Failed to save order.", error: dbError });
  }
};

const filterByOrderDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    end.setHours(23, 59, 59, 999);

    const filteredData = await Order.find({
      orderDate: {
        $gte: start, // Lớn hơn hoặc bằng startDate
        $lte: end    // Nhỏ hơn hoặc bằng endDate
      }
    });

    res.status(200).json(filteredData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error filtering data" });
  }
};

const getTopSellingWeek = async (req, res) => {
  try {
    const endDate = new Date(); // Current date and time
    endDate.setHours(23, 59, 59, 999); // Set to the end of today

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6); // Start from 7 days ago
    startDate.setHours(0, 0, 0, 0); // Set to the beginning of the day

    const topSellingProducts = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate, $lte: endDate }, // Filter orders in the last 7 days
        },
      },
      { $unwind: "$products" }, // Split orders into individual products
      {
        $group: {
          _id: "$products.product_id", // Group by product_id
          totalQuantity: { $sum: "$products.buyQuantity" }, // Sum the quantities sold
          productName: { $first: "$products.name" }, // Get the product name
          currentPrice: { $first: "$products.currentPrice" }, // Get the current price
        },
      },
      { $sort: { totalQuantity: -1 } }, // Sort by total quantity in descending order
      { $limit: 5 }, // Limit to the top 5 products
    ]);

    res.json(topSellingProducts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching top-selling products", error });
  }
};

const getOrderByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
      const orders = await Order.find({ userId: userId })
      if (!orders || orders.length === 0) {
          return res.status(404).json({ message: 'No orders found for this user.' });
      }
      res.status(200).json(orders);
  } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Server error', error });
  }
};

const searchOrders = async (req, res) => {
  try {
    const { query, userId } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Keyword is required for searching.' });
    }

    // Tạo truy vấn tìm kiếm chung với $or
    const searchCriteria = {
      ...(userId && { userId }), // Thêm điều kiện userId nếu tồn tại
      $or: [
        { paymentId: { $regex: query, $options: 'i' } },
        { 'products.name': { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
        { phoneNum: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } },
        { note: { $regex: query, $options: 'i' } },
      ],
    };

    // Thực hiện tìm kiếm
    const orders = await Order.find(searchCriteria);

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error searching orders:', error);
    res.status(500).json({ message: 'Server error while searching orders.' });
  }
};

module.exports = {
  getAllOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderById,
  getBestSelling,
  createPayment,
  executePayment,
  filterByOrderDate,
  getTopSellingWeek,
  getOrderByUserId,
  searchOrders
};
