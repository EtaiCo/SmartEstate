import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../index.css"; // Ensure you have the correct path to your CSS file

const ReviewsCarousel = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchVisibleReviews();
  }, []);

  const fetchVisibleReviews = async () => {
    try {
      const response = await axios.get("http://localhost:8000/reviews/visible");
      setReviews(response.data);
    } catch (error) {
      console.error("שגיאה בטעינת ביקורות", error);
    }
  };

  const grouped = [];
  for (let i = 0; i < reviews.length; i += 2) {
    grouped.push(reviews.slice(i, i + 2));
  }

  return (
    <section className="bg-white py-5 border-top" dir="rtl">
      <div className="container">
        <h2 className="text-center mb-4">מה המשתמשים שלנו אומרים</h2>
        <div className="reviews-carousel-wrapper">
          <div
            id="reviewsCarousel"
            className="carousel slide"
            data-bs-ride="carousel"
          >
            <div className="carousel-inner">
              {grouped.map((group, i) => (
                <div
                  className={`carousel-item ${i === 0 ? "active" : ""}`}
                  key={i}
                >
                  <div className="row g-4">
                    {group.map((review) => (
                      <div className="col-md-6" key={review.id}>
                        <div className="card h-100 shadow-sm">
                          <div className="card-body d-flex flex-column">
                            {/* דירוג */}
                            <div className="mb-3">
                              {[...Array(5)].map((_, idx) => (
                                <i
                                  key={idx}
                                  className={`${
                                    idx < review.rating ? "fas" : "far"
                                  } fa-star text-warning`}
                                ></i>
                              ))}
                            </div>

                            {/* תוכן */}
                            <p className="card-text mb-3">{review.content}</p>

                            {/* שם */}
                            <div className="blockquote-footer mt-auto text-end">
                              {review.author_name}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* כפתורי ניווט */}
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#reviewsCarousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon"></span>
            <span className="visually-hidden">הקודם</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#reviewsCarousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon"></span>
            <span className="visually-hidden">הבא</span>
          </button>
          {/* אינדיקטורים */}
          <div className="carousel-indicators">
            {grouped.map((_, i) => (
              <button
                key={i}
                type="button"
                data-bs-target="#reviewsCarousel"
                data-bs-slide-to={i}
                className={i === 0 ? "active" : ""}
                aria-current={i === 0 ? "true" : "false"}
                aria-label={`Slide ${i + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsCarousel;
