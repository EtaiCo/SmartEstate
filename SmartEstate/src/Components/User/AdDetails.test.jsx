import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AdDetails from "./AdDetails";
import axios from "axios";

// Mock useParams
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "123" }),
}));

// Mock window.scrollTo ב-JSDOM
beforeAll(() => {
  window.scrollTo = jest.fn();
});

// Mock react-bootstrap (כולל Card.Body)
jest.mock("react-bootstrap", () => {
  const Actual = jest.requireActual("react-bootstrap");
  const Card = ({ children, ...props }) => <div {...props}>{children}</div>;
  Card.Body = ({ children, ...props }) => <div {...props}>{children}</div>;
  Card.Header = ({ children, ...props }) => <div {...props}>{children}</div>;
  return {
    ...Actual,
    Spinner: () => <div data-testid="spinner">Spinner</div>,
    Container: ({ children }) => <div>{children}</div>,
    Row: ({ children }) => <div>{children}</div>,
    Col: ({ children }) => <div>{children}</div>,
    Card,
  };
});

// Mock axios
jest.mock("axios");

const mockAd = {
  id: 123,
  property_type: "apartment",
  ad_type: "השכרה",
  size: 90,
  floor: 2,
  rooms: 4,
  price: 1500000,
  address: "רח' הרצל 1, באר שבע",
  latitude: 31.252,
  longitude: 34.791,
  has_balcony: true,
  accessibility: false,
  has_elevator: true,
  has_parking: true,
  pets_allowed: false,
  description: "דירה מהממת במרכז העיר.",
  publisher_name: "משה לוי",
  contact_phone: "050-1234567",
  publish_date: "2024-05-20T08:30:00Z",
};

const mockPOIs = {
  features: [],
};

describe("AdDetails", () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockAd });
    axios.post.mockResolvedValue({ data: mockPOIs });
  });

  it("מציג Spinner בהתחלה", () => {
    render(<AdDetails />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("מציג פרטי מודעה אחרי טעינה", async () => {
    render(<AdDetails />);
    await waitFor(() => {
      expect(screen.getByText("דירה להשכרה")).toBeInTheDocument();
    });
    expect(screen.getByText("₪1,500,000")).toBeInTheDocument();
    expect(screen.getByText("רח' הרצל 1, באר שבע")).toBeInTheDocument();
    expect(screen.getByText("משה לוי")).toBeInTheDocument();
    expect(screen.getByText("050-1234567")).toBeInTheDocument();
    expect(screen.getByText("דירה מהממת במרכז העיר.")).toBeInTheDocument();
  });
});
