/* eslint-env jest */
// src/Components/User/UserProfile.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import UserProfile from "./UserProfile";
import { AuthProvider } from "./AuthContext";
import { MemoryRouter } from "react-router-dom";

test("מציג הודעת התחברות אם המשתמש לא מחובר", () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    </AuthProvider>
  );
  // בודקים שיש את הטקסט של "אנא התחבר"
  expect(screen.getByText(/אנא התחבר כדי לצפות בפרופיל שלך/i)).toBeInTheDocument();
});
