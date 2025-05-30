// FeatureFilter.jsx
import React, { useState, useRef, useEffect } from "react";
import { Dropdown, Button } from "react-bootstrap";

/**
 * props:
 *  - selected   : array<string>  – המאפיינים שבחר המשתמש
 *  - onChange   : fn(newArray)   – מופעל כאשר נעשה שינוי בבחירה
 */
export default function FeatureFilter({ selected, onChange }) {
  const FEATURES = {
    has_elevator: "מעלית",
    has_parking: "חניה",
    has_balcony: "מרפסת",
    has_garden: "גינה",
    pets_allowed: "ידידותי לחיות",
    accessibility: "נגישות",
  };

  const [show, setShow] = useState(false);
  const toggleRef = useRef(null);

  // סגירה אוטומטית בלחיצה מחוץ
  const handleClickOutside = (e) => {
    if (toggleRef.current && !toggleRef.current.contains(e.target)) {
      setShow(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFeature = (key) => {
    if (selected.includes(key)) onChange(selected.filter((f) => f !== key));
    else onChange([...selected, key]);
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  // כיתוב הכפתור (כמה נבחרו)
  const buttonLabel =
    selected.length === 0 ? "בחר " : `נבחרו ${selected.length}`;

  return (
    <div style={{ marginTop: "0.5rem", direction: "rtl" }} ref={toggleRef}>
      <div
        style={{
          fontWeight: "bold",
          marginBottom: "0.3rem",
          fontSize: "1.05rem",
        }}
      >
        מאפיינים
      </div>
      <Dropdown show={show} onToggle={() => setShow(!show)}>
        <Dropdown.Toggle
          variant="outline-secondary"
          style={{
            width: "120px",
            minWidth: "100px",
            textAlign: "center",
            fontSize: "1rem",
            direction: "rtl",
          }}
          onClick={() => setShow(!show)}
        >
          {buttonLabel}
        </Dropdown.Toggle>

        <Dropdown.Menu
          style={{ width: "240px", padding: "0.7rem 0.7rem 0.5rem 0.7rem" }}
        >
          {Object.entries(FEATURES).map(([key, label]) => (
            <div
              key={key}
              className="form-check"
              style={{ textAlign: "right" }}
            >
              <input
                className="form-check-input"
                type="checkbox"
                id={`feat-${key}`}
                checked={selected.includes(key)}
                onChange={() => toggleFeature(key)}
              />
              <label
                className="form-check-label"
                htmlFor={`feat-${key}`}
                style={{
                  userSelect: "none",
                  fontSize: "1rem",
                  marginRight: "0.45rem",
                }}
              >
                {label}
              </label>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "0.8rem",
            }}
          >
            <Button
              variant="link"
              size="sm"
              style={{
                color: "#ff5e5e",
                fontWeight: 600,
                textDecoration: "underline",
                fontSize: "0.98rem",
                padding: 0,
              }}
              onClick={clearAll}
              tabIndex={0}
            >
              נקה בחירה
            </Button>
          </div>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}
