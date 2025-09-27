import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  userID: string | null;
  role: string | null;
  token: string | null;
  isLoading: boolean;
  logout: () => void;
  confirmLogout: () => void;
  cancelLogout: () => void;
  showLogoutConfirm: boolean;
  setUserID: React.Dispatch<React.SetStateAction<string | null>>;
  setRole: React.Dispatch<React.SetStateAction<string | null>>;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  getDashboardRoute: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom Logout Confirmation Modal Component
const LogoutConfirmModal: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 transform transition-all duration-200 scale-100">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
          Confirm Logout
        </h3>
        
        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to log out? You'll need to sign in again to access your account.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userID, setUserID] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Function to get dashboard route based on role
  const getDashboardRoute = () => {
    if (!role) return "/login";
    
    switch (role.toLowerCase()) {
      case "admin": return "/admin/dashboard";
      case "gram panchayat": return "/gp/dashboard";
      case "call center": return "/callcenter/dashboard";
      case "director": return "/director/dashboard";
      case "dd": return "/dd/dashboard";
      case "dpro": return "/dpro/dashboard";
      case "ado": return "/ado/dashboard";
      default: return "/login";
    }
  };

  // Function to sync auth state from localStorage
  const syncAuthFromStorage = () => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const storedUserID = localStorage.getItem("userID");
      const storedRole = localStorage.getItem("role");

      if (storedToken && storedUserID && storedRole) {
        // Verify token is still valid
        try {
          const tokenParts = storedToken.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const currentTime = Date.now() / 1000;
            
            // Check if token is expired
            if (payload.exp && payload.exp > currentTime) {
              setToken(storedToken);
              setUserID(storedUserID);
              setRole(storedRole);
              return true; // Auth data is valid
            } else {
              // Token expired, clear storage
              localStorage.clear();
              setToken(null);
              setUserID(null);
              setRole(null);
            }
          }
        } catch (error) {
          console.error("Error parsing token:", error);
          localStorage.clear();
          setToken(null);
          setUserID(null);
          setRole(null);
        }
      } else {
        // No auth data in storage
        setToken(null);
        setUserID(null);
        setRole(null);
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      setToken(null);
      setUserID(null);
      setRole(null);
    }
    return false;
  };

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = () => {
      syncAuthFromStorage();
      setIsLoading(false);
    };

    // Small timeout to ensure DOM is ready
    setTimeout(initializeAuth, 50);

    // Listen for storage changes (cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "authToken" || e.key === "userID" || e.key === "role" || e.key === null) {
        // Re-sync auth state when storage changes in other tabs
        syncAuthFromStorage();
      }
    };

    // Listen for custom auth events (for same-tab updates)
    const handleAuthChange = () => {
      syncAuthFromStorage();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authStateChange", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStateChange", handleAuthChange);
    };
  }, []);

  // Show logout confirmation modal
  const logout = () => {
    setShowLogoutConfirm(true);
  };

  // Handle logout confirmation
  const confirmLogout = () => {
    console.log("Logout confirmed"); // Debug log
    
    try {
      // Clear localStorage
      localStorage.clear();
      console.log("localStorage cleared"); // Debug log
      
      // Reset state
      setToken(null);
      setUserID(null);
      setRole(null);
      setShowLogoutConfirm(false);
      console.log("Auth state cleared"); // Debug log
      
      // Dispatch custom event to notify other tabs/components
      window.dispatchEvent(new Event("authStateChange"));
      console.log("Auth state change event dispatched"); // Debug log
      
      // Force redirect to login
      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
      
    } catch (error) {
      console.error("Error during logout:", error);
      // Force redirect even if there's an error
      window.location.href = "/login";
    }
  };

  // Cancel logout
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <AuthContext.Provider
      value={{ 
        userID, 
        role, 
        token, 
        isLoading,
        logout, 
        confirmLogout,
        cancelLogout,
        showLogoutConfirm,
        setUserID, 
        setRole, 
        setToken,
        getDashboardRoute
      }}
    >
      {children}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};