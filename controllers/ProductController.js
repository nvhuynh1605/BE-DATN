const Product = require("../models/Product");

const createProduct = async (req, res) => {
  const { name, author, des, price, sale, quantity, category_id, sold, publishingHouse, status } = req.body;

  const currentPrice = price - price * (sale / 100);
  const image_url = req.file ? req.file.path : null;

  try {
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res
        .status(400)
        .json({ message: "Product with the same name already exists" });
    }

    const newProduct = new Product({
      name,
      des,
      price,
      sale,
      currentPrice,
      image_url,
      author,
      quantity,
      category_id,
      sold,
      publishingHouse,
      status
    });

    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create product", error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category_id")
      .populate("createdBy", "-password");

    res.json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve products", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category_id");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve product", error: error.message });
  }
};

const getProductByCategoryId = async (req, res) => {
  try {
    const products = await Product.find({
      category_id: req.params.category_id,
    });

    if (!products.length) {
      return res
        .status(404)
        .json({ message: "No products found for this category" });
    }

    const populatedProducts = await Product.find({
      category_id: req.params.category_id,
    }).populate("category_id");

    res.json(populatedProducts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve products by category",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  const { name, author, des, price, sale, quantity, category_id, sold, publishingHouse, status } = req.body;

  const currentPrice = price - price * (sale / 100);
  const image_url = req.file ? req.file.path : undefined;

  try {
    const existingProduct = await Product.findOne({
      name,
      _id: { $ne: req.params.id },
    });
    if (existingProduct) {
      return res
        .status(400)
        .json({ message: "Another product with the same name already exists" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        author,
        des,
        price,
        sale,
        quantity,
        category_id,
        currentPrice,
        image_url,
        sold,
        publishingHouse,
        status,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update product", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
};

const searchProduct = async (req, res) => {
  try {
    const { query } = req.query;
    const results = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { author: { $regex: query, $options: "i" } },
      ],
    });
    res.json(results);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error occurred while searching products", error });
  }
};

const filterByCreatedDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    end.setHours(23, 59, 59, 999);

    const filteredData = await Product.find({
      createdAt: {
        $gte: start, // Lớn hơn hoặc bằng startDate
        $lte: end    // Nhỏ hơn hoặc bằng endDate
      }
    }).populate("category_id");

    res.status(200).json(filteredData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error filtering data" });
  }
};

const moreSearchProduct = async (req, res) => {
  try {
    const { query } = req.query;

    // Use aggregation to search both product fields and category_id.name
    const results = await Product.aggregate([
      {
        $lookup: {
          from: "categories", // Name of the referenced collection in MongoDB
          localField: "category_id",
          foreignField: "_id",
          as: "category_id"
        },
      },
      {
        $match: {
          $or: [
            { name: { $regex: query, $options: "i" } }, // Search in product name
            { author: { $regex: query, $options: "i" } }, // Search in product author
            { "category_id.name": { $regex: query, $options: "i" } }, // Search in category name
          ],
        },
      },
      {
        $unwind: {
          path: "$category_id",
          preserveNullAndEmptyArrays: true, // Allow products without categories
        },
      },
    ]);

    res.json(results);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error occurred while searching products", error });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByCategoryId,
  searchProduct,
  filterByCreatedDate,
  moreSearchProduct,
};
