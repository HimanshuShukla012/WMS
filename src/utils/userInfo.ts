import { useState, useEffect } from "react";

// Shared constants
const CACHE_KEY = "cachedUserInfo";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedUserInfo {
  userId: number | null;
  role: string;
  token: string;
  timestamp: number;
}

// Helper: Decode token
const decodeToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId =
      payload?.UserID !== undefined && payload?.UserID !== null
        ? payload.UserID
        : payload?.UserId !== undefined && payload?.UserId !== null
        ? payload.UserId
        : null;

    const role =
      payload?.Role ||
      payload?.role ||
      payload?.UserRole ||
      payload?.UserRoll ||   // handles your case
      "";

    return {
      userId: Number(userId), // ensure it's a number
      role,
    };
  } catch {
    return { userId: null, role: "" };
  }
};

// ✅ Get User Info (non-React)
export const getUserInfo = (): { userId: number | null; role: string } => {
  const now = Date.now();
  const token = localStorage.getItem("authToken");
  if (!token) return { userId: null, role: "" };

  const cached = localStorage.getItem(CACHE_KEY);

  if (cached) {
    const parsed: CachedUserInfo = JSON.parse(cached);

    // Invalidate cache if expired OR token changed
    if (now - parsed.timestamp < CACHE_DURATION && parsed.token === token) {
      return { userId: parsed.userId, role: parsed.role }; // use cache
    } else {
      localStorage.removeItem(CACHE_KEY);
    }
  }

  // Decode token if no valid cache
  const { userId, role } = decodeToken(token);

  // Save to cache with token reference
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ userId, role, token, timestamp: now })
  );

  return { userId, role };
};

// ✅ Fixed React hook version with loading state
export const useUserInfo = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); // ✅ Add loading state
  const [error, setError] = useState<string | null>(null); // ✅ Add error state

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);
      
      const { userId, role } = getUserInfo();
      
      setUserId(userId);
      setRole(role);
      
      // If no userId found, set error
      if (!userId) {
        setError("User ID not found. Please login again.");
      }
    } catch (err) {
      console.error("Error getting user info:", err);
      setError("Error retrieving user information");
      setUserId(null);
      setRole("");
    } finally {
      setLoading(false); // ✅ Set loading to false when done
    }
  }, []);

  return { userId, role, loading, error }; // ✅ Return loading and error states
};