import React, { useState } from "react";
import { Form, Button, Container, Card, Navbar, Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const PersonalQuestionnaire = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    propertyType: "",
    budget: "",
    location: "",
    rooms: "",
    size: "",
    parking: false,
    elevator: false,
    balcony: false,
    garden: false,
    petsAllowed: false,
    accessibility: false,
    additionalNotes: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/user-preferences/", formData, {
        withCredentials: true,
      });
      navigate("/profile");
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("שגיאה בשמירת ההעדפות. אנא נסה שוב.");
    }
  };

  return (
    <div
      className="min-vh-100"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        paddingBottom: "50px",
      }}
    >
      <Navbar bg="dark" variant="dark" expand="lg" className="px-4">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <span className="fw-bold" style={{ fontSize: "1.5rem" }}>
            SMART
          </span>
          <span className="text-primary fw-bold" style={{ fontSize: "1.5rem" }}>
            ESTATE
          </span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              דף הבית
            </Nav.Link>
            <Nav.Link as={Link} to="/profile">
              אזור אישי
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container className="py-5" dir="rtl" style={{ maxWidth: "900px" }}>
        <div className="text-center mb-5">
          <h1
            className="display-4 fw-bold mb-3"
            style={{
              background: "linear-gradient(45deg, #2193b0, #6dd5ed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            שאלון התאמה אישי
          </h1>
          <p className="lead text-muted">
            מלא את הפרטים שלך ונתאים לך את הנכס המושלם
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <Card.Body className="p-5">
            <Form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-primary">
                      סוג הנכס המבוקש
                    </Form.Label>
                    <Form.Select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      required
                      className="form-control-lg"
                    >
                      <option value="">בחר סוג נכס</option>
                      <option value="apartment">דירה</option>
                      <option value="house">בית פרטי</option>
                      <option value="penthouse">פנטהאוס</option>
                      <option value="studio">סטודיו</option>
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-primary">
                      תקציב (בשקלים)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="הכנס תקציב"
                      className="form-control-lg"
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-primary">
                      מיקום מועדף
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      placeholder="הזן עיר או שכונה"
                      className="form-control-lg"
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-primary">
                      מספר חדרים
                    </Form.Label>
                    <Form.Select
                      name="rooms"
                      value={formData.rooms}
                      onChange={handleChange}
                      required
                      className="form-control-lg"
                    >
                      <option value="">בחר מספר חדרים</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5+">5+</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-primary">
                      גודל (במ"ר)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="הכנס גודל במ״ר"
                      className="form-control-lg"
                    />
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold text-primary mb-3">
                  דרישות נוספות
                </Form.Label>
                <div className="row">
                  <div className="col-md-4">
                    <Form.Check
                      type="checkbox"
                      label="חניה"
                      name="parking"
                      checked={formData.parking}
                      onChange={handleChange}
                      className="mb-3"
                    />
                    <Form.Check
                      type="checkbox"
                      label="מעלית"
                      name="elevator"
                      checked={formData.elevator}
                      onChange={handleChange}
                      className="mb-3"
                    />
                  </div>
                  <div className="col-md-4">
                    <Form.Check
                      type="checkbox"
                      label="מרפסת"
                      name="balcony"
                      checked={formData.balcony}
                      onChange={handleChange}
                      className="mb-3"
                    />
                    <Form.Check
                      type="checkbox"
                      label="גינה"
                      name="garden"
                      checked={formData.garden}
                      onChange={handleChange}
                      className="mb-3"
                    />
                  </div>
                  <div className="col-md-4">
                    <Form.Check
                      type="checkbox"
                      label="מותר חיות מחמד"
                      name="petsAllowed"
                      checked={formData.petsAllowed}
                      onChange={handleChange}
                      className="mb-3"
                    />
                    <Form.Check
                      type="checkbox"
                      label="נגישות לנכים"
                      name="accessibility"
                      checked={formData.accessibility}
                      onChange={handleChange}
                      className="mb-3"
                    />
                  </div>
                </div>
              </Form.Group>

              <div className="text-center mt-5">
                <Button
                  variant="primary"
                  type="submit"
                  size="lg"
                  className="px-5 py-3"
                  style={{
                    background: "linear-gradient(45deg, #2193b0, #6dd5ed)",
                    border: "none",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                  }}
                >
                  שמור העדפות
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PersonalQuestionnaire;
