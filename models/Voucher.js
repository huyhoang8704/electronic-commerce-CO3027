const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: String,
  discountType: { type: String, enum: ["percent", "fixed"], default: "percent" },
  discountValue: { type: Number, required: true }, // 10 (=> 10%) hoặc 50000 (=> 50k VND)
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date,
  quantity: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  usageLimit: { type: Number, default: 0 }, // 0 = unlimited
  usedCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Voucher", voucherSchema, "vouchers");
