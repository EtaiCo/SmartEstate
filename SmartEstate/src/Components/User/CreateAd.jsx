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
  <div className="container mt-5" dir="rtl" style={{ maxWidth: "700px" }}>
    <div
      className="bg-white shadow p-4 rounded-4 border border-warning"
      style={{ borderTop: "5px solid #ffc107" }}
    >
      <h4 className="text-center mb-4 text-warning fw-bold">פרסום מודעה חדשה</h4>

      <form onSubmit={handleSubmit}>
        {/* סוג מודעה */}
        <div className="mb-3">
          <Form.Label>סוג מודעה</Form.Label>
          <Form.Select name="ad_type" value={formData.ad_type} onChange={handleChange} required>
            <option value="">בחר...</option>
            <option value="מכירה">מכירה</option>
            <option value="השכרה">השכרה</option>
          </Form.Select>
        </div>

        {/* סוג נכס */}
        <div className="mb-3">
          <Form.Label>סוג נכס</Form.Label>
          <Form.Select name="property_type" value={formData.property_type} onChange={handleChange} required>
            <option value="">בחר סוג נכס</option>
            <option value="apartment">דירה</option>
            <option value="house">בית פרטי</option>
            <option value="penthouse">פנטהאוס</option>
            <option value="studio">סטודיו</option>
          </Form.Select>
        </div>

        {/* כתובת + חיפוש */}
        <div className="mb-3">
          <Form.Label>
            כתובת <span className="text-danger">*</span>
          </Form.Label>
          <SimpleSearchControl onSelect={handleAddressSelect} />
          {formData.address && (
            <div className="mt-2 alert alert-success text-end">
              כתובת שנבחרה: {formData.address}
            </div>
          )}
        </div>

        {/* מספר חדרים */}
        <div className="mb-3">
          <Form.Label>מספר חדרים</Form.Label>
          <Form.Select name="rooms" value={formData.rooms} onChange={handleChange} required>
            <option value="">בחר מספר חדרים</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5+">5+</option>
          </Form.Select>
        </div>

        {/* גודל */}
        <div className="mb-3">
          <Form.Label>גודל (במ"ר)</Form.Label>
          <Form.Control
            type="number"
            name="size"
            value={formData.size}
            onChange={handleChange}
            required
            className="text-end"
          />
        </div>

        {/* מחיר */}
        <div className="mb-3">
          <Form.Label>מחיר (בש"ח)</Form.Label>
          <Form.Control
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            className="text-end"
          />
        </div>

        {/* קומה */}
        <div className="mb-3">
          <Form.Label>קומה</Form.Label>
          <Form.Control
            type="number"
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            required
            className="text-end"
          />
        </div>

        {/* תוספות */}
        <div className="mb-3">
          <Form.Label>תוספות</Form.Label>
          <div className="row">
            <div className="col-md-4">
              <Form.Check label="חניה" name="has_parking" type="checkbox" checked={formData.has_parking} onChange={handleChange} />
              <Form.Check label="מעלית" name="has_elevator" type="checkbox" checked={formData.has_elevator} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <Form.Check label="מרפסת" name="has_balcony" type="checkbox" checked={formData.has_balcony} onChange={handleChange} />
              <Form.Check label="גינה" name="has_garden" type="checkbox" checked={formData.has_garden} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <Form.Check label="חיות מחמד מותרות" name="pets_allowed" type="checkbox" checked={formData.pets_allowed} onChange={handleChange} />
              <Form.Check label="נגישות לנכים" name="accessibility" type="checkbox" checked={formData.accessibility} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* שם המפרסם */}
        <div className="mb-3">
          <Form.Label>שם המפרסם</Form.Label>
          <Form.Control type="text" name="publisher_name" value={formData.publisher_name} onChange={handleChange} required />
        </div>

        {/* טלפון */}
        <div className="mb-3">
          <Form.Label>טלפון ליצירת קשר</Form.Label>
          <Form.Control type="text" name="contact_phone" value={formData.contact_phone} onChange={handleChange} required />
        </div>

        {/* תיאור */}
        <div className="mb-3">
          <Form.Label>תיאור</Form.Label>
          <Form.Control as="textarea" name="description" rows={4} value={formData.description} onChange={handleChange} className="text-end" />
        </div>

        {/* כפתור שליחה */}
        <div className="text-center mt-4">
          <button
            type="submit"
            className="btn btn-outline-warning rounded-pill px-5 fw-semibold"
            style={{ fontSize: "1rem" }}
          >
            פרסם מודעה
          </button>
        </div>
      </form>
    </div>
  </div>
);

};

export default CreateAd;
