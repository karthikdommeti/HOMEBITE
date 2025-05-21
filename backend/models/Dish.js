
const mongoose = require("mongoose");

const DishSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dishName: String,
    dishPhoto: String,
    price: Number,
    contactNumber: String,
    type: { type: String, enum: ['veg', 'nonveg'], required: true },
    likes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Dish", DishSchema);
