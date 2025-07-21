const mongoose = require("mongoose");

const DishSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dishName: { type: String, required: true },
  dishPhoto: { type: String, required: true },
  price: { type: Number, required: true },
  contactNumber: { type: String, required: true },
  type: { type: String, enum: ['veg', 'nonveg'], required: true },
  likes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Dish", DishSchema);
