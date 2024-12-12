const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Người tạo bài viết
    title: { type: String, required: true }, // Tiêu đề bài viết bắt buộc
    content: { type: String, required: true }, // Nội dung bài viết bắt buộc
    status: { type: Number, default: 1 },
    image: { type: String }, // URL hình ảnh bài viết bắt buộc
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Người cập nhật bài viết
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

module.exports = mongoose.model('News', newsSchema);
