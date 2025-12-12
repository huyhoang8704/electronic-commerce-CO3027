const axios = require("axios");
const crypto = require("crypto");
const momoConfig = require("../config/momo");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Voucher = require("../models/Voucher");
const Order = require("../models/Order");

module.exports.checkout = async (req, res) => {
  try {
    const userId = req.user.id;
    // const { code } = req.body;
    const { selectedProducts } = req.body;

    if (!selectedProducts || selectedProducts.length === 0)
      return res.status(400).json({ message: "No products selected" });

    // Lấy giỏ hàng của user
    const cart = await Cart.findOne({ user_id: userId });
    if (!cart || cart.products.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    // Tính tổng tiền
    let total = 0;
    const productDetails = [];

    for (const item of selectedProducts) {
      const productInCart = cart.products.find(
        (p) => p.product_id.toString() === item.product_id.toString()
      );
      if (!productInCart) continue;

      const product = await Product.findById(item.product_id).select(
        "price name"
      );
      if (!product) continue;

      total += product.price * productInCart.quantity;
      productDetails.push({
        product_id: product._id,
        name: product.name,
        quantity: productInCart.quantity,
        price: product.price,
      });
    }

    // // Áp mã giảm giá
    let discount = 0;
    // if (code) {
    //   const voucher = await Voucher.findOne({ code: code.toUpperCase(), active: true });
    //   if (voucher) {
    //     if (voucher.discountType === "percent")
    //       discount = (voucher.discountValue / 100) * total;
    //     else if (voucher.discountType === "fixed")
    //       discount = voucher.discountValue;
    //   }
    //   voucher.quantity -= 1;
    //   await voucher.save()
    // }

    const amount = Math.max(total - discount, 0);

    // Tạo yêu cầu thanh toán MoMo
    const partnerCode = momoConfig.partnerCode;
    const accessKey = momoConfig.accessKey;
    const secretKey = momoConfig.secretKey;
    const requestId = partnerCode + Date.now();
    const orderId = "ORDER_" + Date.now();
    const orderInfo = "Thanh toán đơn hàng";
    const redirectUrl = momoConfig.redirectUrl;
    const ipnUrl = momoConfig.ipnUrl;
    const requestType = "captureWallet";
    const extraData = "";

    const rawSignature =
      `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}` +
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
      amount: amount.toString(),
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
        totalAmount: amount,
        discount,
        status: "pending",
      });

      res.status(200).json({
        success: true,
        payUrl: response.data.payUrl,
        orderId,
        total: amount,
      });
    } else {
      res.status(400).json({ message: "Cannot create payment" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Payment error" });
  }
};

// Callback từ MoMo
module.exports.momoCallback = async (req, res) => {
  try {
    const { orderId, resultCode, message } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (resultCode === 0) {
      order.status = "paid";
      await order.save();

      // Xóa giỏ hàng sau khi thanh toán thành công
      await Cart.updateOne(
        { user_id: order.user_id },
        { $set: { products: [] } }
      );

      return res.status(200).json({ message: "Payment success" });
    } else {
      order.status = "failed";
      await order.save();
      return res.status(400).json({ message: "Payment failed: " + message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Callback error" });
  }
};
