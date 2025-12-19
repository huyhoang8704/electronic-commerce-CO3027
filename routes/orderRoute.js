const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authToken = require("../middlewares/authTokenMiddleware");
const authAdmin = require("../middlewares/authRoleMiddleware")

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Quản lý đơn hàng
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *           example: ORDER_123456
 *         status:
 *           type: string
 *           example: shipped
 *         paymentStatus:
 *           type: string
 *           example: paid
 *         totalAmount:
 *           type: number
 *           example: 500000
 *         finalAmount:
 *           type: number
 *           example: 450000
 */

/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Lấy lịch sử đơn hàng của user
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách đơn hàng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */
router.get("/my-orders", authToken, orderController.getMyOrders);

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   patch:
 *     summary: Cập nhật trạng thái đơn hàng (không cho update ngược)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         example: ORDER_123456
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - processing
 *                   - shipped
 *                   - delivered
 *                   - cancelled
 *                   - failed
 *               paymentStatus:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - paid
 *                   - failed
 *                   - refunded
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Trạng thái không hợp lệ hoặc update ngược
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       401:
 *         description: Unauthorized
 */
router.patch("/:orderId/status", authToken, authAdmin.authorize('admin'), orderController.updateOrderStatus);

module.exports = router;
