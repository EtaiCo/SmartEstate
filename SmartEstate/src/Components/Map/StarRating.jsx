import React from "react";

export default function StarRating({ stars }) {
  const fullStars = Math.floor(stars);
  const halfStar = stars % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div style={{ color: "#ffc107", fontSize: "1.1rem" }}>
      {"★".repeat(fullStars)}
      {halfStar ? "½" : ""}
      {"☆".repeat(emptyStars)}
    </div>
  );
}
