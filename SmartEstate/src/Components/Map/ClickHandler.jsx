import { useMapEvent } from "react-leaflet";
import axios from "axios";

function ClickHandler({ setClicked }) {
  useMapEvent("click", async (e) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/reverse_geocode/?lat=${e.latlng.lat}&lon=${e.latlng.lng}`
      );
      setClicked({
        ...e.latlng,
        address: response.data.address,
      });
    } catch (error) {
      console.error("Error getting address:", error);
      setClicked({
        ...e.latlng,
        address: "כתובת לא נמצאה",
      });
    }
  });
  return null;
}

export default ClickHandler;
