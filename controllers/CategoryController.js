const Category = require("../models/Category");
const Product = require("../models/Product");

const createCategory = async (req, res) => {
  try {
    const { name, status } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).send("Category name already exists");
    }

    const newCategory = new Category({ name, status });
    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).send("Failed to create category");
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve categories", error: error.message });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;

  try {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory && existingCategory._id.toString() !== id) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
        { name, status, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(updatedCategory);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update category", error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const productsUsingCategory = await Product.findOne({ category_id: id });

    if (productsUsingCategory) {
      return res.status(400).json({
        message: "Cannot delete category as it is associated with products",
      });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete category", error: error.message });
  }
};

const searchCateGory = async (req, res) => {
  try {
    const { query } = req.query;

    const searchCondition = {
      $or: [
        { name: { $regex: query, $options: "i" } },
      ],
    };

    const categories = await Category.find(searchCondition).populate("createdBy updatedBy");
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi khi tìm kiếm", error: error.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  searchCateGory
};
