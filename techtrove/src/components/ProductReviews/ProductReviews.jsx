import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import StarRating from './starRating';
import './product-review.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ProductScreen = () => {
  const { id: productId } = useParams();
  const [product, setProduct] = useState({});
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false); // Toggle for showing all reviews
  const [showReviewForm, setShowReviewForm] = useState(false); // Toggle for showing the review form

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`https://techtrovelive.onrender.com/api/products/${productId}`);
        setProduct(data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      }
    };
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`https://techtrovelive.onrender.com/api/review/${productId}`);
        setReviews(data);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };
    
    const savedUserToken = sessionStorage.getItem('token');
    if (savedUserToken) {
      setUserInfo({ token: savedUserToken });
    }

    fetchProduct();
    fetchReviews();
  }, [productId]);
  const submitHandler = async (e) => {
    e.preventDefault();
  
    if (!userInfo || !userInfo.token) {
      toast.error('You must be logged in to submit a review');
      return;
    }
  
    try {
      await axios.post(
        `https://techtrovelive.onrender.com/api/review/${productId}`,
        { rating, comment },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
  
      // ✅ Fix endpoint to match the one in useEffect:
      const { data: updatedReviews } = await axios.get(`https://techtrovelive.onrender.com/api/review/${productId}`);
      setReviews(updatedReviews);
  
      // ✅ Reset the form
      setRating(0);
      setComment('');
      setShowReviewForm(false);
  
      toast.success('Review added successfully! 🎉');
    } catch (error) {
      console.error(error); // log for debugging
      toast.error(
        error.response?.data?.message || 'Failed to submit review. Please try again.'
      );
    }
  };
  
  

  // Sort reviews by rating in descending order
  const sortedReviews = [...reviews].sort((a, b) => b.rating - a.rating);

  // Determine how many reviews to show
  const displayedReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 2);

  return (
    <div className="product-reviews">
      <h2>{product.name}</h2>

      <h2>{product.numReviews} Reviews</h2>

      <hr />


      {userInfo && !showReviewForm && (
        <button
          onClick={() => setShowReviewForm(true)}
          style={{
            backgroundColor: '#F84040',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: '600',
            marginBottom: '20px',
          }}
        >
          Write a Review
        </button>
      )}

      {showReviewForm && userInfo ? (
        <form onSubmit={submitHandler}>
          <label>Rating</label>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} required>
            <option value="">Select...</option>
            <option value="1">⭐ 1 - Terrible</option>
            <option value="2">⭐ 2 - Bad</option>
            <option value="3">⭐ 3 - Okay</option>
            <option value="4">⭐ 4 - Good</option>
            <option value="5">⭐ 5 - Excellent</option>
          </select>

          <label>Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          ></textarea><br />

          <button type="submit" style={{
            backgroundColor: '#F84040',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: '600',
            marginBottom: '20px',
          }}>Submit Review</button>
        </form>
      ) : (
        !userInfo && <p>Please <a href="/login">login</a> to write a review</p>
      )}

      <hr />

      <h6>Reviews</h6>
      {reviews.length === 0 ? (
        <p className="no-reviews">No reviews yet</p>
      ) : (
        <>
          <div className="rates">
            {displayedReviews.map((review) => (
              <div className="rate-comment" key={review._id}>
                <span>{review.name}</span>
                <StarRating value={review.rating} />
                <span>{review.comment}</span>
                <small>{new Date(review.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
          </div>

          {reviews.length > 2 && (
            <div style={{ marginTop: '15px' }}>
              <button
                onClick={() => setShowAllReviews((prev) => !prev)}
                style={{
                  backgroundColor: '#F84040',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                {showAllReviews ? 'Show Less' : 'Show All Reviews'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductScreen;
