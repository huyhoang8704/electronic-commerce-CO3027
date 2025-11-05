const express = require('express')
const route = express.Router()
const controller = require("../controllers/cartController")
const authToken = require("../middlewares/authTokenMiddleware")

route.get('/', authToken, controller.index)
route.post('/:productId', authToken, controller.addPost)

route.delete('/:productId', authToken, controller.delete)
route.patch('/:productId/:quantity', authToken, controller.update)



module.exports = route