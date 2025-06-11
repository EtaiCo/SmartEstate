import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const local = sessionStorage.getItem("user");
    return local ? JSON.parse(local) : null;
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    const local = sessionStorage.getItem("isAdmin");
    return local ? JSON.parse(local) : false;
  });

  // עדכון sessionStorage בכל שינוי ב-user
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    sessionStorage.setItem("isAdmin", JSON.stringify(isAdmin));
  }, [isAdmin]);

  // טעינה מהשרת לאחר עליית האפליקציה
  useEffect(() => {
    axios
      .get("http://localhost:8000/dashboard", { withCredentials: true })
      .then((res) => {
        if (res.data.user) {
          setUser(res.data.user);
          setIsAdmin(res.data.user.is_admin || false);
        }
      })
      .catch(() => {
        setUser(null);
        setIsAdmin(false);
      });
  }, []);

  return (
    // Provide user and isAdmin state to the context
    <AuthContext.Provider value={{ user, setUser, isAdmin, setIsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
