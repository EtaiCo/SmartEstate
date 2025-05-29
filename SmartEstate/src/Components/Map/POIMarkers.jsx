import React from "react";
import { Marker, Popup } from "react-leaflet";
import { ICONS, AVAILABLE_LAYERS, DefaultIcon } from "./utils";

function POIMarkers({ pois, activeLayers, nearestPOIs, clicked }) {
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} מטר`;
    }
    return `${distance.toFixed(1)} ק"מ`;
  };

  return (
    <>
      {pois.map((poi, index) => (
        <Marker
          key={`${poi.properties.id}-${index}`}
          position={[poi.geometry.coordinates[1], poi.geometry.coordinates[0]]}
          icon={ICONS[poi.properties.amenity] || ICONS.default}
        >
          <Popup>
            <div style={{ direction: "rtl", textAlign: "right" }}>
              <strong>{poi.properties.name || "ללא שם"}</strong>
              <br />
              {
                AVAILABLE_LAYERS.find((l) => l.id === poi.properties.amenity)
                  ?.name
              }
            </div>
          </Popup>
        </Marker>
      ))}

      {clicked && (
        <Marker position={[clicked.lat, clicked.lng]} icon={DefaultIcon}>
          <Popup>
            <div style={{ direction: "rtl", textAlign: "right" }}>
              <strong>{clicked.address}</strong>
              <br />
              נ.צ.: {clicked.lat.toFixed(5)}, {clicked.lng.toFixed(5)}
              {nearestPOIs && Object.keys(nearestPOIs).length > 0 && (
                <>
                  <hr />
                  <strong>מרחקים למקומות קרובים:</strong>
                  <ul style={{ margin: "5px 0", paddingRight: "20px" }}>
                    {Object.entries(nearestPOIs).map(([type, poi]) => (
                      <li key={type}>
                        {AVAILABLE_LAYERS.find((l) => l.id === type)?.name}:{" "}
                        {formatDistance(poi.distance)}
                        <br />
                        <small>({poi.properties.name || "ללא שם"})</small>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}

export default POIMarkers;
