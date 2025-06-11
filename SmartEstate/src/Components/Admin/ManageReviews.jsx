import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/admin/reviews", {
        withCredentials: true,
      });
      setReviews(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching reviews:", error.response || error);
      setError(
        `שגיאה בטעינת ביקורות: ${error.response?.data?.detail || error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = async (reviewId, currentValue) => {
    setActionInProgress(true);
    try {
      await axios.patch(
        `http://localhost:8000/admin/reviews/${reviewId}/visibility`,
        { is_visible: !currentValue },
        { withCredentials: true }
      );
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, is_visible: !currentValue } : r
        )
      );
    } catch (error) {
      console.error("שגיאה בעדכון :", error.response || error);
      alert("אירעה שגיאה בעדכון .");
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <div className="container mt-4" dir="rtl">
      <h2 className="mb-4">ניהול ביקורות</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {isLoading ? (
        <p>טוען ביקורות...</p>
      ) : reviews.length === 0 ? (
        <p>לא נמצאו ביקורות.</p>
      ) : (
        <div className="card">
          <div className="card-body">
            <button
              className="btn btn-primary mb-3"
              onClick={fetchReviews}
              disabled={actionInProgress}
            >
              רענן רשימת ביקורות
            </button>

            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="thead-dark">
                  <tr>
                    <th>מזהה</th>
                    <th>שם כותב</th>
                    <th>תוכן</th>
                    <th>דירוג</th>
                    <th>תאריך</th>
                    <th>מוצגת למשתמשים</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td>{review.id}</td>
                      <td>{review.author_name}</td>
                      <td>{review.content}</td>
                      <td>{review.rating}</td>
                      <td>
                        {new Date(review.created_at).toLocaleDateString(
                          "he-IL"
                        )}
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={review.is_visible}
                          onChange={() =>
                            toggleVisibility(review.id, review.is_visible)
                          }
                          disabled={actionInProgress}
                        />{" "}
                        {review.is_visible ? "מוצגת" : "מוסתרת"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReviews;
