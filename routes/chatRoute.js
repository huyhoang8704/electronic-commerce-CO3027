const express = require("express");
const router = express.Router();
const { chatWithGemini } = require("../controllers/chatController");
const auth = require("../middlewares/authTokenMiddleware");

/**
 * @openapi
 * /api/chat:
 *   post:
 *     tags:
 *       - Chatbot Gemini
 *     summary: Chatbot Gemini
 *     description: API chatbot Gemini
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Hello, how are you?"
 *             required:
 *               - message
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 reply:
 *                   type: string
 *       400:
 *         description: Thiếu message hoặc user không hợp lệ
 *       500:
 *         description: Lỗi server
 */

router.post("/", auth, chatWithGemini);


module.exports = router;
