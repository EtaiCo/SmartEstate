// utils.js
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

export const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export function createCustomIcon(emoji, bgColor = "white", color = "#222") {
  return L.divIcon({
    className: "custom-icon",
    html: `<div class="custom-marker" style="background:${bgColor};color:${color}"><span>${emoji}</span></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

export const AVAILABLE_LAYERS = [
  { id: "school", name: "בתי ספר", icon: "🏫" },
  { id: "kindergarten", name: "גני ילדים", icon: "👶" },
  { id: "university", name: "מכללות ואוניברסיטאות", icon: "🎓" },
  { id: "shelter", name: "מקלטים", icon: "🏢" },
  { id: "hospital", name: "בתי חולים", icon: "🏥" },
  { id: "pharmacy", name: "בתי מרקחת", icon: "💊" },
  { id: "park", name: "פארקים", icon: "🌳" },
  { id: "playground", name: "גני שעשועים", icon: "🎪" },
  { id: "library", name: "ספריות", icon: "📚" },
  { id: "place_of_worship", name: "בתי כנסת", icon: "🕍" },
  { id: "supermarket", name: "סופרמרקטים", icon: "🛒" },
  { id: "mall", name: "קניונים", icon: "🏬" },
  { id: "bus_station", name: "תחנות אוטובוס", icon: "🚌" },
  { id: "train_station", name: "תחנות רכבת", icon: "🚉" },
  { id: "restaurant", name: "מסעדות", icon: "🍽️" },
  { id: "cafe", name: "בתי קפה", icon: "☕" },
  { id: "gym", name: "מכוני כושר", icon: "💪" },
  { id: "bank", name: "בנקים", icon: "🏦" },
  { id: "post_office", name: "דואר", icon: "📮" },
  { id: "community_center", name: "מרכזים קהילתיים", icon: "🏛️" },
  { id: "daycare", name: "מעונות יום", icon: "👶" },
  { id: "police", name: "תחנות משטרה", icon: "👮" },
  { id: "fire_station", name: "תחנות כיבוי אש", icon: "🚒" },
  { id: "recycling", name: "מרכזי מיחזור", icon: "♻️" },
];

export const LAYER_COLORS = {
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

export const ICONS = AVAILABLE_LAYERS.reduce(
  (acc, layer) => {
    const bg = LAYER_COLORS[layer.id] || "white";
    const color = layer.id === "bus_station" ? "#222" : "#fff";
    acc[layer.id] = createCustomIcon(layer.icon, bg, color);
    return acc;
  },
  {
    ad_for_sale: createCustomIcon("🏘️", "#ffe066", "#222"),
    ad_for_rent: createCustomIcon("🏬", "#a084e8", "#fff"),
    default: DefaultIcon,
  }
);

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestPOIs(lat, lon, pois, activeLayers) {
  const nearestPOIs = {};
  activeLayers.forEach((layer) => {
    const poisOfType = pois.filter((poi) => poi.properties.amenity === layer);
    if (poisOfType.length > 0) {
      const distances = poisOfType.map((poi) => ({
        ...poi,
        distance: calculateDistance(
          lat,
          lon,
          poi.geometry.coordinates[1],
          poi.geometry.coordinates[0]
        ),
      }));
      distances.sort((a, b) => a.distance - b.distance);
      nearestPOIs[layer] = distances[0];
    }
  });
  return nearestPOIs;
}
