const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Liên kết với người dùng (nếu có)
    email: { type: String, required: true }, // Email bắt buộc
    phoneNum: { type: String, required: true }, // Số điện thoại bắt buộc
    content: { type: String, required: true }, // Nội dung phản hồi bắt buộc
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Ai cập nhật
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

module.exports = mongoose.model('Feedback', feedbackSchema);
