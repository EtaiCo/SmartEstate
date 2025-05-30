import { useMap } from "react-leaflet";
import { useEffect } from "react";

const FixMapResize = () => {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 400);
  }, [map]);

  return null;
};

export default FixMapResize;
