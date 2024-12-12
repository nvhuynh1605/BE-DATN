const News = require("../models/News"); // Đường dẫn này cần trỏ đúng đến file chứa schema `news`

// Thêm tin tức
const createNews = async (req, res) => {
  try {
    const { user, content, title, status } = req.body;
    const image = req.file ? req.file.path : null; // Lấy URL ảnh từ Cloudinary

    const news = new News({ user, content, image, title, status });
    await news.save();

    res.status(201).json({ message: "News created successfully", news });
  } catch (error) {
    res.status(500).json({ message: "Error creating news", error });
  }
};

// Lấy danh sách tin tức
const getNews = async (req, res) => {
  try {
    const newsList = await News.find()
      .populate("user").populate("updatedBy")
    res.status(200).json(newsList); 
  } catch (error) {
    res.status(500).json({ message: "Error retrieving news", error });
  }
};

// Cập nhật tin tức
const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, user, title, status } = req.body;
    const image = req.file ? req.file.path : undefined; // Lấy URL ảnh nếu có

    const updateData = { content, updatedBy: user, image, title, status };
    if (image) updateData.image = image; // Cập nhật ảnh nếu có

    const news = await News.findByIdAndUpdate(id, updateData, { new: true });

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    res.status(200).json({ message: "News updated successfully", news });
  } catch (error) {
    res.status(500).json({ message: "Error updating news", error });
  }
};

// Xóa tin tức
const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findByIdAndDelete(id);

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    res.status(200).json({ message: "News deleted successfully", news });
  } catch (error) {
    res.status(500).json({ message: "Error deleting news", error });
  }
};

const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;

        // Tìm tin tức theo ID, đồng thời populate để lấy thông tin user (nếu cần)
        const news = await News.findById(id).populate("user");

        if (!news) {
            return res.status(404).json({ message: "News not found" });
        }

        res.status(200).json(news);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving news", error });
    }
};

module.exports = { createNews, getNews, updateNews, deleteNews, getNewsById };
