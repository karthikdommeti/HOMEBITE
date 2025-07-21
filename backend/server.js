    const express = require("express");
    const mongoose = require("mongoose");
    const cors = require("cors");
    const bcrypt = require("bcrypt");
    const jwt = require("jsonwebtoken");
    const dotenv = require("dotenv");

    dotenv.config();

    const app = express();
    app.use(express.json());
    app.use(cors());

    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => console.log("MongoDB Connected Successfully!"))
    .catch(err => console.log("MongoDB Connection Error:", err));

    const SECRET_KEY = "your_secret_key"; // use process.env.SECRET_KEY ideally

    // Import Models
    const User = require("./models/User");  
    const Dish = require("./models/Dish");
    const Booking = require("./models/Booking");
    const Order = require("./models/Order");

    // Middleware
    const verifyToken = (req, res, next) => {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Access Denied: No Token Provided" });

        try {
            const verified = jwt.verify(token, SECRET_KEY);
            req.user = verified;
            next();
        } catch (error) {
            res.status(403).json({ message: "Invalid or Expired Token" });
        }
    };


// Email existence check for OTP step
app.post("/check-email", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }

    } catch (error) {
        res.status(500).json({ message: "Error checking email" });
    }
});


    // Add this route to your backend (e.g., auth.js)
    app.post('/check-email', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        res.status(200).json({ exists: !!user }); // Don't send error code for existing
    } catch (err) {
        console.error("Email check error:", err);
        res.status(500).json({ message: "Server error" });
    }
});


    app.post("/register", async (req, res) => {
        try {
            const { name, age, email, password, mobile, userType, address } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "Email already registered" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({
                name,
                age,
                email,
                password: hashedPassword,
                mobile,
                userType,
                address,
                likes: 0
            });

            await newUser.save();
            res.status(201).json({ message: "Registration successful!" });
        } catch (error) {
            res.status(500).json({ message: "Server error during registration" });
        }
    });

    // Login
    app.post("/login", async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Incorrect password" });
            }

            const expiresIn = 2 * 60 * 60; // 2 hours
            const token = jwt.sign({ userId: user._id, exp: Math.floor(Date.now() / 1000) + expiresIn }, SECRET_KEY);

            res.status(200).json({
                message: "Login successful",
                token,
                userType: user.userType,
                expiresIn: expiresIn * 1000,
            });

        } catch (error) {
            res.status(500).json({ message: "Server error during login" });
        }
    });

    // Protected route example
    app.get("/protected", verifyToken, (req, res) => {
        res.json({ message: "Access granted to protected route", user: req.user });
    });

    // GET /api/dishes/vendor
    app.get("/vendor/my-dishes", verifyToken, async (req, res) => {
    try {
        const dishes = await Dish.find({ vendorId: req.user.userId  });
        res.json(dishes);
    } catch (err) {
        res.status(500).json({ error: "Error fetching vendor dishes" });
    }
    });


    // Upload Dish (Vendor)
    app.post("/vendor/upload", verifyToken, async (req, res) => {
        try {
            const { dishName, dishPhoto, price, contactNumber, type } = req.body;

            // Validate all fields
            if (!dishName || !dishPhoto || !price || !contactNumber || !type) {
                return res.status(400).json({ message: "All fields are required" });
            }

            // Validate dish type
            if (!(type === "veg" || type === "nonveg")) {
                return res.status(400).json({ message: "Invalid dish type (must be veg or nonveg)" });
            }

            const newDish = new Dish({
                vendorId: req.user.userId,
                dishName,
                dishPhoto,
                price,
                contactNumber,
                type: type.toLowerCase(), // always save lowercased
                likes: 0 // initialize likes to 0
            });

            await newDish.save();

            res.status(201).json({ message: "Dish uploaded successfully!" });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error uploading dish" });
        }
    });



    // Get all Dishes (Customer)
    app.get("/customer/dishes", async (req, res) => {
        try {
            const dishes = await Dish.find().populate('vendorId', 'name mobile address likes');
            res.status(200).json(dishes);
        } catch (error) {
            res.status(500).json({ message: "Server error fetching dishes" });
        }
    });

    // ✅ Booking a Dish (old bookings system you already had)
    app.post("/book-dish", verifyToken, async (req, res) => {
        try {
            const { vendorId, customerName, customerMobile, customerAddress, dishName } = req.body;
            const newBooking = new Booking({ vendorId, customerName, customerMobile, customerAddress, dishName });
            await newBooking.save();
            res.status(201).json({ message: toast('Here is your toast.') });
        } catch (error) {
            res.status(500).json({ message: "Server error while booking dish" });
        }
    });

    // ✅ Vendor fetches all orders (old)
    app.get("/vendor/orders", verifyToken, async (req, res) => {
    try {
        const orders = await Booking.find({ vendorId: req.user.userId }).populate('dishId');
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error while fetching orders" });
    }
    });

    app.post("/customer/book", verifyToken, async (req, res) => {
    try {
        const { dishId } = req.body;
        const dish = await Dish.findById(dishId).populate('vendorId');

        if (!dish) return res.status(404).json({ message: "Dish not found" });

        const customer = await User.findById(req.user.userId);

        const booking = new Booking({
        dishId: dish._id,
        vendorId: dish.vendorId._id,
        customerId: customer._id,
        customerName: customer.name,
        customerMobile: customer.mobile,
        customerAddress: customer.address,
        });

        await booking.save();

        res.status(201).json({ message:"Dish booked successfully!", booking });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error while booking dish" });
    }
    });



    // Vendor marks Order as Ready
   app.post("/vendor/mark-ready", verifyToken, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Booking.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "Ready";
    await order.save();

    res.status(200).json({ message: "Order marked as ready" });
  } catch (error) {
    console.error("Error marking ready:", error);
    res.status(500).json({ message: "Server error while marking order as ready" });
  }
});


    // Customer confirms delivery + optional like
   app.post("/customer/confirm-delivery", verifyToken, async (req, res) => {
  try {
    const { orderId, liked } = req.body;

    const order = await Booking.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ Always mark as Delivered
    order.status = "Delivered";

    // ✅ Handle Like (only once)
    if (liked && !order.liked) {
      order.liked = true;

      const dish = await Dish.findById(order.dishId);
      if (dish) {
        dish.likes = (dish.likes || 0) + 1;
        await dish.save();
      }
    } else if (!liked) {
      // ✅ Explicitly mark as not liked
      order.liked = false;
    }

    await order.save();
    res.json({ message: "Order updated" });

  } catch (error) {
    console.error("Delivery error:", error);
    res.status(500).json({ message: "Error confirming delivery" });
  }
});


    // Customer fetches their orders
    app.get("/customer/orders", verifyToken, async (req, res) => {
  try {
    const orders = await Booking.find({ customerId: req.user.userId }).populate('dishId');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching customer orders" });
  }
});

    // Vendor fetches their orders
    app.get("/vendor/all-orders", verifyToken, async (req, res) => {
        try {
            const orders = await Order.find({ vendorId: req.user.userId }).populate('dishId customerId');
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    });

    // GET dishes by vendor ID
    app.get('/api/dishes/vendor/:vendorId', async (req, res) => {
    try {
        const vendorId = req.params.vendorId;
        const dishes = await Dish.find({ vendorId: vendorId });
        res.status(200).json(dishes);
    } catch (error) {
        console.error("Error fetching vendor dishes:", error);
        res.status(500).json({ message: "Failed to fetch vendor dishes" });
    }
    });
    // Delete Dish (Vendor)
    app.delete("/vendor/delete-dish/:id", verifyToken, async (req, res) => {
        try {
            const dishId = req.params.id;
            const dish = await Dish.findById(dishId);

            if (!dish) {
                return res.status(404).json({ message: "Dish not found" });
            }

            if (dish.vendorId.toString() !== req.user.userId) {
                return res.status(403).json({ message: "You are not authorized to delete this dish" });
            }

            await Dish.findByIdAndDelete(dishId);
            res.status(200).json({ message: "Dish deleted successfully" });
        } catch (error) {
            console.error("Error deleting dish:", error);
            res.status(500).json({ message: "Server error while deleting dish" });
        }   });


    // Server start
    const PORT = 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
