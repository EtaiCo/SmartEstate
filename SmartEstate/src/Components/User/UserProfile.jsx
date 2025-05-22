import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import axios from "axios";
import ReviewModal from "./ReviewModal"; // Import the new component

const UserProfile = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [favorites] = useState([
    { id: 1, title: "דירה בתל אביב, 3 חדרים", address: "תל אביב" },
    { id: 2, title: "דירה בירושלים, 4 חדרים", address: "ירושלים" },
    { id: 3, title: "דירה בחיפה, 2 חדרים", address: "חיפה" },
  ]);

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

  const hasPreferences =
    preferences &&
    (preferences.who ||
      preferences.houseType ||
      preferences.rooms ||
      (preferences.features && preferences.features.length > 0) ||
      (preferences.importantLayers && preferences.importantLayers.length > 0) ||
      preferences.location ||
      preferences.budgetMin ||
      preferences.budgetMax);

  if (!user) {
    return (
      <div className="container mt-5">
        <h2>אנא התחבר כדי לצפות בפרופיל שלך</h2>
        <Link to="/login" className="btn btn-warning">
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
                <Link to="/update-profile" className="btn btn-outline-warning rounded-pill w-100 mb-2">
                  עריכת פרטים
                </Link>
                <Link to="/change-password" className="btn btn-outline-warning rounded-pill w-100 mb-2">
                  שינוי סיסמה
                </Link>
                <Link to="/create-ad" className="btn btn-outline-warning rounded-pill w-100 mb-2">
                  פרסום מודעת מכירה/השכרה
                </Link>
                <Link to="/personal-questionnaire" className="btn btn-warning rounded-pill w-100">
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
                {hasPreferences ? (
                  <div className="preferences-list">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="card-title mb-0">העדפות שלך</h5>
                      <Link
                            to="/personal-questionnaire"
                            className="btn btn-warning rounded-pill w-100"
                          >
                            עדכן העדפות
                          </Link>

                    </div>
                    <p>
                      <strong>למי מחפשים:</strong> {preferences.who || "לא נבחר"}
                    </p>
                    <p>
                      <strong>סוג בית:</strong> {preferences.houseType || "לא נבחר"}
                    </p>
                    <p>
                      <strong>מספר חדרים:</strong> {preferences.rooms || "לא נבחר"}
                    </p>
                    <p>
                      <strong>תוספות:</strong>{" "}
                      {preferences.features && preferences.features.length > 0
                        ? preferences.features.join(", ")
                        : "אין"}
                    </p>
                    <p>
                      <strong>מה חשוב שיהיה קרוב:</strong>{" "}
                      {preferences.importantLayers && preferences.importantLayers.length > 0
                        ? preferences.importantLayers.join(", ")
                        : "לא נבחר"}
                    </p>
                    <p>
                      <strong>מיקום:</strong> {preferences.location || "לא נבחר"}
                    </p>
                    <p>
                      <strong>תקציב:</strong>{" "}
                      {preferences.budgetMin && preferences.budgetMax
                        ? `${preferences.budgetMin} - ${preferences.budgetMax} ₪`
                        : "לא נבחר"}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p>עדיין לא מילאת את שאלון ההעדפות</p>
                    <Link to="/personal-questionnaire" className="btn btn-warning">
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
    <ReviewModal />
  </div>
</div>
      </div>
    </>
  );
};

export default UserProfile;
