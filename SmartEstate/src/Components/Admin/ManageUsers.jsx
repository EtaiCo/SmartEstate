import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/admin/users", {
        withCredentials: true,
      });
      console.log("Users fetched successfully:", response.data);
      setUsers(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching users:", error.response || error);
      setError(
        `שגיאה בטעינת משתמשים: ${error.response?.data?.detail || error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm(`בטוח שברצונך למחוק את משתמש מספר ${userId}?`)) return;

    setActionInProgress(true);

    try {
      console.log(`Sending delete request for user ID: ${userId}`);
      const response = await axios.delete(
        `http://localhost:8000/users/${userId}`,
        {
          withCredentials: true,
        }
      );

      console.log("Delete response:", response.data);
      alert(`המשתמש נמחק בהצלחה: ${response.data.detail}`);

      // Refresh the user list
      fetchUsers();
    } catch (error) {
      console.error("Delete error:", error.response || error);

      let errorMsg = "נכשל במחיקת המשתמש";
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

  if (isLoading) {
    return (
      <div className="container mt-4" dir="rtl">
        <p>טוען משתמשים...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4" dir="rtl">
      <h2 className="mb-4">ניהול משתמשים</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          <button
            className="btn btn-primary mb-3"
            onClick={fetchUsers}
            disabled={actionInProgress}
          >
            רענן רשימת משתמשים
          </button>

          {users.length === 0 ? (
            <p>לא נמצאו משתמשים.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="thead-dark">
                  <tr>
                    <th>מזהה</th>
                    <th>אימייל</th>
                    <th>שם פרטי</th>
                    <th>שם משפחה</th>
                    <th>מנהל?</th>
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.ID}>
                      <td>{user.ID}</td>
                      <td>{user.email}</td>
                      <td>{user.first_name}</td>
                      <td>{user.last_name}</td>
                      <td>{user.is_admin ? "כן" : "לא"}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteUser(user.ID)}
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

export default ManageUsers;
