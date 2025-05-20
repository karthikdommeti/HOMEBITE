const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: String,
    age: Number,
    email: { type: String, unique: true, required: true },
    password: String,
    mobile: String,
    userType: String,
    address: String,
    likes: { type: Number, default: 0 }

}, { timestamps: true });


module.exports = mongoose.model("User", UserSchema);
