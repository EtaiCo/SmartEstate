import React, { useState, useEffect } from "react";

export default function LikeButton({ adId, initiallyLiked = false }) {
  const [liked, setLiked] = useState(initiallyLiked);

  useEffect(() => {
    setLiked(initiallyLiked);
  }, [initiallyLiked]);

  const handleToggle = async () => {
    try {
      if (liked) {
        // Unlike - DELETE request
        const response = await fetch(`http://localhost:8000/like/${adId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (response.ok) {
          setLiked(false);
        } else {
          const data = await response.json();
          alert(data.detail || "שגיאה בהסרה ממועדפים");
        }
      } else {
        // Like - POST request
        const response = await fetch("http://localhost:8000/like/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ad_id: adId
          }),
        });

        if (response.ok) {
          setLiked(true);
        } else {
          const data = await response.json();
          alert(data.detail || "שגיאה למועדפים");
        }
      }
    } catch (error) {
      alert("שגיאת רשת");
      console.error(error);
    }
  };

  return (
    <div
      role="button"
      title={liked ? "הסר ממועדפים" : "הוסף למועדפים"}
      onClick={handleToggle}
      style={{ fontSize: "1.5rem", cursor: "pointer", userSelect: "none" }}
    >
      {liked ? "❤️" : "🤍"}
    </div>
  );
}