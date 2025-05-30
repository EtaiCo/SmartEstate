import React from "react";

export default function AdFilters({
  propertyType,
  setPropertyType,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  adType,
  setAdType,
  maxSize,
  setMaxSize,
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "1.2rem",
        alignItems: "flex-end",
        marginTop: "1.2rem",
        direction: "rtl",
      }}
    >
      {/* סוג נכס */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: "bold", marginBottom: "0.3rem" }}>
          סוג נכס
        </div>
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          style={{ width: "120px", direction: "rtl" }}
        >
          <option value="">הצג הכל</option>
          <option value="apartment">דירה</option>
          <option value="house">בית פרטי</option>
          <option value="penthouse">פנטהאוס</option>
          <option value="studio">סטודיו</option>
        </select>
      </div>

      {/* מחיר מינימום */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: "bold", marginBottom: "0.3rem" }}>
          מחיר מינ׳
        </div>
        <input
          type="number"
          placeholder="0"
          value={minPrice || ""}
          onChange={(e) => setMinPrice(Number(e.target.value))}
          style={{
            width: "80px",
            minWidth: "60px",
            padding: "0.3rem",
            marginTop: "0.2rem",
            direction: "rtl",
          }}
          min={0}
        />
      </div>

      {/* מחיר מקסימום */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: "bold", marginBottom: "0.3rem" }}>
          מחיר מקס׳
        </div>
        <input
          type="number"
          placeholder="999999"
          value={maxPrice || ""}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          style={{
            width: "80px",
            minWidth: "60px",
            padding: "0.3rem",
            marginTop: "0.2rem",
            direction: "rtl",
          }}
          min={0}
        />
      </div>

      {/* סוג מודעה */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: "bold", marginBottom: "0.3rem" }}>
          סוג מודעה
        </div>
        <select
          value={adType}
          onChange={(e) => setAdType(e.target.value)}
          style={{
            width: "120px",
            minWidth: "100px",
            padding: "0.3rem",
            marginTop: "0.2rem",
            direction: "rtl",
          }}
        >
          <option value="">הצג הכל</option>
          <option value="מכירה">מכירה</option>
          <option value="השכרה">השכרה</option>
        </select>
      </div>

      {/* גודל מקסימלי */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: "bold", marginBottom: "0.3rem" }}>
          גודל מקסימלי (מ"ר)
        </div>
        <input
          type="number"
          placeholder="לדוג׳ 120"
          value={maxSize || ""}
          onChange={(e) => setMaxSize(Number(e.target.value))}
          style={{
            width: "120px",
            minWidth: "100px",
            padding: "0.3rem",
            marginTop: "0.2rem",
            direction: "rtl",
          }}
          min={0}
        />
      </div>
    </div>
  );
}
