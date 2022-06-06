const mongoose = require("mongoose");
const Product = require("./Product");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Required name."],
    trim: true,
  },
  surname: {
    type: String,
    required: [true, "Required surname."],
    trim: true,
  },
  birth: {
    type: Date,
    required: [true, "Required date."],
    trim: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  email: {
    type: String,
    required: [true, "Required email."],
    minlength: [10, "Min 10 character."],
    maxlength: [50, "Max 50 character."],
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Required password."],
    minlength: [5, "Min 5 character."],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, "Required phone."],
  },
  country: {
    type: String,
    required: [true, "Required country."],
    trim: true,
  },
  address: {
    type: String,
    required: [true, "Required address."],
    trim: true,
  },
  cartNo: {
    type: String,
    required: [true, "Required iban."],
    trim: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  cart: {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

//-----------------------------------------------------

userSchema.methods.addToCart = function (product) {
  const index = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });

  const updatedCartItems = [...this.cart.items];

  if (index >= 0) {
  } else {
    updatedCartItems.push({
      productId: product._id,
    });
  }

  this.cart = {
    items: updatedCartItems,
  };

  return this.save();
};

//-----------------------------------------------------

userSchema.methods.deleteCartItem = function (productid) {
  const cartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productid.toString();
  });

  this.cart.items = cartItems;
  return this.save();
};

//-----------------------------------------------------

module.exports = mongoose.model("User", userSchema);
