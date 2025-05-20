// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'Ready', 'Delivered'], default: 'Pending' },
  liked: { type: Boolean, default: false }
});

module.exports = mongoose.model('Order', orderSchema);
