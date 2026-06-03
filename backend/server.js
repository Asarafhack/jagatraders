const express = require("express");
const cors = require("cors");
require("dotenv").config();

const paymentRoutes = require("./routes/payment");
const orderRoutes = require("./routes/order");

// FIXED: Changed "../utils/generateInvoice" to "./utils/generateInvoice"
// because the utils folder is in the same directory as server.js
const generateInvoice = require("./utils/generateInvoice");

const app = express();

// Enable CORS for your frontend development environment
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/payment", paymentRoutes);
app.use("/api/order", orderRoutes);

// Establish server port fallback listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});