// MapMover.jsx
import { useEffect } from "react";
import { useMap } from "react-leaflet";

function MapMover({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, 16);
    }
  }, [center, map]);

  return null;
}

export default MapMover;
