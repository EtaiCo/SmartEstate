import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

const UpdateProfile = () => {
  const { user, setUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        "http://localhost:8000/update-profile/",
        {
          email: user.email,
          first_name: firstName,
          last_name: lastName,
        },
        { withCredentials: true }
      );
      setUser(response.data);
      setMessage("הפרופיל עודכן בהצלחה!");
      setError("");
    } catch (err) {
      setMessage("");
      setError(err.response?.data?.detail || "העדכון נכשל");
    }
  };

  if (!user) {
    return (
      <div className="container mt-5 text-center">
        <h2>אנא התחבר כדי לגשת לפרופיל שלך</h2>
        <Link to="/login" className="btn btn-warning rounded-pill px-4 mt-3">
          התחברות
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-5" dir="rtl" style={{ maxWidth: "500px" }}>
      <div
        className="bg-white shadow p-4 rounded-4 border border-warning"
        style={{ borderTop: "5px solid #ffc107" }}
      >
        <h4 className="text-center mb-4 text-warning fw-bold">עריכת פרטים אישיים</h4>

        {message && <div className="alert alert-success text-center">{message}</div>}
        {error && <div className="alert alert-danger text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">שם פרטי</label>
            <input
              type="text"
              className="form-control text-end"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">שם משפחה</label>
            <input
              type="text"
              className="form-control text-end"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="btn btn-outline-warning rounded-pill px-5 fw-semibold"
              style={{ fontSize: "1rem" }}
            >
              שמור שינויים
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
