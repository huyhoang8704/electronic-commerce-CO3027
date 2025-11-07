const express = require('express')
const route = express.Router()
const controller = require("../controllers/cartController")
const authToken = require("../middlewares/authTokenMiddleware")

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping Cart management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *           example: "6714c92c512abcc11e8e63d1"
 *         name:
 *           type: string
 *           example: "Áo thun nam cổ tròn"
 *         price:
 *           type: number
 *           example: 199000
 *         quantity:
 *           type: integer
 *           example: 2
 *         total:
 *           type: number
 *           example: 398000
 *
 *     AddCartItemRequest:
 *       type: object
 *       required:
 *         - quantity
 *       properties:
 *         quantity:
 *           type: integer
 *           example: 1
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get all items in the current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cart items
 *         content:
 *           application/json:
 *             example:
 *               message: "Cart fetched successfully"
 *               items:
 *                 - productId: "6714c92c512abcc11e8e63d1"
 *                   name: "Áo thun nam cổ tròn"
 *                   price: 199000
 *                   quantity: 2
 *                   total: 398000
 *       401:
 *         description: Unauthorized
 */
route.get('/', authToken, controller.index)

/**
 * @swagger
 * /api/cart/{productId}:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to add
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddCartItemRequest'
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Product added to cart"
 *               item:
 *                 productId: "6714c92c512abcc11e8e63d1"
 *                 quantity: 1
 *       400:
 *         description: Invalid product ID or quantity
 *       401:
 *         description: Unauthorized
 */
route.post('/:productId', authToken, controller.addPost)

/**
 * @swagger
 * /api/cart/{productId}:
 *   delete:
 *     summary: Remove a product from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to remove
 *     responses:
 *       200:
 *         description: Product removed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Product removed from cart"
 *       400:
 *         description: Product not found in cart
 *       401:
 *         description: Unauthorized
 */
route.delete('/:productId', authToken, controller.delete)

/**
 * @swagger
 * /api/cart/{productId}/{quantity}:
 *   patch:
 *     summary: Update quantity of a product in the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to update
 *       - in: path
 *         name: quantity
 *         required: true
 *         schema:
 *           type: integer
 *         description: New quantity for the product
 *     responses:
 *       200:
 *         description: Quantity updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Quantity updated"
 *               item:
 *                 productId: "6714c92c512abcc11e8e63d1"
 *                 quantity: 3
 *       400:
 *         description: Invalid product or quantity
 *       401:
 *         description: Unauthorized
 */
route.patch('/:productId/:quantity', authToken, controller.update)

module.exports = route
