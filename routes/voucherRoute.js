const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");
const authToken = require("../middlewares/authTokenMiddleware");
const authRoleMiddleware = require("../middlewares/authRoleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Vouchers
 *   description: Quản lý voucher và mã giảm giá
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Voucher:
 *       type: object
 *       required:
 *         - code
 *         - discountValue
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của voucher
 *         code:
 *           type: string
 *           description: Mã voucher (viết hoa)
 *         discountType:
 *           type: string
 *           enum: [percent, fixed]
 *         discountValue:
 *           type: number
 *         minOrderValue:
 *           type: number
 *         maxDiscount:
 *           type: number
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         quantity:
 *           type: number
 *         active:
 *           type: boolean
 *         usedCount:
 *           type: number
 *
 *     ValidateRequest:
 *       type: object
 *       required:
 *         - code
 *         - orderValue
 *       properties:
 *         code:
 *           type: string
 *           example: "SUMMER50"
 *         orderValue:
 *           type: number
 *           example: 500000
 *
 *     UseVoucherRequest:
 *       type: object
 *       required:
 *         - code
 *       properties:
 *         code:
 *           type: string
 *           example: "SUMMER50"
 *
 *     CreateVoucherRequest:
 *       type: object
 *       required:
 *         - code
 *         - discountType
 *         - discountValue
 *       properties:
 *         code:
 *           type: string
 *         description:
 *           type: string
 *         discountType:
 *           type: string
 *           enum: [percent, fixed]
 *         discountValue:
 *           type: number
 *         minOrderValue:
 *           type: number
 *         maxDiscount:
 *           type: number
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         quantity:
 *           type: number
 *         usageLimit:
 *           type: number
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Public routes (KHÔNG cần token)

/**
 * @swagger
 * /api/voucher/validate:
 *   post:
 *     summary: Kiểm tra voucher hợp lệ
 *     description: API public - kiểm tra voucher có thể sử dụng không
 *     tags: [Vouchers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidateRequest'
 *     responses:
 *       200:
 *         description: Voucher hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     voucher:
 *                       $ref: '#/components/schemas/Voucher'
 *                     discountAmount:
 *                       type: number
 *                     finalAmount:
 *                       type: number
 *       400:
 *         description: Voucher không hợp lệ
 *       404:
 *         description: Không tìm thấy voucher
 */
router.post("/validate", voucherController.validateVoucher);

/**
 * @swagger
 * /api/voucher/active:
 *   get:
 *     summary: Lấy danh sách voucher đang hoạt động
 *     description: API public - ai cũng có thể xem voucher đang active
 *     tags: [Vouchers]
 *     responses:
 *       200:
 *         description: Danh sách voucher active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Voucher'
 */
router.get("/active", voucherController.getActiveVouchers);

// User routes (cần token, bất kỳ user nào đã đăng nhập)

/**
 * @swagger
 * /api/voucher/use:
 *   post:
 *     summary: Sử dụng voucher
 *     description: User đăng nhập mới được sử dụng voucher (tăng usedCount)
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UseVoucherRequest'
 *     responses:
 *       200:
 *         description: Sử dụng voucher thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     usedCount:
 *                       type: number
 *                     remaining:
 *                       type: number
 *       400:
 *         description: Không thể sử dụng voucher
 *       401:
 *         description: Chưa đăng nhập
 */
router.post("/use", authToken, voucherController.useVoucher);

// Admin routes (cần token VÀ role admin)

/**
 * @swagger
 * /api/voucher:
 *   post:
 *     summary: Tạo voucher mới (Admin only)
 *     description: Chỉ admin mới có quyền tạo voucher
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVoucherRequest'
 *     responses:
 *       201:
 *         description: Tạo voucher thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Voucher'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
router.post(
  "/",
  authToken,
  authRoleMiddleware.authorize("admin"),
  voucherController.createVoucher
);

/**
 * @swagger
 * /api/voucher:
 *   get:
 *     summary: Lấy tất cả voucher (Admin only)
 *     description: Chỉ admin mới có quyền xem tất cả voucher, có phân trang
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng mỗi trang
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái active
 *       - in: query
 *         name: discountType
 *         schema:
 *           type: string
 *           enum: [percent, fixed]
 *         description: Lọc theo loại giảm giá
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo code hoặc description
 *     responses:
 *       200:
 *         description: Danh sách voucher
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     docs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Voucher'
 *                     totalDocs:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     page:
 *                       type: integer
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
router.get(
  "/",
  authToken,
  authRoleMiddleware.authorize("admin"),
  voucherController.getAllVouchers
);

/**
 * @swagger
 * /api/voucher/{id}:
 *   get:
 *     summary: Lấy thông tin voucher theo ID (Admin only)
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của voucher
 *     responses:
 *       200:
 *         description: Thông tin voucher
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Voucher'
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy voucher
 */
router.get(
  "/:id",
  authToken,
  authRoleMiddleware.authorize("admin"),
  voucherController.getVoucherById
);

/**
 * @swagger
 * /api/voucher/{id}:
 *   put:
 *     summary: Cập nhật voucher (Admin only)
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của voucher
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               discountValue:
 *                 type: number
 *               minOrderValue:
 *                 type: number
 *               maxDiscount:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               quantity:
 *                 type: number
 *               active:
 *                 type: boolean
 *               usageLimit:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Voucher'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy voucher
 */
router.put(
  "/:id",
  authToken,
  authRoleMiddleware.authorize("admin"),
  voucherController.updateVoucher
);

/**
 * @swagger
 * /api/voucher/{id}:
 *   delete:
 *     summary: Xóa/vô hiệu hóa voucher (Admin only)
 *     description: Soft delete - chỉ set active = false
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của voucher
 *     responses:
 *       200:
 *         description: Vô hiệu hóa voucher thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy voucher
 */
router.delete(
  "/:id",
  authToken,
  authRoleMiddleware.authorize("admin"),
  voucherController.deleteVoucher
);

/**
 * @swagger
 * /api/voucher/{id}/activate:
 *   put:
 *     summary: Kích hoạt lại voucher (Admin only)
 *     description: Kích hoạt voucher đã bị vô hiệu hóa
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của voucher
 *     responses:
 *       200:
 *         description: Kích hoạt voucher thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Voucher'
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy voucher
 */
router.put(
  "/:id/activate",
  authToken,
  authRoleMiddleware.authorize("admin"),
  voucherController.activateVoucher
);

module.exports = router;
