// 📁 components/AdCard.jsx
import React from "react";
import { Card, Badge, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AVAILABLE_LAYERS } from "./utils";
import { findNearestPOIs } from "./utils";
import { ICONS } from "./utils";

export default function AdCard({ ad, pois, activeLayers }) {
  const navigate = useNavigate();

  const nearest =
    pois.length > 0 && activeLayers.length > 0
      ? findNearestPOIs(ad.latitude, ad.longitude, pois, activeLayers)
      : null;

  const formatDistance = (distance) => {
    if (distance < 1) return `${Math.round(distance * 1000)} מטר`;
    return `${distance.toFixed(1)} ק"מ`;
  };

  return (
    <Card
      className="shadow-sm border-warning border-2 mb-3"
      style={{ direction: "rtl", borderRadius: "20px" }}
    >
      <Card.Img
        variant="top"
        src={ad.image_url || "/placeholder.jpg"}
        alt="תמונה של הנכס"
        style={{
          height: "200px",
          objectFit: "cover",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
        }}
      />

      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="fw-bold fs-5 text-end">
            ₪{ad.price.toLocaleString()}
          </div>
          <div role="button" title="הוסף למועדפים">
            ❤️
          </div>
        </div>

        <Card.Subtitle className="mb-2 text-muted">{ad.address}</Card.Subtitle>

        <div className="small text-secondary mb-2">
          {ad.property_type === 'apartment' && 'דירה'}
          {ad.property_type === 'house' && 'בית פרטי'}
          {ad.property_type === 'penthouse' && 'פנטהאוס'}
          {ad.property_type === 'studio' && 'סטודיו'} | {ad.rooms} חדרים | קומה {ad.floor ?? "?"} | {ad.size} מ"ר
        </div>

        {/* תכונות מיוחדות */}
        <div className="d-flex flex-wrap justify-content-end gap-1 my-2">
          {ad.has_parking && <span className="badge bg-secondary">חניה</span>}
          {ad.has_balcony && <span className="badge bg-secondary">מרפסת</span>}
          {ad.has_garden && <span className="badge bg-secondary">גינה</span>}
          {ad.pets_allowed && (
            <span className="badge bg-secondary">חיות מחמד</span>
          )}
        </div>

        <Button
          variant="outline-warning"
          className="w-100 fw-bold mt-2"
          onClick={() => navigate(`/ad/${ad.id}`)}
        >
          צפה בפרטי הדירה
        </Button>
      </Card.Body>
    </Card>
  );
}
