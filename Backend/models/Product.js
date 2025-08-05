const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  modelNumber: { type: String, required: false }, // ✅ Link different variants of the same product
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String },
  color: { type: String, required: false }, // ✅ Store color separately
  size: { type: String }, // ✅ Store size separately (if applicable)
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  discount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  rating: { type: Number, default: 0 },
numReviews: { type: Number, default: 0 },

});

module.exports = mongoose.model("Product", productSchema);
