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
 *     summary: Thanh toán đơn hàng
 *     description: User cần đăng nhập để thực hiện thanh toán.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               voucherCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: URL thanh toán MoMo
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Lỗi server
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

module.exports = router;
