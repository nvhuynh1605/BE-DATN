const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Tên sản phẩm (bắt buộc)
    author: { type: String }, // Tác giả (nếu có)
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }, // Danh mục sản phẩm
    des: { type: String }, // Mô tả sản phẩm
    price: { type: Number, required: true }, // Giá sản phẩm
    quantity: { type: Number, required: true }, // Số lượng còn trong kho
    sold: { type: Number, default: 0 }, // Số lượng đã bán
    sale: { type: Number, default: 0 }, // Giảm giá (nếu có)
    currentPrice: { type: Number }, // Giá hiện tại sau giảm giá
    image_url: { type: String }, // URL hình ảnh sản phẩm
    status: { type: Number, default: 1 }, // Trạng thái (1: Hoạt động, 0: Không hoạt động)
    publishingHouse: { type: String, default: "" }, // Nhà xuất bản (nếu có)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Người tạo
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Người cập nhật cuối cùng
    createdAtAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // Tự động thêm các trường createdAt và updatedAt
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
