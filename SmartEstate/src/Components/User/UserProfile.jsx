import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import axios from "axios";

const UserProfile = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [favorites, setFavorites] = useState([
    { id: 1, title: "דירה בתל אביב, 3 חדרים", address: "תל אביב" },
    { id: 2, title: "דירה בירושלים, 4 חדרים", address: "ירושלים" },
    { id: 3, title: "דירה בחיפה, 2 חדרים", address: "חיפה" },
  ]);
  const [review, setReview] = useState("");

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/user-preferences/",
          {
            withCredentials: true,
          }
        );
        setPreferences(response.data);
      } catch (error) {
        console.error("Error fetching preferences:", error);
      }
    };

    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    alert("תודה על המשוב שלך!");
    setReview("");
  };

  if (!user) {
    return (
      <div className="container mt-5">
        <h2>אנא התחבר כדי לצפות בפרופיל שלך</h2>
        <Link to="/login" className="btn btn-primary">
          התחברות
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="container mt-5" dir="rtl">
        <div className="row">
          {/* Personal Info */}
          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">פרטים אישיים</h5>
                <p>
                  <strong>שם:</strong> {user.first_name} {user.last_name}
                </p>
                <p>
                  <strong>אימייל:</strong> {user.email}
                </p>
                <Link
                  to="/update-profile"
                  className="btn btn-outline-primary w-100 mb-2"
                >
                  עריכת פרטים
                </Link>
                <Link
                  to="/change-password"
                  className="btn btn-outline-secondary w-100 mb-2"
                >
                  שינוי סיסמה
                </Link>
                <Link
                  to="/create-ad"
                  className="btn btn-outline-secondary w-100 mb-2"
                >
                  פרסום מודעת מכירה/השכרה
                </Link>
                <Link
                  to="/personal-questionnaire"
                  className="btn btn-primary w-100"
                  style={{
                    background: "linear-gradient(45deg, #2193b0, #6dd5ed)",
                    border: "none",
                  }}
                >
                  מילוי שאלון העדפות
                </Link>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="col-md-8 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">העדפות שלך</h5>
                {preferences ? (
                  <div className="preferences-list">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="card-title mb-0">העדפות שלך</h5>
                      <Link
                        to="/personal-questionnaire"
                        className="btn btn-outline-primary"
                        style={{
                          background:
                            "linear-gradient(45deg, #2193b0, #6dd5ed)",
                          border: "none",
                          color: "white",
                        }}
                      >
                        עדכן העדפות
                      </Link>
                    </div>
                    <p>
                      <strong>סוג נכס:</strong> {preferences.propertyType}
                    </p>
                    <p>
                      <strong>תקציב:</strong> {preferences.budget} ₪
                    </p>
                    <p>
                      <strong>מיקום מועדף:</strong> {preferences.location}
                    </p>
                    <p>
                      <strong>מספר חדרים:</strong> {preferences.rooms}
                    </p>
                    <p>
                      <strong>גודל:</strong> {preferences.size} מ"ר
                    </p>
                    <div className="mt-3">
                      <h6>דרישות נוספות:</h6>
                      <ul className="list-unstyled">
                        {preferences.parking && <li>✓ חניה</li>}
                        {preferences.elevator && <li>✓ מעלית</li>}
                        {preferences.balcony && <li>✓ מרפסת</li>}
                        {preferences.garden && <li>✓ גינה</li>}
                        {preferences.petsAllowed && <li>✓ מותר חיות מחמד</li>}
                        {preferences.accessibility && <li>✓ נגישות לנכים</li>}
                      </ul>
                    </div>
                    {preferences.additionalNotes && (
                      <div className="mt-3">
                        <h6>הערות נוספות:</h6>
                        <p>{preferences.additionalNotes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p>עדיין לא מילאת את שאלון ההעדפות</p>
                    <Link
                      to="/personal-questionnaire"
                      className="btn btn-primary"
                      style={{
                        background: "linear-gradient(45deg, #2193b0, #6dd5ed)",
                        border: "none",
                      }}
                    >
                      מלא שאלון עכשיו
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Favorites */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">דירות שמורות</h5>
                {favorites.length > 0 ? (
                  <ul className="list-group">
                    {favorites.map((item) => (
                      <li key={item.id} className="list-group-item">
                        <strong>{item.title}</strong> - {item.address}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>אין דירות שמורות עדיין</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="row">
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">השאר משוב</h5>
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      placeholder="כתוב את חוות דעתך על הפלטפורמה..."
                      rows="3"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-success">
                    שלח משוב
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
