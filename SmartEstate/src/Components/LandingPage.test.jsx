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
});
