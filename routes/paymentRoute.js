const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authToken = require("../middlewares/authTokenMiddleware");

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment and Checkout management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CheckoutRequest:
 *       type: object
 *       required:
 *         - amount
 *         - paymentMethod
 *       properties:
 *         amount:
 *           type: number
 *           example: 500000
 *         paymentMethod:
 *           type: string
 *           example: "momo"
 *         orderId:
 *           type: string
 *           example: "ORD123456"
 *         description:
 *           type: string
 *           example: "Thanh toán đơn hàng #ORD123456"
 *
 *     CheckoutResponse:
 *       type: object
 *       properties:
 *         payUrl:
 *           type: string
 *           example: "https://test-payment.momo.vn/pay?token=abcxyz"
 *         message:
 *           type: string
 *           example: "Checkout initialized successfully"
 */

/**
 * @swagger
 * /api/payment/checkout:
 *   post:
 *     summary: Create a payment (checkout) session
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutRequest'
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckoutResponse'
 *       400:
 *         description: Invalid request or missing fields
 *       401:
 *         description: Unauthorized
 */
router.post("/checkout", authToken, paymentController.checkout);

/**
 * @swagger
 * /api/payment/momo/callback:
 *   post:
 *     summary: MoMo payment callback (server-to-server)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             orderId: "ORD123456"
 *             resultCode: 0
 *             message: "Successful"
 *             transId: "1234567890"
 *     responses:
 *       200:
 *         description: Callback received and processed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Payment callback processed"
 *       400:
 *         description: Invalid callback data
 *       401:
 *         description: Unauthorized
 */
router.post("/momo/callback", authToken, paymentController.momoCallback);

/**
 * @swagger
 * /api/payment/momo/redirect:
 *   get:
 *     summary: MoMo redirect after user completes payment
 *     tags: [Payment]
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         description: ID of the order
 *       - in: query
 *         name: resultCode
 *         schema:
 *           type: integer
 *         description: Payment result code (0 means success)
 *       - in: query
 *         name: message
 *         schema:
 *           type: string
 *         description: Message from MoMo payment gateway
 *     responses:
 *       200:
 *         description: Redirect information returned successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "redirect successfully"
 *               query:
 *                 orderId: "ORD123456"
 *                 resultCode: 0
 *                 message: "Successful"
 */
router.get("/momo/redirect", (req, res) => {
  res.json({
    message: "redirect successfully",
    query: req.query,
  });
});

module.exports = router;
