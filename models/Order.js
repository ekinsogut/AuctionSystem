const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  productImg: {
    type: String,
    required: true,
  },
  productCurrentBid: {
    type: Number,
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  sellerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  buyerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isPayment: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("Order", orderSchema);
