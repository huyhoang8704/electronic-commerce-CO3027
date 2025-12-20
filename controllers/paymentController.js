const axios = require("axios");
const crypto = require("crypto");
const momoConfig = require("../config/momo");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Voucher = require("../models/Voucher");
const Order = require("../models/Order");

// Helper function để tính toán discount
const calculateDiscount = (voucher, totalAmount) => {
  let discount = 0;

  if (voucher.discountType === "percent") {
    discount = (voucher.discountValue / 100) * totalAmount;

    // Áp dụng maxDiscount nếu có
    if (voucher.maxDiscount > 0 && discount > voucher.maxDiscount) {
      discount = voucher.maxDiscount;
    }
  } else if (voucher.discountType === "fixed") {
    discount = voucher.discountValue;
  }

  // Không để discount vượt quá totalAmount
  if (discount > totalAmount) {
    discount = totalAmount;
  }

  return discount;
};

// Helper function để validate voucher
const validateVoucher = async (code, totalAmount, userId = null) => {
  const voucher = await Voucher.findOne({ code: code.toUpperCase() });

  if (!voucher) {
    return {
      valid: false,
      message: "Mã voucher không tồn tại",
      voucher: null,
    };
  }

  // Kiểm tra active
  if (!voucher.active) {
    return {
      valid: false,
      message: "Voucher không khả dụng",
      voucher: null,
    };
  }

  // Kiểm tra thời hạn
  const now = new Date();
  if (voucher.startDate && now < new Date(voucher.startDate)) {
    return {
      valid: false,
      message: "Voucher chưa đến thời gian sử dụng",
      voucher: null,
    };
  }

  if (voucher.endDate && now > new Date(voucher.endDate)) {
    return {
      valid: false,
      message: "Voucher đã hết hạn",
      voucher: null,
    };
  }

  // Kiểm tra số lượng
  if (voucher.quantity > 0 && voucher.usedCount >= voucher.quantity) {
    return {
      valid: false,
      message: "Voucher đã hết lượt sử dụng",
      voucher: null,
    };
  }

  // Kiểm tra giới hạn sử dụng per user (nếu có)
  if (userId && voucher.usageLimit > 0) {
    // Bạn có thể thêm logic kiểm tra user đã sử dụng voucher này bao nhiêu lần
    // Ví dụ: thêm trường usedBy trong model Voucher
  }

  // Kiểm tra giá trị đơn hàng tối thiểu
  if (totalAmount < voucher.minOrderValue) {
    return {
      valid: false,
      message: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString()} VND để sử dụng voucher`,
      voucher: null,
    };
  }

  // Tính toán discount
  const discountAmount = calculateDiscount(voucher, totalAmount);
  const finalAmount = Math.max(totalAmount - discountAmount, 0);

  return {
    valid: true,
    message: "Voucher hợp lệ",
    voucher: {
      _id: voucher._id,
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      maxDiscount: voucher.maxDiscount,
      minOrderValue: voucher.minOrderValue,
      usedCount: voucher.usedCount,
      quantity: voucher.quantity,
    },
    discountAmount,
    finalAmount,
  };
};

// Controller thanh toán
module.exports.checkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { selectedProducts, voucherCode } = req.body; // Thêm voucherCode

    if (!selectedProducts || selectedProducts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có sản phẩm nào được chọn",
      });
    }

    // Lấy giỏ hàng của user
    const cart = await Cart.findOne({ user_id: userId });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Giỏ hàng trống",
      });
    }

    // Tính tổng tiền và lấy thông tin sản phẩm
    let total = 0;
    const productDetails = [];

    for (const item of selectedProducts) {
      const productInCart = cart.products.find(
        (p) => p.product_id.toString() === item.product_id.toString()
      );

      if (!productInCart) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm ${item.product_id} không có trong giỏ hàng`,
        });
      }

      const product = await Product.findById(item.product_id).select(
        "price name stock"
      );
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sản phẩm ${item.product_id}`,
        });
      }

      // Kiểm tra số lượng tồn kho
      if (product.stock < productInCart.quantity) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm`,
        });
      }

      total += product.price * productInCart.quantity;
      productDetails.push({
        product_id: product._id,
        name: product.name,
        quantity: productInCart.quantity,
        price: product.price,
      });
    }

    // Validate và áp dụng voucher nếu có
    let voucherData = null;
    let discount = 0;
    let finalAmount = total;

    if (voucherCode) {
      const validation = await validateVoucher(voucherCode, total, userId);

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
        });
      }

      voucherData = validation.voucher;
      discount = validation.discountAmount;
      finalAmount = validation.finalAmount;
    }

    // Tạo yêu cầu thanh toán MoMo
    const partnerCode = momoConfig.partnerCode;
    const accessKey = momoConfig.accessKey;
    const secretKey = momoConfig.secretKey;

    // Validate MoMo configuration
    if (!partnerCode || !accessKey || !secretKey) {
      console.error("❌ MoMo configuration is missing:", {
        partnerCode: !!partnerCode,
        accessKey: !!accessKey,
        secretKey: !!secretKey,
      });
      return res.status(500).json({
        success: false,
        message:
          "Cấu hình thanh toán MoMo chưa đầy đủ. Vui lòng liên hệ quản trị viên.",
      });
    }

    const requestId = partnerCode + Date.now();
    const orderId = "ORDER_" + Date.now();
    const orderInfo = "Thanh toán đơn hàng";
    const redirectUrl = momoConfig.redirectUrl;
    const ipnUrl = momoConfig.ipnUrl;
    const requestType = "captureWallet";
    const extraData = voucherCode || ""; // Lưu voucher code vào extraData

    const rawSignature =
      `accessKey=${accessKey}&amount=${finalAmount}&extraData=${extraData}&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const body = {
      partnerCode,
      accessKey,
      requestId,
      amount: finalAmount.toString(),
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi",
    };

    const response = await axios.post(momoConfig.apiUrl, body);

    if (response.data && response.data.payUrl) {
      // Tạo đơn hàng "pending"
      await Order.create({
        user_id: userId,
        orderId,
        products: productDetails,
        totalAmount: total,
        voucherCode: voucherCode || null,
        voucherData: voucherData
          ? {
              code: voucherData.code,
              discountType: voucherData.discountType,
              discountValue: voucherData.discountValue,
              discountAmount: discount,
            }
          : null,
        discount,
        finalAmount: finalAmount,
        status: "pending",
        paymentMethod: "momo",
        paymentStatus: "pending",
        momoRequestId: requestId,
      });

      // Giảm số lượng voucher (tạm thời chưa, sẽ giảm khi thanh toán thành công)
      if (voucherData) {
        // Chỉ đánh dấu đang sử dụng, chưa trừ
        await Voucher.updateOne(
          { _id: voucherData._id },
          { $inc: { tempReserved: 1 } } // Thêm trường tempReserved trong model
        );
      }

      res.status(200).json({
        success: true,
        payUrl: response.data.payUrl,
        orderId,
        total: total,
        discount,
        finalAmount,
        voucher: voucherData
          ? {
              code: voucherData.code,
              discountAmount: discount,
            }
          : null,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Không thể tạo thanh toán",
      });
    }
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi thanh toán",
      details: error.message,
    });
  }
};

// Callback từ MoMo - Xử lý sau khi thanh toán
module.exports.momoCallback = async (req, res) => {
  try {
    const { orderId, resultCode, message, amount, extraData } = req.body;

    console.log("MoMo callback received:", {
      orderId,
      resultCode,
      message,
      amount,
      extraData,
    });

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (resultCode === 0) {
      // Thanh toán thành công
      // Cập nhật trạng thái đơn hàng
      order.status = "processing";
      order.paymentStatus = "paid";
      order.paidAt = new Date();
      await order.save();

      // Cập nhật số lượng tồn kho sản phẩm
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: { stock: -item.quantity },
        });
      }

      // Xóa sản phẩm đã thanh toán khỏi giỏ hàng
      const cart = await Cart.findOne({ user_id: order.user_id });
      if (cart) {
        // Lọc bỏ các sản phẩm đã thanh toán
        const remainingProducts = cart.products.filter((cartItem) => {
          return !order.products.some(
            (orderItem) =>
              orderItem.product_id.toString() === cartItem.product_id.toString()
          );
        });

        cart.products = remainingProducts;
        await cart.save();
      }

      // Xử lý voucher nếu có
      if (order.voucherCode) {
        await Voucher.findOneAndUpdate(
          { code: order.voucherCode },
          {
            $inc: {
              usedCount: 1,
              tempReserved: -1, // Giảm tempReserved
            },
          }
        );
      }

      // TODO: Gửi email xác nhận đơn hàng

      return res.status(200).json({
        success: true,
        message: "Thanh toán thành công",
        orderId: order.orderId,
      });
    } else {
      // Thanh toán thất bại
      order.status = "failed";
      order.paymentStatus = "failed";
      order.failureReason = message;
      await order.save();

      // Hoàn lại voucher nếu đã tạm giữ
      if (order.voucherCode) {
        await Voucher.findOneAndUpdate(
          { code: order.voucherCode },
          { $inc: { tempReserved: -1 } }
        );
      }

      return res.status(400).json({
        success: false,
        message: "Thanh toán thất bại: " + message,
        orderId: order.orderId,
      });
    }
  } catch (error) {
    console.error("MoMo callback error:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi xử lý callback",
      details: error.message,
    });
  }
};

// API để validate voucher riêng (dùng trước khi checkout)
module.exports.validateVoucher = async (req, res) => {
  try {
    const userId = req.user.id;
    const { voucherCode, totalAmount } = req.body;

    if (!voucherCode || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Thiếu voucherCode hoặc totalAmount",
      });
    }

    const validation = await validateVoucher(
      voucherCode,
      parseFloat(totalAmount),
      userId
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    res.status(200).json({
      success: true,
      message: validation.message,
      data: {
        voucher: validation.voucher,
        discountAmount: validation.discountAmount,
        finalAmount: validation.finalAmount,
      },
    });
  } catch (error) {
    console.error("Validate voucher error:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi kiểm tra voucher",
      details: error.message,
    });
  }
};

// Redirect URL - Xử lý khi user quay về từ MoMo
module.exports.momoRedirect = async (req, res) => {
  try {
    const {
      orderId,
      resultCode,
      message,
      amount,
      extraData,
      signature,
      requestId,
    } = req.query;

    console.log("MoMo redirect received:", {
      orderId,
      resultCode,
      message,
      amount,
    });

    // Tìm đơn hàng
    const order = await Order.findOne({ orderId });

    if (!order) {
      // Redirect về frontend với lỗi
      return res.redirect(
        `http://localhost:5173/cart?payment=error&message=Không tìm thấy đơn hàng`
      );
    }

    // Kiểm tra kết quả thanh toán
    if (resultCode === "0") {
      // Thanh toán thành công - redirect về cart với thông báo success
      return res.redirect(
        `http://localhost:5173/cart?payment=success&orderId=${orderId}&amount=${amount}`
      );
    } else {
      // Thanh toán thất bại - redirect về cart với thông báo lỗi
      return res.redirect(
        `http://localhost:5173/cart?payment=error&orderId=${orderId}&message=${encodeURIComponent(
          message || "Thanh toán thất bại"
        )}`
      );
    }
  } catch (error) {
    console.error("MoMo redirect error:", error);
    return res.redirect(
      `http://localhost:5173/cart?payment=error&message=Lỗi xử lý thanh toán`
    );
  }
};

// API kiểm tra trạng thái đơn hàng
module.exports.checkOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ orderId, user_id: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        discount: order.discount,
        finalAmount: order.finalAmount,
        products: order.products,
        voucherData: order.voucherData,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
      },
    });
  } catch (error) {
    console.error("Check order status error:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi kiểm tra trạng thái đơn hàng",
      details: error.message,
    });
  }
};
