const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: String,
  discountType: { type: String, enum: ["percent", "fixed"], default: "percent" },
  discountValue: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date,
  quantity: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  usageLimit: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 },
  tempReserved: { type: Number, default: 0 }, // Đếm số voucher đang được tạm giữ
  usedBy: [{ // Lưu lịch sử sử dụng
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderId: String,
    usedAt: Date,
    discountAmount: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model("Voucher", voucherSchema, "vouchers");