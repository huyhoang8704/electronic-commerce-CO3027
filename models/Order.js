const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: String, required: true },
  products: [
    {
      _id: false,
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  paymentMethod: { type: String, default: "momo" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema, "orders");
