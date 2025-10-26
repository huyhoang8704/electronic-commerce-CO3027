const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const auth = require('../middlewares/authTokenMiddleware');

/**
 * @swagger
 * tags:
 *   name: Company
 *   description: API Company management for users
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "Công ty TNHH BKSoft Solutions"
 *         taxCode:
 *           type: string
 *           example: "0312345678"
 *         address:
 *           type: string
 *           example: "268 Lý Thường Kiệt, Q.10, TP.HCM"
 *         field:
 *           type: string
 *           example: "Phần mềm - CNTT"
 *         contactEmail:
 *           type: string
 *           example: "contact@bksoft.vn"
 *         contactPhone:
 *           type: string
 *           example: "0912345678"
 */

/**
 * @swagger
 * /api/company:
 *   post:
 *     summary: Create a new company and associate it with the authenticated user
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Company'
 *     responses:
 *       201:
 *         description: Company created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, companyController.createCompany);

/**
 * @swagger
 * /api/company/me:
 *   get:
 *     summary: Get the current user's company information
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's company information
 *       401:
 *         description: Unauthorized
 */
router.get('/me', auth, companyController.getMyCompany);

/**
 * @swagger
 * /api/company/me:
 *   put:
 *     summary: Update the current user's company information
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Company'
 *     responses:
 *       200:
 *         description: Company updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Company not found
 */
router.put('/me', auth, companyController.updateCompany);


module.exports = router;
