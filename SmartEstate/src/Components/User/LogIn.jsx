import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const Login = ({ closeModal }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser, setIsAdmin } = useAuth();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/login/",
        formData,
        { withCredentials: true }
      );

      setUser(response.data.user);
      setIsAdmin(response.data.is_admin);
      closeModal(); // ✅ close the modal on success

      // Optional navigation
      if (response.data.is_admin) {
        navigate("/adminHomePage");
      } else {
        navigate("/app");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "התחברות נכשלה");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3" dir="rtl">
      <h4 className="text-center mb-3">התחברות</h4>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label htmlFor="email" className="form-label">אימייל</label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="example@mail.com"
          className="form-control text-end"
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">סיסמה</label>
        <input
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="********"
          className="form-control text-end"
          required
        />
      </div>

      <button type="submit" className="btn btn-warning w-100">
        התחבר
      </button>
    </form>
  );
};

export default Login;
