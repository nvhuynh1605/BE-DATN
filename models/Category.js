const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    status: Number,
    des: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
