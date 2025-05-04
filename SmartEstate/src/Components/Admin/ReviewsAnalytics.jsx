import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ReviewsAnalytics = () => {
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState([]);
  const [reviewsByDate, setReviewsByDate] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get("http://localhost:8000/reviews/", {
          withCredentials: true,
        });
        setReviews(response.data);
        generateStats(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    const generateStats = (reviewsData) => {
      // Rating Distribution
      const ratingCount = {};
      reviewsData.forEach((review) => {
        ratingCount[review.rating] = (ratingCount[review.rating] || 0) + 1;
      });
      const ratingStatsFormatted = Object.entries(ratingCount).map(
        ([rating, count]) => ({
          name: `${rating} כוכבים`,
          value: count,
        })
      );
      setRatingStats(ratingStatsFormatted);

      // Reviews by Date
      const dateMap = {};
      reviewsData.forEach((review) => {
        const date = review.created_at?.split("T")[0];
        if (date) {
          dateMap[date] = (dateMap[date] || 0) + 1;
        }
      });
      const reviewsDateList = Object.entries(dateMap).map(([date, count]) => ({
        date,
        count,
      }));
      setReviewsByDate(reviewsDateList);
    };

    fetchReviews();
  }, []);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#d0ed57", "#a4de6c"];

  return (
    <div className="container mt-4" dir="rtl">
      <h2 className="mb-4">דוח ביקורות משתמשים</h2>

      {/* Pie Chart: Rating Distribution */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">התפלגות דירוגים</h5>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={ratingStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {ratingStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bar Chart: Reviews by Date */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">ביקורות לפי תאריך</h5>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={reviewsByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="כמות ביקורות" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsAnalytics;
