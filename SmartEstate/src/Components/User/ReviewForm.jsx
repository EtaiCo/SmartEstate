import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const ReviewForm = ({ closeModal }) => {
  const { user } = useAuth();
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!review.trim()) {
      alert("אנא הכנס טקסט למשוב");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(
        "http://localhost:8000/reviews/",
        { content: review, rating },
        { withCredentials: true }
      );

      alert("תודה על המשוב שלך!");
      setReview("");
      setRating(5);
      closeModal?.(); // ✅ Close modal if provided
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("אירעה שגיאה בשליחת המשוב");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = () => {
    const activeRating = hoverRating || rating;
    switch (activeRating) {
      case 1: return "לא מרוצה";
      case 2: return "סביר";
      case 3: return "טוב";
      case 4: return "טוב מאוד";
      case 5: return "מצוין!";
      default: return "";
    }
  };

  const StarRating = ({ value, onChange }) => (
    <div className="rating-container mb-3">
      <div
        className="star-rating d-flex justify-content-center align-items-center"
        style={{
          background: "linear-gradient(45deg, rgba(255,215,0,0.1), rgba(255,215,0,0.05))",
          borderRadius: "12px",
          padding: "15px 10px",
          position: "relative",
          boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className="star-wrapper mx-1"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => onChange(star)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onChange(star);
            }}
            tabIndex={0}
            role="button"
            aria-label={`דירוג ${star} מתוך 5 כוכבים`}
            style={{
              cursor: "pointer",
              position: "relative",
              transform: `scale(${star === (hoverRating || value) ? 1.3 : 1})`,
              transition: "all 0.3s ease",
            }}
          >
            <span
              style={{
                color: star <= (hoverRating || value) ? "#FFD700" : "#e4e5e9",
                fontSize: "32px",
                filter: star <= (hoverRating || value)
                  ? "drop-shadow(0 0 3px rgba(255,215,0,0.7))"
                  : "none",
                transition: "all 0.3s ease",
              }}
            >
              ★
            </span>
          </div>
        ))}
        <div
          className="rating-label text-center mt-2 position-absolute"
          style={{
            bottom: "-30px",
            left: "0",
            width: "100%",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#333",
            opacity: hoverRating || rating ? 1 : 0,
            transform: `translateY(${hoverRating || rating ? 0 : -10}px)`,
            transition: "all 0.3s ease",
          }}
        >
          {getRatingLabel()}
        </div>
      </div>
    </div>
  );

  return (
    
      

      <div className="card-body" style={{ padding: "25px" }} dir="rtl">
        <form onSubmit={handleReviewSubmit}>
          <div className="mb-4 mt-3">
            <label className="form-label d-block text-center mb-4">
              כיצד היית מדרג את החוויה שלך?
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className="mb-4 mt-5">
            <textarea
              className="form-control"
              placeholder="כתוב את חוות דעתך על הפלטפורמה..."
              rows="4"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              required
              style={{
                borderRadius: "8px",
                padding: "12px",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="btn btn-outline-warning rounded-pill px-4"
              disabled={isSubmitting || !user}
              style={{
                fontWeight: "600",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                opacity: isSubmitting || !user ? 0.7 : 1,
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  שולח...
                </>
              ) : (
                "שלח משוב"
              )}
            </button>
          </div>

          {!user && (
            <div className="alert alert-warning mt-3 text-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              יש להתחבר כדי להשאיר משוב
            </div>
          )}
        </form>
      </div>
    
  );
};

export default ReviewForm;
