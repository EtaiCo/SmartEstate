import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageApartments = () => {
  const [apartments, setApartments] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/admin/ads", {
        withCredentials: true,
      });
      console.log("Apartments fetched successfully:", response.data);
      setApartments(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching apartments:", error.response || error);
      setError(
        `שגיאה בטעינת דירות: ${error.response?.data?.detail || error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteApartment = async (adId) => {
    if (!window.confirm(`בטוח שברצונך למחוק את מודעה מספר ${adId}?`)) return;

    setActionInProgress(true);

    try {
      console.log(`Sending delete request for apartment ID: ${adId}`);
      const response = await axios.delete(`http://localhost:8000/ads/${adId}`, {
        withCredentials: true,
      });

      console.log("Delete response:", response.data);
      alert(`המודעה נמחקה בהצלחה: ${response.data.detail}`);

      // Refresh the apartment list
      fetchApartments();
    } catch (error) {
      console.error("Delete error:", error.response || error);

      let errorMsg = "נכשל במחיקת המודעה";
      if (error.response) {
        errorMsg += `: ${
          error.response.data.detail || error.response.statusText
        }`;
      } else if (error.request) {
        errorMsg += ": לא התקבלה תשובה מהשרת";
      } else {
        errorMsg += `: ${error.message}`;
      }

      alert(errorMsg);
    } finally {
      setActionInProgress(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="container mt-4" dir="rtl">
        <p>טוען מודעות דירות...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4" dir="rtl">
      <h2 className="mb-4">ניהול מודעות דירות</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          <button
            className="btn btn-primary mb-3"
            onClick={fetchApartments}
            disabled={actionInProgress}
          >
            רענן רשימת מודעות
          </button>

          {apartments.length === 0 ? (
            <p>לא נמצאו מודעות דירות.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="thead-dark">
                  <tr>
                    <th>מזהה</th>
                    <th>סוג מודעה</th>
                    <th>סוג נכס</th>
                    <th>כתובת</th>
                    <th>חדרים</th>
                    <th>שטח (מ"ר)</th>
                    <th>מחיר</th>
                    <th>שם מפרסם</th>
                    <th>טלפון</th>
                    <th>תאריך פרסום</th>
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {apartments.map((apartment) => (
                    <tr key={apartment.id}>
                      <td>{apartment.id}</td>
                      <td>{apartment.ad_type}</td>
                      <td>{apartment.property_type}</td>
                      <td>{apartment.address}</td>
                      <td>{apartment.rooms}</td>
                      <td>{apartment.size}</td>
                      <td>{formatCurrency(apartment.price)}</td>
                      <td>{apartment.publisher_name}</td>
                      <td>{apartment.contact_phone}</td>
                      <td>{apartment.publish_date}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteApartment(apartment.id)}
                          disabled={actionInProgress}
                        >
                          מחק
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageApartments;
