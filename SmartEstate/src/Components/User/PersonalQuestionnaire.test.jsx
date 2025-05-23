import React from "react";
import { render, screen } from "@testing-library/react";
import PersonalQuestionnaire from "./PersonalQuestionnaire";

// Mock react-router-dom + axios + react-bootstrap
jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));
jest.mock("axios");
jest.mock("react-bootstrap", () => {
  const Actual = jest.requireActual("react-bootstrap");
  return {
    ...Actual,
    Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  };
});

describe("PersonalQuestionnaire", () => {
  test("מציג את הכותרת של השלב הראשון", () => {
    render(<PersonalQuestionnaire />);
    // יש שני כותרות, אז נשתמש ב-allByRole
    const headings = screen.getAllByRole("heading", { name: /למי אנחנו מחפשים/ });
    expect(headings.length).toBeGreaterThan(0); // לפחות אחת נמצאה
  });

  test("מציג את כפתור תן לי עוד אחת!", () => {
    render(<PersonalQuestionnaire />);
    expect(screen.getByRole("button", { name: /תן לי עוד אחת!/ })).toBeInTheDocument();
  });
  // בדיקה 1: בודק שהרדיו הראשון (לזוג בתחילת הדרך) קיים בדף
  test("מציג את אופציית 'זוג בתחילת הדרך'", () => {
    render(<PersonalQuestionnaire />);
    expect(screen.getByLabelText(/זוג בתחילת הדרך/)).toBeInTheDocument();
  });

  // בדיקה 2: בודק שכפתור 'שאלה קודמת' לא מופיע בשלב הראשון
  test("לא מציג את כפתור 'שאלה קודמת' בשלב הראשון", () => {
    render(<PersonalQuestionnaire />);
    expect(screen.queryByRole("button", { name: /שאלה קודמת/ })).not.toBeInTheDocument();
  });
});
