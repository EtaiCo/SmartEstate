import React, { useState } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const WHO_OPTIONS = [
  { value: "couple", label: "זוג בתחילת הדרך" },
  { value: "family", label: "משפחה עם ילדים" },
  { value: "single", label: "רווק/ה" },
  { value: "investor", label: 'משקיע/ת נדל"ן' },
  { value: "senior", label: "מבוגר שמחפש שקט" },
  { value: "single_parent", label: "הורה יחיד" },
  { value: "dog_lover", label: "מישהו שחייב לגור ליד הכלב" },
];

const HOUSE_TYPES = [
  { value: "any", label: "אין לי עדיפות" },
  { value: "private_house", label: "בית פרטי" },
  { value: "penthouse", label: "פנטהאוס" },
  { value: "garden_apartment", label: "דירת גן" },
  { value: "apartment", label: "דירה" },
];
const ROOM_OPTIONS = ["1", "2", "3", "4", "5+"];
const HOUSE_FEATURES = [
  { value: "ac", label: "מיזוג אוויר" },
  { value: "balcony", label: "מרפסת" },
  { value: "mamad", label: 'ממ"ד' },
  { value: "elevator", label: "מעלית" },
  { value: "parking", label: "חניה" },
  { value: "storage", label: "מחסן" },
  { value: "ground_floor", label: "דירת קרקע" },
  { value: "garden", label: "גינה" },
  { value: "renovated", label: "משופצת" },
];

const LAYERS = [
  { value: "supermarket", label: "סופרמרקטים", icon: "🛒" },
  { value: "park", label: "פארקים", icon: "🌳" },
  { value: "school", label: "בתי ספר", icon: "🏫" },
  { value: "kindergarten", label: "גני ילדים", icon: "👶" },
  { value: "bus_station", label: "תחנות אוטובוס", icon: "🚌" },
  { value: "train_station", label: "תחנות רכבת", icon: "🚉" },
  { value: "shelter", label: "מקלטים", icon: "🏢" },
  { value: "hospital", label: "בתי חולים", icon: "🏥" },
  { value: "playground", label: "גני שעשועים", icon: "🎪" },
  { value: "library", label: "ספריות", icon: "📚" },
  { value: "place_of_worship", label: "בתי כנסת", icon: "🕍" },
  { value: "mall", label: "קניונים", icon: "🏬" },
  { value: "restaurant", label: "מסעדות", icon: "🍽️" },
  { value: "cafe", label: "בתי קפה", icon: "☕" },
  { value: "community_center", label: "מרכזים קהילתיים", icon: "🏛️" },
  { value: "gym", label: "מכוני כושר", icon: "💪" },
  { value: "post_office", label: "דואר", icon: "📮" },
  { value: "bank", label: "בנק", icon: "🏦" },
  { value: "recycling", label: "מרכזי מיחזור", icon: "♻️" },
  { value: "police", label: "תחנת משטרה", icon: "👮" },
  { value: "fire_station", label: "תחנת כיבוי אש", icon: "🚒" },
];

const steps = [
  {
    title: "למי אנחנו מחפשים?",
    description: "ניתן לבחור תשובה אחת מתוך הרשימה",
  },
  {
    title: "איזה בית אתה מחפש?",
    description: "ניתן לבחור מספר תשובות מתוך הרשימה",
  },
  {
    title: "מה חשוב לך שיהיה במרחק הליכה?",
    description: "ניתן לבחור מספר תשובות מתוך הרשימה",
  },
  { title: "ספר לנו מה הגבולות שלך", description: "" },
];

