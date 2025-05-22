import React from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import landingImage from "../assets/landing-illustration.png"; // ← Your saved image
import "./IconPath.css"; // You can rename this to LandingPage.css if more appropriate

const LandingPage = () => {
  return (
    <div className="landing-wrapper bg-light">
      <Container fluid>
        <Row>
          {/* Left side: single illustration image */}
          <Col md={6} className="d-flex align-items-center justify-content-center p-4">
            <img
              src={landingImage}
              alt="SmartEstate visual path"
              className="img-fluid rounded-4 shadow"
              style={{ maxHeight: "90vh", objectFit: "contain" }}
            />
          </Col>

          {/* Right side: text + actions */}
          <Col
  md={6}
  className="d-flex flex-column justify-content-center align-items-end text-end p-5"
>
  <h1 className="display-4 fw-bold">
    הגיע הזמן<br />שהחיפוש יתאים את עצמו אליך
  </h1>
  <p className="lead text-muted">
     
    בונה עבורך חווית חיפוש דירה מותאמת אישית 
    שמבינה אותך ואת הסביבה שתרצה לחיות בה
  </p>
  <div className="d-flex gap-3 mt-4">
    <Button variant="warning" size="lg" href="/app">
      !יאללה חפש
    </Button>
  </div>
</Col>

        </Row>
      </Container>
    </div>
  );
};

export default LandingPage;
