const Cart = require("../models/Cart.js");
const Product = require("../models/Product.js");
const Voucher = require("../models/Voucher.js");

//[GET] /card
module.exports.index = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart || cart.products.length === 0)
      return res.status(200).json({ products: [], totalPrice: 0 });

    //calculate the price of whole products
    let total = 0;
    const productDetails = [];
    for (const item of cart.products) {
      const product = await Product.findById(item.product_id).select(
        "price name images"
      );
      if (!product) continue;
      const totalItemPrice = product.price * item.quantity;
      total += totalItemPrice;

      productDetails.push({
        productId: product._id,
        productName: product.title,
        image: product.images,
        totalItemPrice,
        quantity: item.quantity,
      });
    }

    // const voucher = await Voucher.findOne({ code: code.toUpperCase(), active: true });
    // if (!voucher) return res.status(400).json({ message: "Invalid voucher code" });

    // //Check expired date
    // const now = new Date()
    // if(voucher.startDate && voucher.startDate > now)
    //     return res.status(400).json({ message: "Voucher not started yet" });
    // if(voucher.endDate && voucher.endDate < now)
    //     return res.status(400).json({ message: "Voucher expired" });
    // if (voucher.quantity <= 0)
    //     return res.status(400).json({ error: "Voucher out of stock" });
    // if (total < voucher.minOrderValue)
    //     return res.status(400).json({ error: `Order must be at least ${voucher.minOrderValue}` });

    // // Calculate the new prices
    // let discount = 0;
    // if (voucher.discountType === "percent"){
    //     discount = (voucher.discountValue / 100) * total;
    //     if (voucher.maxDiscount && discount > voucher.maxDiscount)
    //         discount = voucher.maxDiscount;
    // } else if (voucher.discountType === "fixed"){
    //     discount = voucher.discountValue
    // }

    // const finalTotal = Math.max(total - discount, 0);

    res.status(200).json({
      success: true,
      // voucher: {
      //     code: voucher.code,
      //     type: voucher.discountType,
      //     value: voucher.discountValue
      // },
      products: productDetails,
      totalBefore: total,
      // discount,
      totalAfter: total,
      // message: `Voucher applied successfully (-${discount})`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to get products" });
  }
};

//[POST]
module.exports.addPost = async (req, res) => {
  console.log("Add to cart", req.params.productId, req.body);
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    const quantity = parseInt(req.body.quantity) || 1;

    let cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      cart = await Cart.create({
        user_id: userId,
        products: [{ product_id: productId, quantity }],
      });
    } else {
      const item = cart.products.find(
        (p) => p.product_id.toString() === productId
      );
      if (item) {
        item.quantity += quantity;
      } else {
        cart.products.push({ product_id: productId, quantity });
      }
      await cart.save();
    }

    res.status(200).json({ message: "Added to cart successfully", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Cannot add to cart" });
  }
};

//[DELETE] /delete/:id
module.exports.delete = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    await Cart.updateOne(
      { user_id: userId },
      {
        $pull: { products: { product_id: productId } },
      }
    );

    res.status(200).json({ message: "Removed from cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Cannot remove item" });
  }
};

//[PATCH] /update/:productId/:quantity
module.exports.update = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    const quantity = parseInt(req.params.quantity);

    if (quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be > 0" });
    }

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.products.find(
      (p) => p.product_id.toString() === productId
    );
    if (!item) res.status(404).json({ error: "Product not in cart" });

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ message: "Quantity updated", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Cannot update quantity" });
  }
};
