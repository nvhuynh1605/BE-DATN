const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema({
  //   products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  paymentId: { type: String },
  payerId: { type: String },
  email: String,
  amount: { type: Number, require: true },
  currency: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  products: [
    {
      product_id: String,
      name: String,
      author: String,
      category_id: String,
      des: String,
      price: Number,
      quantity: Number,
      sold: Number,
      sale: Number,
      currentPrice: Number,
      image_url: String,
      buyQuantity: Number,
    },
  ],
  status: { type: Number, default: 1 },
  fullName: String,
  phoneNum: String,
  address: String,
  note: String,
  orderDate: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
