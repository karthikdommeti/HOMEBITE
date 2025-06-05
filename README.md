# 🍽️ HomeBite – Home Food Delivery Platform

**HomeBite** is a full-stack web application that connects food vendors and customers for easy and direct home-cooked meal delivery. 
Built using **HTML, CSS, JavaScript, Node.js, Express, and MongoDB**,
the platform enables users to register as either vendors or customers, upload dishes, place orders, and manage order statuses.

---

## 🌐 Live Demo

👉 [Visit HomeBite](https://homebite.netlify.app)

---

## 📌 Features

### 👥 User Roles:
- **Customer**
  - Browse veg/non-veg dishes
  - Book dishes
  - Track order status (Pending → Ready → Delivered)
  - Confirm delivery and optionally like the dish

- **Vendor**
  - Upload new dishes
  - View all received orders
  - Mark orders as ready for delivery
  - Gain likes from customers

### 🛠️ Backend Features:
- Authentication using **JWT tokens**
- Password encryption with **bcrypt**
- RESTful API using **Express.js**
- Data persistence with **MongoDB + Mongoose**
- OTP email verification using **EmailJS**
- Image support via public URLs (Google Photos, etc.)

---

## ⚙️ Technologies Used

| Area         | Technology              |
|--------------|-------------------------|
| Frontend     | HTML, CSS, JavaScript   |
| Backend      | Node.js, Express.js     |
| Database     | MongoDB (with Mongoose) |
| Auth/Security| JWT, bcrypt             |
| Hosting      | Netlify (frontend), Render (backend) |
| Email OTP    | EmailJS API             |

---

## 🗂️ Project Structure
/backend
├── models/
│ ├── User.js
│ ├── Dish.js
│ └── Booking.js
├── server.js
└── .env

/frontend
├── index.html
├── customer.html
└── vendordashboard.html
