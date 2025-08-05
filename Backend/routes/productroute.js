const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ Add this line
const Review = require("../models/Review"); // ✅ Import the Review model

// Configure Multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save files in the uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Unique file names
  },
});
const upload = multer({ storage: storage });

// ✅ POST: Add a new product (Only Sellers)
router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    if (req.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can add products" });
    }

    const { productName, description, price, category, modelNumber, color, size } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!productName || !price || !description || !category || !modelNumber || !color) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newProduct = new Product({
      productName,
      modelNumber, // ✅ Grouping products by model number
      description,
      price,
      category,
      color,
      size,
      imageUrl,
      sellerId: req.userId
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", newProduct });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Failed to add product", error });
  }
});


// ✅ GET: Seller's own products
router.get("/my-products", authMiddleware, async (req, res) => {
  try {
    if (req.role !== "seller") {
      return res.status(403).json({ message: "Access denied" });
    }

    const products = await Product.find({ sellerId: req.userId });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({ message: "Failed to fetch products", error });
  }
});


router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Allow deletion if the user is an admin OR the seller who added the product
    if (req.role !== "admin" && req.userId !== product.sellerId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product", error });
  }
});
// cout total number of product by seller
router.get("/seller/count", authMiddleware, async (req, res) => {
  try {
    const sellerId = req.userId; // ✔️ matches your current middleware

    const count = await Product.countDocuments({ sellerId }); // 🔄 use sellerId not seller
    res.json({ totalProducts: count });
  } catch (err) {
    console.error("Error counting products:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET: Fetch all products (Admin & Users)
// ✅ GET: Fetch all products (Admin & Users)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("sellerId", "name email"); // ✅ Show seller details
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean(); // ✅ Use .lean() for better performance

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Provide default values for old products
    const productWithDefaults = {
      ...product,
      modelNumber: product.modelNumber || "N/A", // Default model number
      color: product.color || "Unknown",        // Default color
      size: product.size || "N/A"  ,
      // reviews: product.reviews || [] // ✅ Ensure reviews are always returned             // Default size
    };

    // ✅ Fetch related products only if modelNumber is valid
    const relatedProducts =
      productWithDefaults.modelNumber && productWithDefaults.modelNumber !== "N/A"
        ? await Product.find({
            modelNumber: productWithDefaults.modelNumber,
            _id: { $ne: productWithDefaults._id } // Exclude the current product
          }).lean()
        : [];

    res.json({ product: productWithDefaults, relatedProducts });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// ✅ Update product by ID
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { productName, price, category } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { productName, price, category },
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ message: "Product not found." });

    res.json({ message: "Product updated successfully.", updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ message: "Failed to update product." });
  }
});


// router.post('/:id/reviews', authMiddleware, async (req, res) => {
//   const { rating, comment } = req.body;
//   const productId = req.params.id;

//   try {
//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     // ✅ Create and save the review
//     const review = new Review({
//       product: product._id,
//       user: req.userId,
//       name: req.name,
//       rating: Number(rating),
//       comment,
//     });

//     await review.save();

//     // ✅ Fetch all reviews again to calculate rating
//     const allReviews = await Review.find({ product: product._id });

//     const newAverageRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

//     // ✅ Only update these 2 fields
//     product.rating = newAverageRating;
//     product.numReviews = allReviews.length;

//     // ✅ Confirm required fields still exist before saving
//     // if (!product.modelNumber || !product.color) {
//     //   console.error('Required product fields missing:', {
//     //     modelNumber: product.modelNumber,
//     //     color: product.color,
//     //   });
//     //   return res.status(500).json({ message: 'Product data is incomplete. Cannot update rating.' });
//     // }

//     await product.save();

//     res.status(201).json({ message: 'Review added successfully' });
//   } catch (error) {
//     console.error('❌ Error submitting review:', {
//       message: error.message,
//       full: error,
//     });
//     res.status(500).json({ message: 'Server Error' });
//   }
// });



// // 👇 GET /api/products/:id/reviews - fetch all reviews for a product
// router.get('/:id/reviews', async (req, res) => {
//   try {
//     const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 }); // optional: latest first
//     res.json(reviews);
//   } catch (err) {
//     console.error('Error fetching reviews:', err);
//     res.status(500).json({ message: 'Failed to fetch reviews' });
//   }
// });


module.exports = router;
