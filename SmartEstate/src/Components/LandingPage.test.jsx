import React from "react";
import { render, screen } from "@testing-library/react";
import LandingPage from "./LandingPage";

// Mock image import
jest.mock("../assets/landing-illustration.png", () => "landing-illustration.png");

jest.mock("react-bootstrap", () => {
  const Actual = jest.requireActual("react-bootstrap");
  return {
    ...Actual,
    Container: ({ children, ...props }) => {
      const { fluid, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    Row: ({ children, ...props }) => <div {...props}>{children}</div>,
    Col: ({ children, ...props }) => <div {...props}>{children}</div>,
    Button: ({ children, ...props }) => <button {...props}>{children}</button>,
    Form: ({ children, ...props }) => <form {...props}>{children}</form>,
  };
});

describe("LandingPage", () => {
  test("מציג את כפתור יאללה חפש", () => {
    render(<LandingPage />);
    expect(screen.getByRole("button", { name: /!יאללה חפש/ })).toBeInTheDocument();
  });

  test("מכיל את הטקסט של הפסקה", () => {
    render(<LandingPage />);
    expect(screen.getByText(/בונה עבורך חווית חיפוש דירה מותאמת אישית/)).toBeInTheDocument();
  });

  describe("LandingPage", () => {
    test("מציג את כפתור יאללה חפש", () => {
      render(<LandingPage />);
      expect(screen.getByRole("button", { name: /!יאללה חפש/ })).toBeInTheDocument();
    });
  
    test("מכיל את הטקסט של הפסקה", () => {
      render(<LandingPage />);
      expect(screen.getByText(/בונה עבורך חווית חיפוש דירה מותאמת אישית/)).toBeInTheDocument();
    });
  
    // בדיקה 1: שהכותרת הראשית מופיעה
    test("מציג את הכותרת הראשית", () => {
      render(<LandingPage />);
      expect(screen.getByRole("heading", { name: /הגיע הזמן/ })).toBeInTheDocument();
      expect(screen.getByText(/שהחיפוש יתאים את עצמו אליך/)).toBeInTheDocument();
    });
  
    // בדיקה 2: שהאימג' הראשי מופיע
    test("מכיל תמונה עם alt מתאים", () => {
      render(<LandingPage />);
      const img = screen.getByAltText(/SmartEstate visual path/i);
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "landing-illustration.png");
    });
  });
  
});
