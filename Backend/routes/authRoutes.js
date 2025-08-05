const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utills/emailsevice");
require("dotenv").config(); // dotenv 

const router = express.Router();

// ✅ Function to get JWT Secret Key Safely
const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  return process.env.JWT_SECRET;
};

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (!name || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password:hashedPassword, role });

    await newUser.save();
    
    // const token = jwt.sign(
    //   { userId: newUser._id, role: newUser.role },
    //   getJwtSecret(),
    //   { expiresIn: "1h" }
    // );

    const token = jwt.sign(
      {
        userId: newUser._id,
        role: newUser.role,
        name: newUser.name, // ✅ Include name for reviews
        email: newUser.email, // optional but useful
      },
      getJwtSecret(),
      { expiresIn: "1h" }
    );
    res.status(201).json({ token, message: "User registered successfully" });

  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// ✅ Request OTP
router.post("/request-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    // Save OTP and expiration (e.g. 10 min)
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send email (example using your sendEmail util)
    await sendEmail(
      email,
      "Your TechTrove OTP for Password Reset",
      `Hi ${user.name},\n\nYour OTP for resetting your password is: ${otp}\n\nIt will expire in 10 minutes.`
    );

    res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("OTP send error:", error);
    res.status(500).json({ message: "Failed to send OTP." });
  }
});

// ✅ Reset Password with OTP
router.post("/reset-password-with-otp", async (req, res) => {
  const { email, newPassword, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    // Check if OTP is valid and not expired
    if (
      user.resetOtp !== otp ||
      !user.otpExpires ||
      user.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Clear OTP
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    console.error("Reset with OTP error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// // ✅ Reset Password by Email
// router.post("/reset-password", async (req, res) => {
//   const { email, newPassword } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ message: "User not found with this email." });
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedPassword;

//     await user.save();

//     res.status(200).json({ message: "Password updated successfully. Please login." });
//   } catch (error) {
//     console.error("Reset password error:", error);
//     res.status(500).json({ message: "Something went wrong." });
//   }
// });
// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== role) {
      return res.status(403).json({ message: "Invalid role selected" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    // const token = jwt.sign(
    //   { userId: user._id, role: user.role ,name:user.name},
    //   getJwtSecret(),
    //   { expiresIn: "1h" }
    // );

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      getJwtSecret(),
      { expiresIn: "1h" }
    );

    res.json({ token, message: "Login successful" });

  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
