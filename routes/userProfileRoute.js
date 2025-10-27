const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authTokenMiddleware');
const {
  getProfile,
  updateProfile,
  changePassword,
  updateEmailWithOtp
} = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: User Profile
 *   description: User profile management (view, update, change password, update email)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Nguyen Van A"
 *         phone:
 *           type: string
 *           example: "0987654321"
 *         address:
 *           type: string
 *           example: "123 Đường ABC, Quận 1, TP.HCM"
 *
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           example: "oldpassword123"
 *         newPassword:
 *           type: string
 *           example: "newpassword456"
 *
 *     UpdateEmailWithOtpRequest:
 *       type: object
 *       required:
 *         - newEmail
 *         - otp
 *       properties:
 *         newEmail:
 *           type: string
 *           example: "newemail@gmail.com"
 *         otp:
 *           type: string
 *           example: "123456"
 */

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             example:
 *               user:
 *                 id: "6714c92c512abcc11e8e63d1"
 *                 name: "Nguyen Van A"
 *                 email: "hoang@gmail.com"
 *                 phone: "0987654321"
 *                 address: "123 Đường ABC, Quận 1, TP.HCM"
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: User not found
 */
router.get('/', auth, getProfile);

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update user profile (name, phone, address)
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Profile updated successfully"
 *               user:
 *                 id: "6714c92c512abcc11e8e63d1"
 *                 name: "Nguyen Van A"
 *                 email: "hoang@gmail.com"
 *                 phone: "0987654321"
 *                 address: "123 Đường ABC, Quận 1, TP.HCM"
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.put('/', auth, updateProfile);

/**
 * @swagger
 * /api/user/profile/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Password changed successfully"
 *       400:
 *         description: Current password incorrect or new passwords do not match
 *       401:
 *         description: Unauthorized
 */
router.put('/change-password', auth, changePassword);

/**
 * @swagger
 * /api/user/profile/update-email:
 *   put:
 *     summary: Update user email after OTP verification
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEmailWithOtpRequest'
 *     responses:
 *       200:
 *         description: Email updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Email updated successfully"
 *               email: "newemail@gmail.com"
 *       400:
 *         description: Invalid OTP or email already exists
 *       401:
 *         description: Unauthorized
 */
router.put('/update-email', auth, updateEmailWithOtp);

module.exports = router;
