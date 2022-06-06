const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Required name."],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Required email."],
    trim: true,
  },
  address: {
    type: String,
    required: [true, "Required address."],
    trim: true,
  },
  zipCode: {
    type: String,
    required: [true, "Required zip code."],
    trim: true,
  },
  city: {
    type: String,
    required: [true, "Required city."],
    trim: true,
  },
  country: {
    type: String,
    required: [true, "Required country."],
    trim: true,
  },
  cartNumber: {
    type: String,
    required: [true, "Required cart number"],
    trim: true,
  },
  expiry: {
    type: String,
    required: [true, "Required expiry."],
    trim: true,
  },
  cvc: {
    type: String,
    required: [true, "Required cvc."],
    trim: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
