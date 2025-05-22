// LayerControl.jsx
import React, { useState } from "react";
import { AVAILABLE_LAYERS } from "./utils";

// צבעים לכל שכבה (בהתאם למה שבתמונה שלך)
const LAYER_COLORS = {
  park: "#4ecb8f",
  school: "#a084e8",
  supermarket: "#ffb703",
  dog: "#f38181",
  bus_station: "#ffe066",
  shelter: "#e63946",
  kindergarten: "#fbbf24",
  university: "#6c63ff",
  hospital: "#ff6f61",
  pharmacy: "#00bcd4",
  playground: "#ffb6b9",
  library: "#6ddccf",
  place_of_worship: "#b388ff",
  mall: "#ffd166",
  train_station: "#118ab2",
  restaurant: "#ef476f",
  cafe: "#ffd6e0",
  gym: "#06d6a0",
  bank: "#ffd166",
  post_office: "#f67280",
  community_center: "#f8b400",
  daycare: "#fbbf24",
  police: "#118ab2",
  fire_station: "#ff6f61",
  recycling: "#43aa8b",
};

function LayerControl({ activeLayers, onToggleLayer }) {
  const [showAllLayers, setShowAllLayers] = useState(false);
  const visibleLayers = showAllLayers
    ? AVAILABLE_LAYERS
    : AVAILABLE_LAYERS.slice(0, 10);

  return (
    <div className="layer-control">
      <div className="layer-control-header">
        <h3>שכבות</h3>
        {AVAILABLE_LAYERS.length > 10 && (
          <button
            className="toggle-layers-btn"
            onClick={() => setShowAllLayers(!showAllLayers)}
          >
            {showAllLayers ? "הצג פחות" : "הצג עוד"}
          </button>
        )}
      </div>
      <div className="layers-list">
        {visibleLayers.map((layer) => (
          <div key={layer.id} className="layer-item">
            <label>
              <input
                type="checkbox"
                checked={activeLayers.includes(layer.id)}
                onChange={() => onToggleLayer(layer.id)}
              />
              <span
                className="layer-icon"
                style={{
                  backgroundColor: LAYER_COLORS[layer.id] || "#eee",
                  color: ["bus_station"].includes(layer.id) ? "#222" : "#fff",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  margin: "0 8px",
                  boxShadow: "0 1px 4px #eee",
                }}
              >
                {layer.icon}
              </span>
              <span className="layer-name">{layer.name}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LayerControl;
