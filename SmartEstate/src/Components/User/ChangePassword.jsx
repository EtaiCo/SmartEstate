import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ChangePassword = () => {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isValidPassword = (password) => {
    const minLength = /.{8,}/;
    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
    return (
      minLength.test(password) &&
      hasNumber.test(password) &&
      hasSpecialChar.test(password)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.email) {
      setError("המשתמש לא מחובר");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("הסיסמאות לא תואמות");
      return;
    }

    if (!isValidPassword(newPassword)) {
      setError("סיסמה חייבת להכיל לפחות 8 תווים, מספר ותו מיוחד");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/change-password/",
        {
          email: user.email,
          current_password: currentPassword,
          new_password: newPassword,
        },
        { withCredentials: true }
      );
      setMessage(response.data.message || "הסיסמה עודכנה בהצלחה!");
      setError("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.detail || "עדכון הסיסמה נכשל");
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
    <div className="container mt-5" style={{ maxWidth: "500px" }} dir="rtl">
      <div
        className="bg-white shadow p-4 rounded-4 border border-warning"
        style={{ borderTop: "5px solid #ffc107" }}
      >
        <h4 className="text-center mb-4 text-warning fw-bold">שינוי סיסמה</h4>

        {message && <div className="alert alert-success text-center">{message}</div>}
        {error && <div className="alert alert-danger text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">סיסמה נוכחית</label>
            <input
              type="password"
              className="form-control text-end"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">סיסמה חדשה</label>
            <input
              type="password"
              className="form-control text-end"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">אישור סיסמה חדשה</label>
            <input
              type="password"
              className="form-control text-end"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="btn btn-outline-warning rounded-pill px-5 fw-semibold"
              style={{ fontSize: "1rem" }}
            >
              שמור סיסמה חדשה
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
