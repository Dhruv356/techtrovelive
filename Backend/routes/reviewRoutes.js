const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Review = require("../models/Review");
const authMiddleware = require("../middleware/authMiddleware");

// POST /api/review/:id - Submit a review
router.post('/:id', authMiddleware, async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = new Review({
      product: product._id,
      user: req.userId,
      name: req.name,
      rating: Number(rating),
      comment,
    });

    await review.save();

    const allReviews = await Review.find({ product: product._id });
    const newAverageRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    product.rating = newAverageRating;
    product.numReviews = allReviews.length;

    await product.save();
   
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('❌ Error submitting review:', error.message);
    res.status(500).json({ message: 'Server Error' });
    
  }
});

// GET /api/review/:id - Get all reviews for a product
router.get('/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

module.exports = router;
