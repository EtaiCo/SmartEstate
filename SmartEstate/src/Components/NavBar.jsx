import React, { useState } from "react";
import { Container, Nav, Navbar, Button, NavDropdown, Modal } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaUserPlus, FaSignInAlt, FaPlus, FaSearch } from "react-icons/fa";
import { useAuth } from "./User/AuthContext";
import Login from "./User/Login";
import Register from "./User/Register";
import "./NavBar.css";

const NavBar = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/logout/", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <>
      <Navbar expand="lg" className="custom-navbar py-3" bg="white">
        <Container fluid>
          {/* Right: Logo */}
          <Navbar.Brand as={Link} to="/" className="navbar-brand-hebrew ms-3">
            <span className="logo-text">SmartEstate</span>
            <span className="logo-dot"></span>
          </Navbar.Brand>

          {/* Center: Nav Links */}
          <Nav className="mx-auto gap-4">
            <Nav.Link as={Link} to="/about" className="nav-center-link">מי אנחנו?</Nav.Link>
            <Nav.Link as={Link} to="/advisors" className="nav-center-link">היועצים שלנו</Nav.Link>
            <Nav.Link as={Link} to="/faq" className="nav-center-link">שאלות נפוצות</Nav.Link>
          </Nav>

          {/* Left: Action Buttons */}
          <div className="d-flex gap-2 me-auto">
            {user ? (
              <>
                <Button as={Link} to="/app" variant="warning" className="rounded-pill nav-btn me-2">
                  לחיפוש <FaSearch className="ms-2" />
                </Button>

                <Button as={Link} to="/create-ad" variant="dark" className="rounded-pill nav-btn me-2">
                  הוסף מודעה <FaPlus className="ms-2" />
                </Button>

                <NavDropdown title={`שלום, ${user.first_name}`} className="user-dropdown" align="end">
                  <NavDropdown.Item as={Link} to="/profile">הפרופיל שלי</NavDropdown.Item>
                  {user.is_admin && (
                    <NavDropdown.Item as={Link} to="/adminHomePage">ניהול</NavDropdown.Item>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>התנתק</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Button variant="warning" className="rounded-pill nav-btn" onClick={() => setShowLogin(true)}>
                  התחברות <FaSignInAlt className="ms-2" />
                </Button>
                <Button variant="outline-dark" className="rounded-pill nav-btn" onClick={() => setShowRegister(true)}>
                  הרשמה <FaUserPlus className="ms-2" />
                </Button>
              </>
            )}
          </div>
        </Container>
      </Navbar>

      {/* Login Modal */}
      <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>התחברות</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Login closeModal={() => setShowLogin(false)} />
        </Modal.Body>
      </Modal>

      {/* Register Modal */}
      <Modal show={showRegister} onHide={() => setShowRegister(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>הרשמה</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Register closeModal={() => setShowRegister(false)} />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NavBar;
