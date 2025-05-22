// AdMarkers.jsx
import React from "react";
import { Marker, Popup } from "react-leaflet";
import { ICONS, AVAILABLE_LAYERS, findNearestPOIs } from "./utils";

function AdMarkers({ ads, pois, activeLayers }) {
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} מטר`;
    }
    return `${distance.toFixed(1)} ק"מ`;
  };

  return (
    <>
      {ads.map((ad) => {
        const adIcon =
          ad.ad_type === "מכירה" ? ICONS.ad_for_sale : ICONS.ad_for_rent;

        const nearestToAd =
          pois.length > 0 && activeLayers.length > 0
            ? findNearestPOIs(ad.latitude, ad.longitude, pois, activeLayers)
            : null;

        return (
          <Marker
            key={`ad-${ad.id}`}
            position={[ad.latitude, ad.longitude]}
            icon={adIcon}
          >
            <Popup>
              <div
                className="card"
                style={{ width: "300px", direction: "rtl" }}
              >
                <div
                  className="card-header"
                  style={{
                    backgroundColor:
                      ad.ad_type === "מכירה" ? "#28a745" : "#007bff",
                    color: "white",
                  }}
                >
                  <h5 className="mb-0">
                    {ad.property_type} ל{ad.ad_type}
                  </h5>
                </div>

                <div className="card-body">
                  <p className="card-text mb-2">
                    <strong>📍 כתובת:</strong> {ad.address}
                  </p>

                  <div className="row mb-2">
                    <div className="col-6">
                      <strong>🛏️ חדרים:</strong> {ad.rooms}
                    </div>
                    <div className="col-6">
                      <strong>📐 גודל:</strong> {ad.size} מ"ר
                    </div>
                  </div>

                  <p className="card-text mb-2">
                    <strong>💰 מחיר:</strong> ₪{ad.price.toLocaleString()}
                  </p>

                  <hr />

                  <div className="row mb-2">
                    <div className="col-12">
                      <strong>👤 מפרסם:</strong> {ad.publisher_name}
                    </div>
                    <div className="col-12">
                      <strong>📞 טלפון:</strong> {ad.contact_phone}
                    </div>
                  </div>

                  <div className="mb-3">
                    {ad.has_elevator && (
                      <span className="badge bg-secondary me-1">מעלית</span>
                    )}
                    {ad.has_parking && (
                      <span className="badge bg-secondary me-1">חניה</span>
                    )}
                    {ad.has_balcony && (
                      <span className="badge bg-secondary me-1">מרפסת</span>
                    )}
                    {ad.has_garden && (
                      <span className="badge bg-secondary me-1">גינה</span>
                    )}
                    {ad.pets_allowed && (
                      <span className="badge bg-secondary me-1">חיות מחמד</span>
                    )}
                  </div>

                  {nearestToAd && Object.keys(nearestToAd).length > 0 && (
                    <>
                      <hr />
                      <h6 className="text-center">בקרבת מקום</h6>
                      <div className="list-group list-group-flush">
                        {Object.entries(nearestToAd).map(([type, poi]) => (
                          <div key={type} className="list-group-item py-1">
                            <span className="me-2">
                              {
                                AVAILABLE_LAYERS.find((l) => l.id === type)
                                  ?.icon
                              }
                            </span>
                            <span>
                              {
                                AVAILABLE_LAYERS.find((l) => l.id === type)
                                  ?.name
                              }
                            </span>
                            <span className="float-end">
                              {formatDistance(poi.distance)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {ad.description && (
                    <>
                      <hr />
                      <div className="alert alert-info py-2 mb-0">
                        <small>
                          <strong>תיאור:</strong> {ad.description}
                        </small>
                      </div>
                    </>
                  )}
                  <div className="d-grid mt-3">
                    <a
                      href={`/ad/${ad.id}`}
                      className="btn btn-outline-primary btn-sm"
                      style={{ fontWeight: "bold" }}
                    >
                      צפה בפרטי הדירה
                    </a>
                  </div>

                  <div className="text-muted text-center mt-2">
                    <small>
                      תאריך פרסום:{" "}
                      {new Date(ad.publish_date).toLocaleDateString("he-IL")}
                    </small>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default AdMarkers;
