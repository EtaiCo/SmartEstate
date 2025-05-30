import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MapStyles.css";
import FeatureFilter from "./User/FeatureFilter"; // Importing the FeatureFilter component
import AdFilters from "./User/AdFilters"; // Importing the AdFilters component

import {
  SearchControl,
  ClickHandler,
  MapMover,
  LayerControl,
  POIMarkers,
  AdCard,
  AdMarkers,
  findNearestPOIs,
  FixMapResize,
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
  const [adType, setAdType] = useState("");
  const [maxSize, setMaxSize] = useState(0);
  const [propertyType, setPropertyType] = useState("");
  const [features, setFeatures] = useState([]); // <-- מאפייני דירה
  const [minRooms, setMinRooms] = useState(0);
  const [maxRooms, setMaxRooms] = useState(0);
    const [likedAdIds, setLikedAdIds] = useState([]);


  const navigate = useNavigate();

  // Property type mapping
  const PROPERTY_TYPES = {
    apartment: "דירה",
    house: "בית פרטי",
    penthouse: "נטהאוס",
    studio: "סטודיו",
  };

  const handleLikeChange = (adId, isLiked) => {
  if (isLiked) {
    // Add to liked ads
    setLikedAdIds(prev => [...prev, adId]);
  } else {
    // Remove from liked ads
    setLikedAdIds(prev => prev.filter(id => id !== adId));
  }
};

  useEffect(() => {
    const fetchLikedAds = async () => {
      try {
        const res = await fetch("http://localhost:8000/likes/", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setLikedAdIds(data.map((like) => like.ad_id));
        }
      } catch (err) {
        console.error("Failed to fetch liked ads:", err);
      }
    };

    fetchLikedAds();
  }, []);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get("http://localhost:8000/ads", {
          withCredentials: true,
        });
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
    if (maxSize && ad.size > maxSize) return false;
    if (minRooms && ad.rooms < minRooms) return false;
    if (maxRooms && ad.rooms > maxRooms) return false;
    if (propertyType && ad.property_type !== propertyType) return false;
    if (features.length > 0) {
      for (const f of features) {
        if (!ad[f]) return false;
      }
    }
    return true;
  });

  console.log("Filtered ads:", adsFiltered);

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
            <FixMapResize />
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
              ads={adsFiltered}
              pois={pois}
              activeLayers={activeLayers}
              clicked={clicked}
            />
          </MapContainer>
        </div>

        <div className="ads-scrollable ads-narrow">
          <div className="ads-filter-header">
            <h4 style={{ textAlign: "right", margin: 0, whiteSpace: "nowrap" }}>
              סינון מודעות
            </h4>
            <AdFilters
              propertyType={propertyType}
              setPropertyType={setPropertyType}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              adType={adType}
              setAdType={setAdType}
              maxSize={maxSize}
              setMaxSize={setMaxSize}
              minRooms={minRooms}
              setMinRooms={setMinRooms}
              maxRooms={maxRooms}
              setMaxRooms={setMaxRooms}
            />

            <FeatureFilter selected={features} onChange={setFeatures} />
          </div>
          <h4 style={{ textAlign: "right", margin: 0, whiteSpace: "nowrap" }}>
            המודעות שנמצאו
          </h4>
          {adsFiltered.map((ad) => (
            <AdCard
              key={ad.id}
              ad={ad}
              pois={pois}
              activeLayers={activeLayers}
              likedAdIds={likedAdIds}
              isLiked={likedAdIds.includes(ad.id)}
              onLikeChange={handleLikeChange} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
