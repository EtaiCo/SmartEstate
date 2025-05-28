import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MapStyles.css";

import {
  SearchControl,
  ClickHandler,
  MapMover,
  LayerControl,
  POIMarkers,
  AdCard,
  AdMarkers,
  findNearestPOIs,
} from "./Map";

export default function MapBeerSheva() {
  const center = [31.252973, 34.791462];
  const [clicked, setClicked] = useState(null);
  const [activeLayers, setActiveLayers] = useState([]);
  const [pois, setPois] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [nearestPOIs, setNearestPOIs] = useState(null);
  const [ads, setAds] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [adType, setAdType] = useState(""); // Hebrew: מכירה / השכרה
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get("http://localhost:8000/ads", {withCredentials: true});
        if (response.status !== 200) {
          console.error("Failed to fetch ads:", response.statusText);
          return;
        }
        setAds(response.data);
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };
    fetchAds();
  }, []);

  useEffect(() => {
    const fetchPOIs = async () => {
      if (activeLayers.length === 0) {
        setPois([]);
        setNearestPOIs(null);
        return;
      }
      try {
        const response = await axios.post("http://localhost:8000/map/pois", {
          layers: activeLayers,
        });
        setPois(response.data.features);
        if (clicked) {
          const nearest = findNearestPOIs(
            clicked.lat,
            clicked.lng,
            response.data.features,
            activeLayers
          );
          setNearestPOIs(nearest);
        }
      } catch (error) {
        console.error("Error fetching POIs:", error);
      }
    };
    fetchPOIs();
  }, [activeLayers, clicked]);

  const handleToggleLayer = (layerId) => {
    setActiveLayers((prev) =>
      prev.includes(layerId)
        ? prev.filter((id) => id !== layerId)
        : [...prev, layerId]
    );
  };

  const handleSearchResult = (result) => {
    const newLocation = {
      lat: result.latitude,
      lng: result.longitude,
      address: result.address || result.name,
    };
    setSearchResult([result.latitude, result.longitude]);
    setClicked(newLocation);
    if (pois.length > 0) {
      const nearest = findNearestPOIs(
        result.latitude,
        result.longitude,
        pois,
        activeLayers
      );
      setNearestPOIs(nearest);
    }
  };

  // Filter ads by price and Hebrew ad_type
  const adsFiltered = ads.filter((ad) => {
    if (minPrice && ad.price < minPrice) return false;
    if (maxPrice && ad.price > maxPrice) return false;
    if (adType && ad.ad_type !== adType) return false;
    return true;
  });

  return (
    <div className="map-fullscreen-layout">
      <div className="top-panel">
        <SearchControl onSearch={handleSearchResult} />
      </div>

      <div className="layer-strip horizontal-layers">
        <LayerControl
          activeLayers={activeLayers}
          onToggleLayer={handleToggleLayer}
        />
      </div>

      <div className="map-ads-wrapper">
        <div className="map-area">
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {searchResult && <MapMover center={searchResult} />}
            <ClickHandler
              setClicked={(location) => {
                setClicked(location);
                if (pois.length > 0) {
                  const nearest = findNearestPOIs(
                    location.lat,
                    location.lng,
                    pois,
                    activeLayers
                  );
                  setNearestPOIs(nearest);
                }
              }}
            />

            <POIMarkers
              pois={pois}
              activeLayers={activeLayers}
              nearestPOIs={nearestPOIs}
              clicked={clicked}
            />
            <AdMarkers
              ads={ads}
              pois={pois}
              activeLayers={activeLayers}
              clicked={clicked}
            />
          </MapContainer>
        </div>

        <div className="ads-scrollable ads-narrow">
          <div className="ads-filter-header">
            <h4 style={{ textAlign: "right", margin: 0, whiteSpace: "nowrap" }}>
              תוצאות
            </h4>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                marginTop: "0.7rem",
                direction: "rtl",
              }}
            >
              <input
                type="number"
                placeholder="מחיר מינ׳"
                value={minPrice || ""}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                style={{ width: "80px", direction: "rtl" }}
                min={0}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="מחיר מקס׳"
                value={maxPrice || ""}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: "80px", direction: "rtl" }}
                min={0}
              />
            </div>

            <div style={{ marginTop: "0.5rem", direction: "rtl" }}>
              <label style={{ fontWeight: "bold" }}>סוג מודעה</label>
              <select
                value={adType}
                onChange={(e) => setAdType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  marginTop: "0.2rem",
                }}
              >
                <option value="">הצג הכל</option>
                <option value="מכירה">מכירה</option>
                <option value="השכרה">השכרה</option>
              </select>
            </div>
          </div>

          {adsFiltered.map((ad) => (
            <AdCard
              key={ad.id}
              ad={ad}
              pois={pois}
              activeLayers={activeLayers}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
