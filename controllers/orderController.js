const Order = require("../models/Order");
const ORDER_STATUS_FLOW = {
  pending: ["processing", "cancelled", "failed"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "failed"],
  delivered: [],
  cancelled: [],
  failed: []
};

// [GET] /api/orders/my-orders
// Lấy lịch sử đơn hàng của user đang đăng nhập
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id; // lấy từ JWT

    const orders = await Order.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .populate("products.product_id", "name price")
      .lean();

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error("Get order history error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy lịch sử giao dịch"
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng"
      });
    }

    //  Không cho update nếu đơn đã kết thúc
    if (["delivered", "cancelled", "failed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng đã ở trạng thái "${order.status}", không thể cập nhật`
      });
    }

    //  Check luồng trạng thái
    if (status) {
      const allowedNextStatus = ORDER_STATUS_FLOW[order.status];

      if (!allowedNextStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Không thể chuyển trạng thái từ "${order.status}" sang "${status}"`
        });
      }

      order.status = status;
    }

    // Cập nhật trạng thái thanh toán (nếu có)
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;

      if (paymentStatus === "paid" && !order.paidAt) {
        order.paidAt = new Date();
      }
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order
    });

  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật trạng thái đơn hàng"
    });
  }
};
  
