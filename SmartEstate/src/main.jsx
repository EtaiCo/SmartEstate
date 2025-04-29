import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Components/Layout";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import App from "./App.jsx";
import Register from "./Components/User/Register.jsx";
import Login from "./Components/User/LogIn.jsx";
import UserProfile from "./Components/User/UserProfile.jsx";
import ChangePassword from "./Components/User/ChangePassword.jsx";
import { AuthProvider } from "./Components/User/AuthContext.jsx";
import AdminHomePage from "./Components/Admin/AdminHomePage.jsx";
import PersonalQuestionnaire from "./Components/User/PersonalQuestionnaire.jsx";
import UserAnalytics from "./Components/Admin/UserAnalytics.jsx";
import ManageUsers from "./Components/Admin/ManageUsers.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <Layout /> */}
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Wrap all routes in a layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<App />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/adminHomePage" element={<AdminHomePage />} />
            <Route path="/admin/analytics" element={<UserAnalytics />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route
              path="/personal-questionnaire"
              element={<PersonalQuestionnaire />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
