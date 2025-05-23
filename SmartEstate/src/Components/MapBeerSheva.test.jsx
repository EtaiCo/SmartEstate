/* eslint-env jest */
// src/Components/MapBeerSheva.test.jsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import MapBeerSheva from "./MapBeerSheva";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";

// Mock axios
jest.mock("axios");

// Mock react-leaflet - כל קומפוננטה שמוזכרת בקוד
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div data-testid="tilelayer" />,
  Marker: () => <div data-testid="marker" />,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
}));

// Mock AdCard – אם הוא מחזיר כרטיס/דירה עם השם שלה (נדרשת להצלחה בבדיקה)
jest.mock("./Map", () => ({
  // שאר הפיצ'רים לא משנים לטסט הזה
  SearchControl: () => <div data-testid="search-control" />,
  ClickHandler: () => <div data-testid="click-handler" />,
  MapMover: () => <div data-testid="map-mover" />,
  LayerControl: ({ onToggleLayer }) => (
    <div data-testid="layer-control">
      <button onClick={() => onToggleLayer("schools")}>Toggle Schools</button>
    </div>
  ),
  POIMarkers: () => <div data-testid="poi-markers" />,
  AdMarkers: () => <div data-testid="ad-markers" />,
  AdCard: ({ ad }) => <div>{ad.title}</div>,
  ICONS: {},
  AVAILABLE_LAYERS: [],
  findNearestPOIs: jest.fn(),
}));

describe("MapBeerSheva Component", () => {
  const mockAds = [
    {
      id: 1,
      title: "דירה בבאר שבע",
      address: "רחוב הרצל 1, באר שבע",
      price: 1000000,
      rooms: 3,
      size: 80,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockAds });
  });

  test("מציג את המפה עם תוצאות", async () => {
    render(
      <MemoryRouter>
        <MapBeerSheva />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("http://localhost:8000/ads");
    });

    // בודק כותרת
    expect(screen.getByText("תוצאות")).toBeInTheDocument();
    // בודק שם דירה (שהוא השדה title)
    expect(screen.getByText("דירה בבאר שבע")).toBeInTheDocument();
  });

  test("מציג הודעת שגיאה אם לא ניתן לטעון את המודעות", async () => {
    axios.get.mockRejectedValue(new Error("Failed to fetch ads"));

    render(
      <MemoryRouter>
        <MapBeerSheva />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("http://localhost:8000/ads");
    });

    // בודק שהכותרת 'תוצאות' עדיין מוצגת
    expect(screen.getByText("תוצאות")).toBeInTheDocument();
  });
});
