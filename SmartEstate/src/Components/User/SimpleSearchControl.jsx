import { useState, useEffect } from "react";
import axios from "axios";

export default function SimpleSearchControl({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchAddress(query);
      } else {
        setResults([]);
      }
    }, 500); // מחכה 500 מילי-שניות אחרי הקלדה לפני חיפוש

    return () => clearTimeout(timeoutId); // מבטל חיפוש ישן אם מקלידים מהר
  }, [query]);

  const searchAddress = async (query) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/search?q=${encodeURIComponent(query)}`
      );
      setResults(response.data);
    } catch (error) {
      console.error("שגיאה בחיפוש כתובת:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (result) => {
    console.log("result:", result);
    onSelect(result);
    setResults([]);
    setQuery(result.address || result.name);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="הזן כתובת או מקום..."
        className="form-control"
      />
      {isLoading && <div className="mt-2">טוען תוצאות...</div>}

      {results.length > 0 && (
        <ul className="list-group mt-2">
          {results.map((result, idx) => (
            <li
              key={idx}
              className="list-group-item list-group-item-action"
              style={{ cursor: "pointer" }}
              onClick={() => handleSelect(result)}
            >
              {result.address || result.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
