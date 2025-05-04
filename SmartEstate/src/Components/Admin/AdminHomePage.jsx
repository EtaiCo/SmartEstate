import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { options } from "./AdminOptions"; // Assuming you have a file that exports the options

const AdminHomePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // You can validate the session here if needed
    setUser("Admin"); // Replace with actual data from server if needed
  }, []);

  return (
    <>
      <div className="container mt-4">
        <h2 className="mb-4">Admin Dashboard</h2>
        <div className="row">
          {options.map((option, index) => (
            <div key={index} className="col-md-4 mb-3">
              <div
                className="card h-100 shadow-sm"
                onClick={() => navigate(option.path)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body">
                  <h5 className="card-title">{option.title}</h5>
                  <p className="card-text text-muted">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminHomePage;
