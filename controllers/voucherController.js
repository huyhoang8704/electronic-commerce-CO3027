const Voucher = require("../models/Voucher");

// Tạo voucher mới
exports.createVoucher = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      startDate,
      endDate,
      quantity,
      usageLimit
    } = req.body;

    // Kiểm tra code đã tồn tại chưa
    const existingVoucher = await Voucher.findOne({ code });
    if (existingVoucher) {
      return res.status(400).json({
        success: false,
        message: "Mã voucher đã tồn tại"
      });
    }

    // Validate discountValue
    if (discountType === "percent" && (discountValue <= 0 || discountValue > 100)) {
      return res.status(400).json({
        success: false,
        message: "Giá trị giảm giá phần trăm phải từ 1 đến 100"
      });
    }

    if (discountType === "fixed" && discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Giá trị giảm giá cố định phải lớn hơn 0"
      });
    }

    // Validate dates
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Ngày bắt đầu phải trước ngày kết thúc"
      });
    }

    const voucher = new Voucher({
      code,
      description,
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscount: maxDiscount || 0,
      startDate: startDate || new Date(),
      endDate,
      quantity: quantity || 0,
      usageLimit: usageLimit || 0,
      active: true
    });

    await voucher.save();

    res.status(201).json({
      success: true,
      message: "Tạo voucher thành công",
      data: voucher
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    });
  }
};

// Lấy danh sách voucher (có phân trang và filter)
exports.getAllVouchers = async (req, res) => {
  try {
    
    const vouchers = await Voucher.find();

    res.status(200).json({
      success: true,
      data: vouchers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    });
  }
};

// Lấy voucher theo ID
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy voucher"
      });
    }

    res.status(200).json({
      success: true,
      data: voucher
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    });
  }
};

// Kiểm tra voucher hợp lệ
exports.validateVoucher = async (req, res) => {
  try {
    const { code, orderValue } = req.body;

    const voucher = await Voucher.findOne({ code });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Mã voucher không tồn tại"
      });
    }

    // Kiểm tra active
    if (!voucher.active) {
      return res.status(400).json({
        success: false,
        message: "Voucher không khả dụng"
      });
    }

    // Kiểm tra số lượng
    if (voucher.quantity > 0 && voucher.usedCount >= voucher.quantity) {
      return res.status(400).json({
        success: false,
        message: "Voucher đã hết lượt sử dụng"
      });
    }

    // Kiểm tra thời hạn
    const now = new Date();
    if (voucher.startDate && now < new Date(voucher.startDate)) {
      return res.status(400).json({
        success: false,
        message: "Voucher chưa đến thời gian sử dụng"
      });
    }

    if (voucher.endDate && now > new Date(voucher.endDate)) {
      return res.status(400).json({
        success: false,
        message: "Voucher đã hết hạn"
      });
    }

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (orderValue < voucher.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString()} VND`
      });
    }

    // Tính toán giá trị giảm
    let discountAmount = 0;
    let finalAmount = orderValue;

    if (voucher.discountType === "percent") {
      discountAmount = (orderValue * voucher.discountValue) / 100;
      
      // Áp dụng maxDiscount nếu có
      if (voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    } else {
      discountAmount = voucher.discountValue;
    }

    finalAmount = orderValue - discountAmount;
    if (finalAmount < 0) finalAmount = 0;

    res.status(200).json({
      success: true,
      message: "Voucher hợp lệ",
      data: {
        voucher: {
          _id: voucher._id,
          code: voucher.code,
          discountType: voucher.discountType,
          discountValue: voucher.discountValue,
          maxDiscount: voucher.maxDiscount
        },
        orderValue,
        discountAmount,
        finalAmount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    });
  }
};

// Sử dụng voucher
exports.useVoucher = async (req, res) => {
  try {
    const { code } = req.body;

    const voucher = await Voucher.findOne({ code });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Mã voucher không tồn tại"
      });
    }

    // Kiểm tra điều kiện sử dụng
    if (!voucher.active) {
      return res.status(400).json({
        success: false,
        message: "Voucher không khả dụng"
      });
    }

    if (voucher.quantity > 0 && voucher.usedCount >= voucher.quantity) {
      return res.status(400).json({
        success: false,
        message: "Voucher đã hết lượt sử dụng"
      });
    }

    if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Voucher đã đạt giới hạn sử dụng"
      });
    }

    // Tăng số lần sử dụng
    voucher.usedCount += 1;
    await voucher.save();

    res.status(200).json({
      success: true,
      message: "Sử dụng voucher thành công",
      data: {
        usedCount: voucher.usedCount,
        remaining: voucher.quantity > 0 ? voucher.quantity - voucher.usedCount : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    });
  }
};

// Cập nhật voucher
exports.updateVoucher = async (req, res) => {
  try {
    const updates = req.body;
    const voucherId = req.params.id;

    // Không cho phép cập nhật code
    if (updates.code) {
      delete updates.code;
    }

    const voucher = await Voucher.findByIdAndUpdate(
      voucherId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy voucher"
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật voucher thành công",
      data: voucher
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    });
  }
};

// Xóa voucher (soft delete)
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      { $set: { active: false } },
      { new: true }
    );

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy voucher"
      });
    }

    res.status(200).json({
      success: true,
      message: "Vô hiệu hóa voucher thành công"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    });
  }
};

// Kích hoạt lại voucher
exports.activateVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      { $set: { active: true } },
      { new: true }
    );

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy voucher"
      });
    }

    res.status(200).json({
      success: true,
      message: "Kích hoạt voucher thành công",
      data: voucher
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    });
  }
};

// Lấy voucher đang hoạt động
exports.getActiveVouchers = async (req, res) => {
  try {
    const now = new Date();

    const vouchers = await Voucher.find({
      active: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: now } }
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: vouchers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    });
  }
};