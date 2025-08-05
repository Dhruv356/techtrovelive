// src/components/ProductReviews/starRating.jsx
import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({ value }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="star-rating">
      {stars.map((star) => (
        <span key={star}>
          {value >= star ? (
            <FaStar color="#ffcd4e" />
          ) : value >= star - 0.5 ? (
            <FaStarHalfAlt color="#ffcd4e" />
          ) : (
            <FaRegStar color="#ffcd4e" />
          )}
        </span>
      ))}
    </div>
  );
};

export default StarRating;
