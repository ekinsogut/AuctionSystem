const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Required name."],
    minlength: [5, "Name must be at least 5 characters."],
    maxlength: [20, "Name must be a maximum of 20 characters."],
  },
  description: {
    type: String,
    required: [true, "Required description."],
    minlength: [10, "Description must be at least 20 characters."],
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Category", categorySchema);
