import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import axios from "axios";
import ReviewModal from "./ReviewModal";

const UserProfile = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [likedAds, setLikedAds] = useState([]);
  const [loading, setLoading] = useState(false);

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

    const fetchLikedAds = async () => {
      try {
        setLoading(true);
        // First get the liked ad IDs
        const likedResponse = await fetch("http://localhost:8000/likes/", {
          credentials: "include",
        });
        
        if (!likedResponse.ok) {
          throw new Error("Failed to fetch liked ads");
        }
        
        const likedData = await likedResponse.json();
        
        if (likedData.length > 0) {
          // Then fetch all ads
          const adsResponse = await axios.get("http://localhost:8000/ads", {
            withCredentials: true,
          });
          
          if (adsResponse.status === 200) {
            // Filter ads to only include liked ones
            const likedAdIds = likedData.map(like => like.ad_id);
            const filteredAds = adsResponse.data.filter(ad => 
              likedAdIds.includes(ad.id)
            );
            setLikedAds(filteredAds);
          }
        } else {
          setLikedAds([]);
        }
      } catch (error) {
        console.error("Error fetching liked ads:", error);
        setLikedAds([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPreferences();
      fetchLikedAds();
    }
  }, [user]);

  const handleUnlike = async (adId) => {
    try {
      const response = await fetch(`http://localhost:8000/like/${adId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        // Remove the ad from the liked ads list
        setLikedAds(prev => prev.filter(ad => ad.id !== adId));
      } else {
        const data = await response.json();
        alert(data.detail || "שגיאה בהסרה ממועדפים");
      }
    } catch (error) {
      console.error("Error unliking ad:", error);
      alert("שגיאת רשת");
    }
  };

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

        {/* Liked Ads */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">דירות שמורות ({likedAds.length})</h5>
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">טוען...</span>
                    </div>
                  </div>
                ) : likedAds.length > 0 ? (
                  <div className="row">
                    {likedAds.map((ad) => (
                      <div key={ad.id} className="col-md-6 col-lg-4 mb-3">
                        <div className="card border-warning h-100">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="card-title">
                                {ad.property_type === "apartment" && "דירה"}
                                {ad.property_type === "house" && "בית פרטי"}
                                {ad.property_type === "penthouse" && "פנטהאוס"}
                                {ad.property_type === "studio" && "סטודיו"}
                                {" "}
                                {ad.rooms} חדרים
                              </h6>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleUnlike(ad.id)}
                                title="הסר ממועדפים"
                              >
                                <i className="bi bi-heart-fill"></i> ❤️
                              </button>
                            </div>
                            <p className="card-text small text-muted mb-2">
                              {ad.address}
                            </p>
                            <p className="card-text">
                              <strong>₪{ad.price.toLocaleString()}</strong>
                            </p>
                            <div className="small text-secondary mb-2">
                              {ad.ad_type} | {ad.size} מ"ר | קומה {ad.floor ?? "?"}
                            </div>
                            
                            {/* Property features */}
                            <div className="mb-2">
                              {ad.has_parking && <span className="badge bg-secondary me-1">חניה</span>}
                              {ad.has_balcony && <span className="badge bg-secondary me-1">מרפסת</span>}
                              {ad.has_garden && <span className="badge bg-secondary me-1">גינה</span>}
                              {ad.pets_allowed && <span className="badge bg-secondary me-1">חיות מחמד</span>}
                              {ad.has_elevator && <span className="badge bg-secondary me-1">מעלית</span>}
                              {ad.accessibility && <span className="badge bg-secondary me-1">נגישות</span>}
                            </div>

                            <div className="mt-auto">
                              <Link
                                to={`/ad/${ad.id}`}
                                className="btn btn-outline-warning btn-sm w-100"
                              >
                                צפה בפרטים
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">אין דירות שמורות עדיין</p>
                    <Link to="/app" className="btn btn-warning">
                      עבור למפה לחיפוש דירות
                    </Link>
                  </div>
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