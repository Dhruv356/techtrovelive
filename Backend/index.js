import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js"; // 🛠️ Add .js at the end for local imports
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import productRoutes from "./routes/productroute.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dhruv = path.resolve();

// Middleware
app.use(cors());
app.use(express.json());  // No cookie-parser required

// Serve images from the uploads directory
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", uploadRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", adminRoutes);
app.use("/api/review", reviewRoutes);

// Serve frontend
app.use(express.static(path.join(__dhruv, "/techtrove/build"))); // Serve from "build" folder if using React
app.get("*", (req, res) => {
  res.sendFile(path.join(__dhruv, "techtrove", "build", "index.html")); // Updated to "build" folder
});

// Connect to DB & Start Server
connectDB();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