const yellow = "#FFD43B";
const green = "#25D366";
const font =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export default function PersonalQuestionnaire() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    who: "",
    houseType: "",
    rooms: "",
    features: [],
    importantLayers: [],
    location: "", // “beer_sheva” בסוף
    budgetMin: "",
    budgetMax: "",
  });

  const toggle = (v, list) =>
    setForm((f) => ({
      ...f,
      [list]: f[list].includes(v)
        ? f[list].filter((x) => x !== v)
        : [...f[list], v],
    }));

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const save = async () => {
    try {
      await axios.post("http://localhost:8000/user-preferences/", form, {
        withCredentials: true,
      });
      navigate("/profile");
    } catch {
      alert("שגיאה בשמירת ההעדפות");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        direction: "rtl",
        fontFamily: font,
      }}
    >
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "flex-start",
        }}
      >
        {/* ════════ צהוב – כותרת + סרגל ════════ */}
        <div
          style={{
            flex: 1,
            background: yellow,
            position: "relative",
            padding: "80px 40px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            minHeight: "100vh",
            fontFamily: font,
          }}
        >
          {/* כותרת + תיאור  */}
          <div style={{ position: "absolute", top: 80, right: 40, left: 40 }}>
            <h1
              style={{
                fontWeight: 700,
                fontSize: 56,
                margin: 0,
                lineHeight: 1.1,
                fontFamily: font,
              }}
            >
              {steps[step].title}
            </h1>
            {steps[step].description && (
              <div
                dir="rtl"
                style={{
                  fontSize: 20,
                  color: "#222",
                  marginTop: 12,
                  textAlign: "right",
                  fontFamily: font,
                }}
              >
                {steps[step].description}
              </div>
            )}
          </div>
          {/* סרגל-שלבים – מוצמד לתחתית */}
          <div
            style={{
              position: "absolute",
              right: 32,
              bottom: 200,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              zIndex: 5,
              fontFamily: font,
            }}
          >
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: i <= step ? "#fff" : "#f3e9b7",
                  border: i === step ? `3px solid #222` : "2px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 28,
                  color: i < step ? green : "#222",
                  transition: "all 0.18s",
                  boxShadow: i === step ? "0 2px 12px #2222" : "",
                  fontFamily: font,
                }}
              >
                {i < step ? "✔" : i + 1}
              </div>
            ))}
          </div>
        </div>
        {/* ════════ לבן – טופס ════════ */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            padding: "80px 40px 40px 120px",
            minHeight: "100vh",
            justifyContent: "center",
            fontFamily: font,
          }}
        >
          <div style={{ width: "100%", maxWidth: 650 }}>
            {/* ── שלב 0 ── */}
            {step === 0 && (
              <>
                <h2
                  style={{
                    fontWeight: 700,
                    margin: 0,
                    marginBottom: 32,
                    fontFamily: font,
                  }}
                >
                  {steps[step].title}
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                    fontFamily: font,
                  }}
                >
                  {WHO_OPTIONS.map((o) => (
                    <label
                      key={o.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: 20,
                        cursor: "pointer",
                        fontFamily: font,
                      }}
                    >
                      <input
                        type="radio"
                        name="who"
                        checked={form.who === o.value}
                        onChange={() =>
                          setForm((f) => ({ ...f, who: o.value }))
                        }
                        style={{ accentColor: yellow, marginLeft: 12 }}
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              </>
            )}
            {/* ── שלב 1 ── */}
            {step === 1 && (
              <>
                <h2
                  style={{
                    fontWeight: 700,
                    margin: 0,
                    marginBottom: 24,
                    fontFamily: font,
                  }}
                >
                  סוג הבית
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    marginBottom: 24,
                    fontFamily: font,
                  }}
                >
                  {HOUSE_TYPES.map((o) => (
                    <label
                      key={o.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: 18,
                        cursor: "pointer",
                        fontFamily: font,
                      }}
                    >
                      <input
                        type="radio"
                        name="houseType"
                        checked={form.houseType === o.value}
                        onChange={() =>
                          setForm((f) => ({ ...f, houseType: o.value }))
                        }
                        style={{ accentColor: yellow, marginLeft: 10 }}
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
                <h3
                  style={{
                    fontWeight: 600,
                    margin: 0,
                    marginBottom: 10,
                    fontFamily: font,
                  }}
                >
                  כמות חדרים
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginBottom: 24,
                    fontFamily: font,
                  }}
                >
                  {ROOM_OPTIONS.map((r) => (
                    <label
                      key={r}
                      style={{
                        fontSize: 16,
                        cursor: "pointer",
                        fontFamily: font,
                      }}
                    >
                      <input
                        type="radio"
                        name="rooms"
                        checked={form.rooms === r}
                        onChange={() => setForm((f) => ({ ...f, rooms: r }))}
                        style={{ accentColor: yellow, marginLeft: 6 }}
                      />
                      {r}
                    </label>
                  ))}
                </div>
                <h3
                  style={{
                    fontWeight: 600,
                    margin: 0,
                    marginBottom: 10,
                    fontFamily: font,
                  }}
                >
                  תוספות חשובות
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    fontFamily: font,
                  }}
                >
                  {HOUSE_FEATURES.map((f) => (
                    <label
                      key={f.value}
                      style={{
                        fontSize: 15,
                        cursor: "pointer",
                        minWidth: 120,
                        fontFamily: font,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.features.includes(f.value)}
                        onChange={() => toggle(f.value, "features")}
                        style={{ accentColor: yellow, marginLeft: 6 }}
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              </>
            )}
            {/* ── שלב 2 ── */}
            {step === 2 && (
              <>
                <h2
                  style={{
                    fontWeight: 700,
                    margin: 0,
                    marginBottom: 24,
                    fontFamily: font,
                  }}
                >
                  הסביבה שלך
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 16,
                    fontFamily: font,
                  }}
                >
                  {LAYERS.map((l) => (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() => toggle(l.value, "importantLayers")}
                      style={{
                        background: form.importantLayers.includes(l.value)
                          ? yellow
                          : "#f8f8f8",
                        border: "none",
                        borderRadius: 16,
                        padding: "14px 4px",
                        fontSize: 18,
                        fontWeight: 500,
                        boxShadow: form.importantLayers.includes(l.value)
                          ? "0 2px 8px rgba(0,0,0,0.08)"
                          : "0 1px 3px rgba(0,0,0,0.04)",
                        color: "#222",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        lineHeight: 1.25,
                        whiteSpace: "normal",
                        transition: "all 0.15s",
                        fontFamily: font,
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{l.icon}</span>
                      {l.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {/* ── שלב 3 ── */}
            {step === 3 && (
              <>
                <h2
                  style={{
                    fontWeight: 700,
                    margin: 0,
                    marginBottom: 24,
                    fontFamily: font,
                  }}
                >
                  ספר לנו מה הגבולות שלך
                </h2>
                <div style={{ marginBottom: 24, fontFamily: font }}>
                  <label
                    style={{ fontWeight: 600, fontSize: 18, fontFamily: font }}
                  >
                    עיר
                  </label>
                  <div style={{ marginTop: 12 }}>
                    <label
                      style={{
                        fontSize: 18,
                        cursor: "pointer",
                        fontFamily: font,
                      }}
                    >
                      <input
                        type="radio"
                        name="location"
                        checked={form.location === "beer_sheva"}
                        onChange={() =>
                          setForm((f) => ({ ...f, location: "beer_sheva" }))
                        }
                        style={{ accentColor: yellow, marginLeft: 8 }}
                      />
                      באר שבע
                    </label>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    fontFamily: font,
                  }}
                >
                  <label
                    style={{ fontWeight: 600, fontSize: 18, fontFamily: font }}
                  >
                    טווח תקציב (₪)
                  </label>
                  <input
                    type="number"
                    value={form.budgetMin}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, budgetMin: e.target.value }))
                    }
                    placeholder="מינימום"
                    style={{
                      width: 100,
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid #ccc",
                      fontSize: 16,
                      textAlign: "right",
                      fontFamily: font,
                    }}
                  />
                  <span
                    style={{ fontWeight: 600, fontSize: 18, fontFamily: font }}
                  >
                    -
                  </span>
                  <input
                    type="number"
                    value={form.budgetMax}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, budgetMax: e.target.value }))
                    }
                    placeholder="מקסימום"
                    style={{
                      width: 100,
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid #ccc",
                      fontSize: 16,
                      textAlign: "right",
                      fontFamily: font,
                    }}
                  />
                </div>
              </>
            )}
            {/* ── כפתורי ניווט ── */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 40,
                fontFamily: font,
              }}
            >
              {step > 0 ? (
                <Button
                  variant="light"
                  onClick={prev}
                  style={{
                    fontWeight: 600,
                    fontSize: 18,
                    borderRadius: 999,
                    padding: "12px 32px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    fontFamily: font,
                  }}
                >
                  שאלה קודמת
                </Button>
              ) : (
                <div />
              )}
              {step < steps.length - 1 ? (
                <Button
                  variant="warning"
                  onClick={next}
                  style={{
                    background: "#0F9E76",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 20,
                    border: "none",
                    borderRadius: 999,
                    padding: "12px 40px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
                    fontFamily: font,
                  }}
                  disabled={
                    (step === 0 && !form.who) ||
                    (step === 1 && (!form.houseType || !form.rooms)) ||
                    (step === 3 &&
                      (!form.location || !form.budgetMin || !form.budgetMax))
                  }
                >
                  תן לי עוד אחת!
                </Button>
              ) : (
                <Button
                  variant="success"
                  onClick={save}
                  style={{
                    fontWeight: 700,
                    fontSize: 20,
                    borderRadius: 999,
                    padding: "12px 40px",
                    background: "#0F9E76",
                    border: "none",
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
                    fontFamily: font,
                  }}
                  disabled={
                    !form.location || !form.budgetMin || !form.budgetMax
                  }
                >
                  סיום ושמירה
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
