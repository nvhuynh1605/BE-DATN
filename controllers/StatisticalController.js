const Order = require("../models/Order");
const Product = require("../models/Product");

const totalAmount = async (req, res) => {
    try {
      // Sử dụng Mongoose aggregate để tính tổng amount
      const result = await Order.aggregate([
        {
          $match: {
            status: { $ne: 0 }  // Lọc bỏ các đơn hàng có status là 0 (đã hủy)
          },
        },
        {
          $group: {
            _id: null, // Không nhóm theo bất kỳ trường nào
            totalAmount: { $sum: "$amount" }, // Tính tổng trường amount
          },
        },
      ]);
  
      // Lấy kết quả tổng (nếu không có đơn hàng, trả về 0)
      const totalAmount = result[0]?.totalAmount || 0;
  
      // Trả về kết quả dưới dạng JSON
      res.status(200).json({ totalAmount });
    } catch (error) {
      console.error("Error calculating total amount:", error);
      res.status(500).json({ error: "Failed to calculate total amount" });
    }
}

const totalAmountMonth = async (req, res) => {
    try {
      // Lấy tham số tháng và năm từ query string
      const { month, year } = req.query;
  
      // Đảm bảo tháng và năm được cung cấp
      if (!month || !year) {
        return res.status(400).json({ error: "Month and year are required" });
      }
  
      // Chuyển đổi tháng và năm sang kiểu số
      const monthNumber = parseInt(month, 10);
      const yearNumber = parseInt(year, 10);
  
      // Kiểm tra giá trị hợp lệ
      if (isNaN(monthNumber) || isNaN(yearNumber)) {
        return res.status(400).json({ error: "Invalid month or year format" });
      }
  
      // Sử dụng aggregate để lọc và tính tổng
      const result = await Order.aggregate([
        {
          $match: {
            $expr: {
              $and: [
                { $eq: [{ $month: "$orderDate" }, monthNumber] }, // Lọc theo tháng
                { $eq: [{ $year: "$orderDate" }, yearNumber] },   // Lọc theo năm
                { $ne: ["$status", 0] }                           // Lọc bỏ đơn hàng đã hủy (status = 0)
              ],
            },
          },
        },
        {
          $group: {
            _id: null, // Không nhóm theo trường nào khác
            totalAmount: { $sum: "$amount" }, // Tính tổng trường amount
          },
        },
      ]);
  
      // Lấy tổng tiền hoặc trả về 0 nếu không có đơn hàng
      const totalAmount = result[0]?.totalAmount || 0;
  
      // Trả về kết quả
      res.status(200).json({ month: monthNumber, year: yearNumber, totalAmount });
    } catch (error) {
      console.error("Error calculating total amount by month:", error);
      res.status(500).json({ error: "Failed to calculate total amount by month" });
    }
}

const incomeStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $match: {
          status: { $ne: 0 }, // Lọc bỏ các đơn hàng có trạng thái 'đã hủy'
        },
      },
      {
        $group: {
          _id: { $month: "$orderDate" }, // Lấy tháng từ orderDate
          totalIncome: { $sum: "$amount" }, // Tổng số tiền theo tháng
        },
      },
      {
        $sort: { _id: 1 }, // Sắp xếp theo tháng tăng dần
      },
      {
        $project: {
          month: "$_id", // Tháng sẽ giữ giá trị từ 1 đến 12
          totalIncome: { $round: ["$totalIncome", 0] },
          _id: 0,
        },
      }
    ]);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getOrderStatistics = async (req, res) => {
  try {
    const today = new Date();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(today.getDate() - 9); // Lấy mốc 10 ngày trước

    // Nhóm và đếm số lượng đơn hàng theo từng ngày
    const orders = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: tenDaysAgo,
            $lte: today,
          },
          status: { $ne: 0 }, // Loại trừ các đơn hàng đã hủy (status = 0)
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$orderDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Đảm bảo đủ 10 ngày (nếu có ngày không có đơn hàng thì thêm count = 0)
    const result = [];
    for (let i = 9; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const formattedDate = date.toISOString().split("T")[0]; // Format YYYY-MM-DD
      const order = orders.find((o) => o._id === formattedDate);
      result.push({ date: formattedDate, count: order ? order.count : 0 });
    }

    res.status(200).json(result); // Trả về danh sách
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu thống kê", error });
  }
};

const getOrderStatusStatistics = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: "$status", // Nhóm theo giá trị của `status`
          count: { $sum: 1 }, // Đếm số lượng đơn hàng trong mỗi nhóm
        },
      },
    ]);

    // Chuyển đổi dữ liệu thành dạng dễ hiểu hơn
    const result = orders.map((order) => {
      let statusLabel = "";
      switch (order._id) {
        case 0:
          statusLabel = "Đã hủy";
          break;
        case 1:
          statusLabel = "Đang xử lý";
          break;
        case 2:
          statusLabel = "Đã thanh toán";
          break;
        case 3:
          statusLabel = "Đã giao hàng";
          break;
        default:
          statusLabel = "Không xác định";
      }
      return { status: statusLabel, count: order.count };
    });

    res.status(200).json(result); // Trả về dữ liệu
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu thống kê", error });
  }
};

// Example Express backend code
const statistics = async (req, res) => {
  try {
    // Fetch products not having status 0
    const productsNotStatusZero = await Product.find({ status: { $ne: 0 } });
    const totalProducts = productsNotStatusZero.length;

    // Fetch orders not having status 0 and calculate total amount
    const ordersNotStatusZero = await Order.aggregate([
      { $match: { status: { $ne: 0 } } },  // Exclude orders with status 0
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }, // Sum the 'amount' field
        },
      },
    ]);

    const totalAmount = ordersNotStatusZero.length > 0 ? ordersNotStatusZero[0].totalAmount : 0;

    // Fetch current month's total amount (optional)
    const currentMonthAmount = await Order.aggregate([
      { $match: { 
          status: { $ne: 0 },
          orderDate: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } // Orders in the current month
        } 
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const currentMonthTotalAmount = currentMonthAmount.length > 0 ? currentMonthAmount[0].totalAmount : 0;

    // Round the amounts before sending them to the frontend
    const roundedTotalAmount = Math.round(totalAmount); // Round totalAmount to the nearest integer
    const roundedCurrentMonthTotalAmount = Math.round(currentMonthTotalAmount); // Round currentMonthTotalAmount to the nearest integer

    // Fetch total number of orders with status other than 0
    const totalOrders = await Order.countDocuments({ status: { $ne: 0 } });

    // Send response with the statistics
    res.json({
      totalProducts,
      totalAmount: roundedTotalAmount,
      currentMonthTotalAmount: roundedCurrentMonthTotalAmount,
      totalOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};


module.exports = { totalAmount, totalAmountMonth, incomeStats, getOrderStatistics, getOrderStatusStatistics, statistics }