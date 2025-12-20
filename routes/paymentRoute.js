// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authToken = require("../middlewares/authTokenMiddleware");

/**
 * @swagger
 * /payment/checkout:
 *   post:
 *     tags:
 *       - Payment
 *     summary: Thanh toán đơn hàng bằng MoMo
 *     description: |
 *       User cần đăng nhập.
 *       API tạo yêu cầu thanh toán MoMo từ các sản phẩm đã chọn trong giỏ hàng.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - selectedProducts
 *             properties:
 *               selectedProducts:
 *                 type: array
 *                 description: Danh sách sản phẩm được chọn từ giỏ hàng
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                   properties:
 *                     product_id:
 *                       type: string
 *                       example: 64f123abc456def789012345
 *               voucherCode:
 *                 type: string
 *                 nullable: true
 *                 example: SALE50
 *     responses:
 *       200:
 *         description: Tạo thanh toán MoMo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 payUrl:
 *                   type: string
 *                   example: https://test-payment.momo.vn/...
 *                 orderId:
 *                   type: string
 *                   example: ORDER_1700000000000
 *                 total:
 *                   type: number
 *                   example: 500000
 *                 discount:
 *                   type: number
 *                   example: 50000
 *                 finalAmount:
 *                   type: number
 *                   example: 450000
 *                 voucher:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: SALE50
 *                     discountAmount:
 *                       type: number
 *                       example: 50000
 *       400:
 *         description: |
 *           Dữ liệu không hợp lệ:
 *           - Không có sản phẩm được chọn
 *           - Giỏ hàng trống
 *           - Sản phẩm không tồn tại trong giỏ
 *           - Không đủ tồn kho
 *           - Voucher không hợp lệ
 *       401:
 *         description: Unauthorized (thiếu hoặc sai JWT)
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server / lỗi tạo thanh toán
 */
router.post("/checkout", authToken, paymentController.checkout);

/**
 * @swagger
 * /payment/validate-voucher:
 *   post:
 *     tags:
 *       - Payment
 *     summary: Kiểm tra voucher hợp lệ
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               voucherCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Voucher hợp lệ
 *       400:
 *         description: Voucher không hợp lệ
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Lỗi server
 */
router.post("/validate-voucher", authToken, paymentController.validateVoucher);

/**
 * @swagger
 * /payment/momo-callback:
 *   post:
 *     tags:
 *       - Payment
 *     summary: MoMo callback sau thanh toán
 *     description: Endpoint để MoMo gửi thông báo thanh toán. Không yêu cầu authentication.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Nhận callback thành công
 *       500:
 *         description: Lỗi xử lý callback
 */
router.post("/momo-callback", paymentController.momoCallback);

/**
 * @swagger
 * /payment/momo/redirect:
 *   get:
 *     tags:
 *       - Payment
 *     summary: MoMo redirect sau khi user thanh toán
 *     description: Endpoint để MoMo redirect user về sau khi thanh toán
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *       - in: query
 *         name: resultCode
 *         schema:
 *           type: string
 *       - in: query
 *         name: message
 *         schema:
 *           type: string
 *       - in: query
 *         name: amount
 *         schema:
 *           type: number
 *     responses:
 *       302:
 *         description: Redirect về frontend
 */
router.get("/momo/redirect", paymentController.momoRedirect);

/**
 * @swagger
 * /payment/order/{orderId}:
 *   get:
 *     tags:
 *       - Payment
 *     summary: Kiểm tra trạng thái đơn hàng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin đơn hàng
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi server
 */
router.get("/order/:orderId", authToken, paymentController.checkOrderStatus);

module.exports = router;
