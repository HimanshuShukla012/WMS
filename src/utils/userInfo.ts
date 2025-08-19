// Shared constants
const CACHE_KEY = "cachedUserInfo";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedUserInfo {
  userId: number | null;
  role: string;
  token: string;      // ✅ new
  timestamp: number;
}

// Helper: Decode token
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
      payload?.UserRoll ||   // 👈 handles your case
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

// ✅ React hook version
import { useState, useEffect } from "react";

export const useUserInfo = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const { userId, role } = getUserInfo();
    setUserId(userId);
    setRole(role);
  }, []);

  return { userId, role };
};
