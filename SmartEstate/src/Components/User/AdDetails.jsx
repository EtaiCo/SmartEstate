import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./AdDetails.css";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import {
  FaBed,
  FaRulerCombined,
  FaBuilding,
  FaPhone,
  FaUser,
  FaShoppingCart,
  FaTree,
  FaSchool,
  FaGraduationCap,
  FaDog,
  FaHospitalSymbol,
  FaBus,
  FaHome,
  FaBaby,
  FaBook,
  FaSynagogue,
  FaStore,
} from "react-icons/fa";
import { MdCheck, MdLocationOn } from "react-icons/md";

// --- LABELS CONFIG for POIs (icon, color, label) ---
const LABELS_CONFIG = [
  {
    id: "shelter",
    name: "מרחב מוגן",
    icon: <FaHome size={24} />,
    color: "#ffd9c1",
    fontColor: "#a11918",
  },
  {
    id: "park",
    name: "פארק",
    icon: <FaTree size={24} />,
    color: "#7ddfc3",
    fontColor: "#157155",
  },
  {
    id: "university",
    name: "מוסד אקדמי",
    icon: <FaGraduationCap size={24} />,
    color: "#67aaf9",
    fontColor: "#165ba8",
  },
  {
    id: "dog_park",
    name: "גינת כלבים",
    icon: <FaDog size={24} />,
    color: "#ffd375",
    fontColor: "#ae7700",
  },
  {
    id: "supermarket",
    name: "סופר",
    icon: <FaShoppingCart size={24} />,
    color: "#ff86b4",
    fontColor: "#9b155b",
  },
  {
    id: "school",
    name: "בית ספר",
    icon: <FaSchool size={24} />,
    color: "#c287f9",
    fontColor: "#560f97",
  },
  {
    id: "hospital",
    name: "בית חולים",
    icon: <FaHospitalSymbol size={24} />,
    color: "#e3ecfd",
    fontColor: "#1b3e6b",
  },

  {
    id: "kindergarten",
    name: "גן ילדים",
    icon: <FaBaby size={24} />,
    color: "#b4efb4",
    fontColor: "#157115",
  },
  {
    id: "library",
    name: "ספריה",
    icon: <FaBook size={24} />,
    color: "#b4d3ef",
    fontColor: "#165ba8",
  },
  {
    id: "place_of_worship",
    name: "בית כנסת",
    icon: <FaSynagogue size={24} />,
    color: "#ffd6e0",
    fontColor: "#a11954",
  },
  {
    id: "mall",
    name: "קניון",
    icon: <FaStore size={24} />,
    color: "#dedaff",
    fontColor: "#5a4d90",
  },
];

const PROPERTY_TYPES_HE = {
  apartment: "דירה",
  house: "בית פרטי",
  penthouse: "פנטהאוס",
  studio: "סטודיו",
};

// Distance in km between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Return all LABELS_CONFIG items that are within 0.5km
function getNearbyLabels(lat, lon, pois, maxDistance = 0.5) {
  return LABELS_CONFIG.filter((label) => {
    // Match POIs of that amenity/type
    const relevant = pois
      .filter((poi) => poi.properties.amenity === label.id)
      .map((poi) => ({
        ...poi,
        distance: calculateDistance(
          lat,
          lon,
          poi.geometry.coordinates[1],
          poi.geometry.coordinates[0]
        ),
      }));
    if (relevant.length === 0) return false;
    relevant.sort((a, b) => a.distance - b.distance);
    return relevant[0].distance <= maxDistance;
  });
}

// --- Feature Checkbox component ---
const Feature = ({ label, checked }) => (
  <div className="feature">
    <span className={`feature-box ${checked ? "checked" : ""}`}>
      {checked && <MdCheck className="check-icon" />}
    </span>
    <span className="feature-label">{label}</span>
  </div>
);

// --- LabelsBar for colored label chips ---
const LabelsBar = ({ labels }) => (
  <div
    style={{
      display: "flex",
      gap: "16px",
      justifyContent: "center",
      margin: "24px 0 16px 0",
      flexWrap: "wrap",
    }}
  >
    {labels.map((label) => (
      <div
        key={label.id}
        style={{
          display: "flex",
          alignItems: "center",
          background: label.color,
          color: label.fontColor,
          borderRadius: "20px",
          padding: "7px 20px 7px 15px",
          fontWeight: 600,
          fontSize: "1.06rem",
          minWidth: 100,
          justifyContent: "center",
          boxShadow: "0 2px 8px #eee",
        }}
      >
        <span style={{ display: "flex", marginRight: 18 }}>{label.icon}</span>
        <span>{label.name}</span>
      </div>
    ))}
  </div>
);

