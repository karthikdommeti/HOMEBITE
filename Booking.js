const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: String,
  customerMobile: String,
  customerAddress: String,
  status: { type: String, default: 'Pending' },
  liked: { type: Boolean, default: false }
});
module.exports = mongoose.model('Booking', bookingSchema);

