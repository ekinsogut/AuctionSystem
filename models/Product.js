const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Required product name."],
    minlength: [5, "Min 5 character."],
    maxlength: [50, "Max 50 character."],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Required description."],
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  start_bid: {
    type: Number,
    required: [true, "Required start bid."],
  },
  current_bid: {
    type: Number,
    default: 0,
  },
  sale_price: {
    type: Number,
    required: [true, "Required sale price."],
  },
  last_date: {
    type: String,
    required: [true, "Required last date."],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  last_bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isSold: {
    type: Boolean,
    default: false,
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
  ],
  cart: {
    items: [
      {
        commentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment",
          required: true,
        },
      },
    ],
  },
});

//-----------------------------------------------------

productSchema.methods.addToCart = function (comment) {
  const index = this.cart.items.findIndex((cp) => {
    return cp.commentId.toString() === comment._id.toString();
  });

  const updatedCartItems = [...this.cart.items];

  if (index >= 0) {
  } else {
    updatedCartItems.push({
      commentId: comment._id,
    });
  }

  this.cart = {
    items: updatedCartItems,
  };

  return this.save();
};

//-----------------------------------------------------

module.exports = mongoose.model("Product", productSchema);

//-----------------------------------------------------