const AdDetails = () => {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pois, setPois] = useState([]);
  const [labelsToShow, setLabelsToShow] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    async function fetchAdAndPOIs() {
      try {
        const adRes = await axios.get(`http://localhost:8000/ads/${id}`);
        setAd(adRes.data);

        // Get POIs from backend
        const poisRes = await axios.post("http://localhost:8000/map/pois", {
          layers: LABELS_CONFIG.map((l) => l.id),
        });
        setPois(poisRes.data.features);

        // Filter by ad location (latitude/longitude)
        if (adRes.data.latitude && adRes.data.longitude) {
          const labels = getNearbyLabels(
            adRes.data.latitude,
            adRes.data.longitude,
            poisRes.data.features
          );
          setLabelsToShow(labels);
        }
        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    }

    fetchAdAndPOIs();
  }, [id]);

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  if (!ad)
    return <h3 className="text-center text-danger mt-5">המודעה לא נמצאה</h3>;

  const propertyLabel = PROPERTY_TYPES_HE[ad.property_type] || ad.property_type;

  return (
    <Container className="my-5" dir="ltr">
      <style>{`
        .feature {
          display: flex;
          flex-direction: row-reverse;
          align-items: center;
          margin-bottom: 12px;
        }
        .feature-label {
          color: #000;
          font-weight: 600;
          margin-inline-end: 10px;
        }
        .feature-box {
          width: 30px;
          height: 30px;
          border: 3px solid #ffc107;
          border-radius: 6px;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .feature-box.checked {
          background: #ffc107;
        }
        .check-icon {
          color: #000;
          font-size: 20px;
          line-height: 1;
        }
        .feature-col-fix {
          padding-right: 0 !important;
        }
        .feature-list-wrap {
          width: 100%;
          max-width: 170px;
          padding-right: 8px;
        }
        .big-info {
          font-size: 2rem;
          font-weight: 700;
          color: #212529;
        }
        .mid-info {
          font-size: 1.15rem;
          font-weight: 500;
          color: #212529;
        }
      `}</style>

      <Card className="shadow border-0">
        <div className="bg-warning text-center py-3">
          <h3 className="m-0 fw-bold big-info">
            {propertyLabel} ל{ad.ad_type}
          </h3>
        </div>

        <div className="bg-light" style={{ height: "250px" }}>
          <div className="h-100 d-flex align-items-center justify-content-center text-muted">
            <span>תמונה לא זמינה</span>
          </div>
        </div>

        <Card.Body>
          <Row className="text-center border-bottom py-3">
            <Col md={4} className="border-end big-info">
              <FaRulerCombined className="me-2" /> {ad.size} מ"ר
            </Col>
            <Col md={4} className="border-end big-info">
              <FaBuilding className="me-2" /> {ad.floor} קומה
            </Col>
            <Col md={4} className="big-info">
              <FaBed className="me-2" /> {ad.rooms} חדרים
            </Col>
          </Row>

          <h3 className="text-end fw-bold big-info my-4">
            ₪{ad.price?.toLocaleString()}
          </h3>

          {ad.address && (
            <h5
              className="text-end text-secondary mb-4 mid-info"
              style={{ fontWeight: 500 }}
            >
              <MdLocationOn /> {ad.address}
            </h5>
          )}

          {labelsToShow.length > 0 && <LabelsBar labels={labelsToShow} />}

          <Row className="mb-4">
            <Col
              xs={12}
              className="feature-col-fix d-flex flex-column align-items-end"
            >
              <div className="feature-list-wrap">
                <Feature label="מרפסת" checked={ad.has_balcony} />
                <Feature label="נגישות" checked={ad.accessibility} />
                <Feature label="מעלית" checked={ad.has_elevator} />
                <Feature label="חניה" checked={ad.has_parking} />
                <Feature label="חיות מחמד" checked={ad.pets_allowed} />
              </div>
            </Col>
          </Row>

          {ad.description && (
            <Card className="bg-light border-0 mb-4">
              <Card.Body>
                <p className="mt-2 text-muted text-end">{ad.description}</p>
              </Card.Body>
            </Card>
          )}

          <Card className="border shadow-sm" dir="rtl">
            <Card.Body>
              <h5 className="text-secondary mb-3 big-info">פרטי התקשרות</h5>
              <p className="mb-1 mid-info">
                <FaUser className="me-2" /> {ad.publisher_name}
              </p>
              <p className="mid-info">
                <FaPhone className="me-2" /> {ad.contact_phone}
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
