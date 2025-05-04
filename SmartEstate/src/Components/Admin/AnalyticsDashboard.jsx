import React, { useState } from "react";
import UserAnalytics from "./UserAnalytics";
import ApartmentAnalytics from "./ApartmentAnalytics";
import ReviewsAnalytics from "./ReviewsAnalytics";

const AnalyticsDashboard = () => {
  const [selectedView, setSelectedView] = useState("user");

  const renderSelectedAnalytics = () => {
    switch (selectedView) {
      case "user":
        return <UserAnalytics />;
      case "apartment":
        return <ApartmentAnalytics />;
      case "reviews":
        return <ReviewsAnalytics />;
      default:
        return <UserAnalytics />;
    }
  };

  return (
    <div className="container mt-4" dir="rtl">
      <h2 className="mb-4">דוחות ניתוח נתונים</h2>

      <div className="mb-4">
        <select
          className="form-select"
          value={selectedView}
          onChange={(e) => setSelectedView(e.target.value)}
        >
          <option value="user">משתמשים</option>
          <option value="apartment">מודעות נדל"ן</option>
          <option value="reviews">חוות דעת</option>
        </select>
      </div>

      {renderSelectedAnalytics()}
    </div>
  );
};

export default AnalyticsDashboard;
