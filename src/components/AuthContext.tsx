import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  userID: string | null;
  role: string | null;
  token: string | null;
  logout: () => void;
  setUserID: React.Dispatch<React.SetStateAction<string | null>>;
  setRole: React.Dispatch<React.SetStateAction<string | null>>;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userID, setUserID] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUserID = localStorage.getItem("userID");
    const storedRole = localStorage.getItem("role");

    if (storedToken && storedUserID && storedRole) {
      setToken(storedToken);
      setUserID(storedUserID);
      setRole(storedRole);
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUserID(null);
    setRole(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{ userID, role, token, logout, setUserID, setRole, setToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
