const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authToken = require("../middlewares/authTokenMiddleware")

router.post("/checkout",authToken, paymentController.checkout);
router.post("/momo/callback",authToken, paymentController.momoCallback);
router.get("/momo/redirect", (req, res) => {
    res.json({
      message: "redirect successfully",
      query: req.query,
    });
  });

module.exports = router;
