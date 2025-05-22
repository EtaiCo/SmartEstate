import React, { useState } from "react";
import axios from "axios";

const Register = ({ closeModal }) => {
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setValidationError("");

    const { password, confirm_password } = formData;
    if (password !== confirm_password) {
      setValidationError("הסיסמאות אינן תואמות");
      return;
    }

    if (!isValidPassword(password)) {
      setValidationError(
        "הסיסמה חייבת לכלול לפחות 8 תווים, מספר ותו מיוחד"
      );
      return;
    }

    try {
      const { confirm_password, ...payload } = formData;
      await axios.post("http://localhost:8000/users/", payload);
      setMessage("נרשמת בהצלחה!");
      setFormData({
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        confirm_password: "",
      });
      closeModal(); // ✅ Close modal on success
    } catch (err) {
      setError(err.response?.data?.detail || "ההרשמה נכשלה");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3" dir="rtl">
      <h4 className="text-center mb-3">הרשמה</h4>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {validationError && <div className="alert alert-warning">{validationError}</div>}

      <div className="mb-3">
        <label>אימייל</label>
        <input
          type="email"
          name="email"
          className="form-control text-end"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label>שם פרטי</label>
        <input
          type="text"
          name="first_name"
          className="form-control text-end"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label>שם משפחה</label>
        <input
          type="text"
          name="last_name"
          className="form-control text-end"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label>סיסמה</label>
        <input
          type="password"
          name="password"
          className="form-control text-end"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label>אימות סיסמה</label>
        <input
          type="password"
          name="confirm_password"
          className="form-control text-end"
          value={formData.confirm_password}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className="btn btn-warning w-100">
        הרשמה
      </button>
    </form>
  );
};

export default Register;
