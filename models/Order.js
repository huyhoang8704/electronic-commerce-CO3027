const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: String, required: true, unique: true },
  products: [{
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: { type: Number, required: true }, // Tổng tiền trước giảm giá
  voucherCode: String, // Mã voucher đã sử dụng
  voucherData: { // Lưu thông tin voucher tại thời điểm sử dụng
    code: String,
    discountType: String,
    discountValue: Number,
    discountAmount: Number
  },
  discount: { type: Number, default: 0 }, // Số tiền được giảm
  finalAmount: { type: Number, required: true }, // Tổng tiền sau giảm giá
  status: { 
    type: String, 
    enum: ["pending", "processing", "shipped", "delivered", "cancelled", "failed"],
    default: "pending"
  },
  paymentMethod: { type: String, enum: ["momo", "cash", "bank"], default: "momo" },
  paymentStatus: { 
    type: String, 
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },
  momoRequestId: String, // ID request từ MoMo
  paidAt: Date,
  failureReason: String,
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    district: String,
    ward: String
  },
  note: String
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema, "orders");