const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  userImg: {
    type: String,
    required: true,
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  commentContent: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Comment", commentSchema);
