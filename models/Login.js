const mongoose = require("mongoose");

const loginSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, "Required email."],
  },
  password: {
    type: String,
    required: [true, "Required password."],
  },
});

module.exports = mongoose.model("Login", loginSchema);
