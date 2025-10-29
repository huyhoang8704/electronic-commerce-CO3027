const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middlewares/authTokenMiddleware');
const { authorize } = require('../middlewares/authRoleMiddleware');
const multer = require('multer');

// Multer lưu file vào RAM (buffer) để gửi lên Supabase
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product management APIs for users
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - price
 *       properties:
 *         name:
 *           type: string
 *           example: "Phần mềm ERP Pro"
 *         type:
 *           type: string
 *           enum: [software, hardware, combo]
 *           example: "software"
 *         description:
 *           type: string
 *           example: "Giải pháp ERP cho doanh nghiệp SMEs"
 *         price:
 *           type: number
 *           example: 5000000
 *         category:
 *           type: string
 *           example: "68e93416882a3bd7776caa98"
 *         stock:
 *           type: number
 *           example: 10
 *         warranty:
 *           type: string
 *           example: "12 tháng"
 *         servicePackage:
 *           type: object
 *           properties:
 *             mode:
 *               type: string
 *               example: "SaaS"
 *             duration:
 *               type: string
 *               example: "1 năm"
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - "https://jwiitopxryltgtkbmcsb.supabase.co/storage/v1/object/public/product-images/abc.png"
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get list of products with optional filters (category, type, search)
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: categoryID
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [software, hardware, combo]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/', productController.getProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product details by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 */
router.get('/:id', productController.getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Admin)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Phần mềm quản lý POS"
 *               type:
 *                 type: string
 *                 enum: [software, hardware, combo]
 *               description:
 *                 type: string
 *                 example: "Phần mềm quản lý bán hàng cho cửa hàng bán lẻ"
 *               price:
 *                 type: number
 *                 example: 5000000
 *               percentDiscount:
 *                 type: number
 *                 example: 10
 *               category:
 *                 type: string
 *                 example: "69023b1f68845dd2cc425197"
 *               stock:
 *                 type: number
 *               warranty:
 *                 type: string
 *                 example: "12 tháng"
 *               servicePackage:
 *                 type: string
 *                 example: '{"mode":"SaaS","duration":"1 năm"}'
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post('/', auth, authorize('admin'), upload.array('images', 5), productController.createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (Admin)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
router.put('/:id', auth, authorize('admin'), upload.array('images', 5), productController.updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (Admin)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
router.delete('/:id', auth, authorize('admin'), productController.deleteProduct);

module.exports = router;
