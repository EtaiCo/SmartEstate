import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Card, Spinner, Badge } from "react-bootstrap";
import {
  FaBed,
  FaRulerCombined,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaCarAlt,
} from "react-icons/fa";
import { MdLocationOn, MdDescription, MdElevator } from "react-icons/md";

const AdDetails = () => {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    axios
      .get(`http://localhost:8000/ads/${id}`)
      .then((res) => {
        setAd(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching ad:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  if (!ad)
    return <h3 className="text-center text-danger mt-5">המודעה לא נמצאה</h3>;

  return (
    <Container className="my-5" dir="rtl">
      <Card className="shadow-lg p-4 border-0">
        <Card.Body>
          <h2 className="mb-4 text-primary text-center">
            {ad.property_type} ל{ad.ad_type}
          </h2>

          <Row className="mb-3 text-center">
            <Col md={4}>
              <FaBuilding className="me-2" />
              קומה: {ad.floor ?? "לא צוינה"}
            </Col>
            <Col md={4}>
              <MdLocationOn className="me-2" />
              {ad.address}
            </Col>
            <Col md={4}>
              <FaRulerCombined className="me-2 " />
              {ad.size} מ"ר
            </Col>
          </Row>

          <Row className="mb-3 text-center">
            <Col md={4}>
              <FaBed className="me-2" />
              {ad.rooms} חדרים
            </Col>
            <Col md={4}>
              <strong>מחיר:</strong> ₪{ad.price.toLocaleString()}
            </Col>
            <Col md={4}>
              {ad.has_elevator && (
                <Badge bg="secondary" className="me-2">
                  <MdElevator className="me-1" />
                  מעלית
                </Badge>
              )}
              {ad.has_parking && (
                <Badge bg="secondary">
                  <FaCarAlt className="me-1" />
                  חניה
                </Badge>
              )}
              {ad.has_balcony && (
                <Badge bg="secondary" className="me-2">
                  מרפסת
                </Badge>
              )}
              {ad.has_garden && (
                <Badge bg="secondary" className="me-2">
                  גינה
                </Badge>
              )}
              {ad.pets_allowed && (
                <Badge bg="secondary" className="me-2">
                  חיות מחמד
                </Badge>
              )}
              {ad.accessibility && (
                <Badge bg="secondary" className="me-2">
                  נגישות לנכים
                </Badge>
              )}
            </Col>
          </Row>

          {ad.description && (
            <Card className="bg-light border-0 mb-4 mt-3">
              <Card.Body>
                <h5 className="text-dark">
                  <MdDescription className="me-2" />
                  תיאור הנכס
                </h5>
                <p className="mt-2 text-muted">{ad.description}</p>
              </Card.Body>
            </Card>
          )}

          <Card className="bg-white border shadow-sm">
            <Card.Body>
              <h5 className="text-secondary mb-3">פרטי התקשרות</h5>
              <p>
                <strong>מפרסם:</strong> {ad.publisher_name}
              </p>
              <p>
                <FaPhone className="me-2" />
                {ad.contact_phone}
              </p>
              <p>
                <FaEnvelope className="me-2" />
                {ad.contact_email}
              </p>
            </Card.Body>
          </Card>

          <div className="text-center text-muted mt-4">
            <small>
              תאריך פרסום:{" "}
              {new Date(ad.publish_date).toLocaleDateString("he-IL")}
            </small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdDetails;
