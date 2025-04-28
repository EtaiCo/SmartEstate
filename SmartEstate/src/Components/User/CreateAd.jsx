import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Link } from "react-router-dom";
import { Form } from "react-bootstrap";
import SimpleSearchControl from "./SimpleSearchControl"; // Assuming you have a SearchControl component

const CreateAd = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ad_type: "",
    property_type: "",
    address: "",
    latitude: "",
    longitude: "",
    rooms: "",
    size: "",
    price: "",
    floor: "",
    has_elevator: false,
    has_parking: false,
    description: "",
    has_balcony: false,
    has_garden: false,
    pets_allowed: false,
    accessibility: false,
    publisher_name: "",
    contact_phone: "",
    publish_date: new Date().toISOString().split("T")[0], // תאריך פרסום אוטומטי
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddressSelect = (selectedResult) => {
    const finalAddress = selectedResult.address
      ? selectedResult.address
      : selectedResult.name;

    console.log("נבחר:", selectedResult);

    setFormData((prev) => ({
      ...prev,
      address: finalAddress,
      latitude: selectedResult.latitude,
      longitude: selectedResult.longitude,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const preparedData = {
        ...formData,
        rooms: parseFloat(formData.rooms),
        size: parseInt(formData.size),
        price: parseInt(formData.price),
        floor: formData.floor ? parseInt(formData.floor) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : 0.0,
        longitude: formData.longitude ? parseFloat(formData.longitude) : 0.0,
        has_elevator: Boolean(formData.has_elevator),
        has_parking: Boolean(formData.has_parking),
        has_balcony: Boolean(formData.has_balcony),
        has_garden: Boolean(formData.has_garden),
        pets_allowed: Boolean(formData.pets_allowed),
        accessibility: Boolean(formData.accessibility),
      };

      console.log(preparedData);
      await axios.post("http://localhost:8000/ads/", preparedData, {
        withCredentials: true,
      });
      alert("המודעה פורסמה בהצלחה!");
      navigate("/profile"); // Redirect to user profile after successful submission
    } catch (error) {
      console.error("שגיאה בפרסום מודעה", error);
      alert("שגיאה בפרסום המודעה");
    }
  };

  if (!user) {
    return (
      <div className="container mt-5">
        <h2>Please log in to view your profile.</h2>
        <Link to="/login" className="btn btn-primary">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 shadow rounded bg-white"
      style={{ maxWidth: "700px", margin: "50px auto" }}
      dir="rtl"
    >
      <h2 className="text-center mb-4">פרסום מודעה חדשה</h2>

      {/* סוג מודעה */}
      <div className="mb-3">
        <Form.Label>סוג מודעה</Form.Label>
        <select
          name="ad_type"
          className="form-select"
          value={formData.ad_type}
          onChange={handleChange}
          required
        >
          <option value="">בחר...</option>
          <option value="מכירה">מכירה</option>
          <option value="השכרה">השכרה</option>
        </select>
      </div>

      {/* סוג נכס */}
      <div className="mb-3">
        <Form.Label>סוג נכס</Form.Label>
        <select
          name="property_type"
          className="form-select"
          value={formData.property_type}
          onChange={handleChange}
          required
        >
          <option value="">בחר סוג נכס</option>
          <option value="apartment">דירה</option>
          <option value="house">בית פרטי</option>
          <option value="penthouse">פנטהאוס</option>
          <option value="studio">סטודיו</option>
        </select>
      </div>

      {/* כתובת + חיפוש */}
      <div className="mb-3">
        <Form.Label>
          כתובת <span style={{ color: "red" }}>*</span>
        </Form.Label>
        <SimpleSearchControl onSelect={handleAddressSelect} />
        {formData.address && (
          <div className="mt-2 alert alert-success">
            כתובת שנבחרה: {formData.address}
          </div>
        )}
      </div>

      {/* מספר חדרים */}
      <div className="mb-3">
        <Form.Label>מספר חדרים</Form.Label>
        <select
          name="rooms"
          className="form-select"
          value={formData.rooms}
          onChange={handleChange}
          required
        >
          <option value="">בחר מספר חדרים</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5+">5+</option>
        </select>
      </div>

      {/* גודל */}
      <div className="mb-3">
        <Form.Label>גודל (במ"ר)</Form.Label>
        <Form.Control
          type="number"
          name="size"
          min="0"
          value={formData.size}
          onChange={handleChange}
          required
        />
      </div>

      {/* מחיר */}
      <div className="mb-3">
        <Form.Label>מחיר (בש"ח)</Form.Label>
        <Form.Control
          type="number"
          name="price"
          min="0"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>

      {/* קומה */}
      <div className="mb-3">
        <Form.Label>קומה</Form.Label>
        <Form.Control
          type="number"
          name="floor"
          min="0"
          value={formData.floor}
          onChange={handleChange}
          required
        />
      </div>

      {/* אפשרויות נוספות */}
      <div className="mb-3">
        <Form.Label>תוספות</Form.Label>
        <div className="row">
          <div className="col-md-4">
            <Form.Check
              type="checkbox"
              label="חניה"
              name="has_parking"
              checked={formData.has_parking}
              onChange={handleChange}
            />
            <Form.Check
              type="checkbox"
              label="מעלית"
              name="has_elevator"
              checked={formData.has_elevator}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <Form.Check
              type="checkbox"
              label="מרפסת"
              name="has_balcony"
              checked={formData.has_balcony}
              onChange={handleChange}
            />
            <Form.Check
              type="checkbox"
              label="גינה"
              name="has_garden"
              checked={formData.has_garden}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <Form.Check
              type="checkbox"
              label="חיות מחמד מותרות"
              name="pets_allowed"
              checked={formData.pets_allowed}
              onChange={handleChange}
            />
            <Form.Check
              type="checkbox"
              label="נגישות לנכים"
              name="accessibility"
              checked={formData.accessibility}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* שם המפרסם */}
      <div className="mb-3">
        <Form.Label>שם המפרסם</Form.Label>
        <Form.Control
          type="text"
          name="publisher_name"
          value={formData.publisher_name}
          onChange={handleChange}
          required
        />
      </div>

      {/* טלפון ליצירת קשר */}
      <div className="mb-3">
        <Form.Label>טלפון ליצירת קשר</Form.Label>
        <Form.Control
          type="text"
          name="contact_phone"
          value={formData.contact_phone}
          onChange={handleChange}
          required
        />
      </div>

      {/* תיאור */}
      <div className="mb-3">
        <Form.Label>תיאור</Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      {/* כפתור שליחה */}
      <button type="submit" className="btn btn-primary w-100 mt-3">
        פרסם מודעה
      </button>
    </form>
  );
};

export default CreateAd;
