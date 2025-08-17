// Shared constants
const CACHE_KEY = "cachedUserInfo";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedUserInfo {
  userId: number | null;
  role: string;
  timestamp: number;
}

// Helper: Decode token
const decodeToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      userId: payload?.UserID || payload?.UserId || null,
      role: payload?.Role || "",
    };
  } catch {
    return { userId: null, role: "" };
  }
};

// ✅ Get User Info (non-React)
export const getUserInfo = (): { userId: number | null; role: string } => {
  const now = Date.now();
  const cached = localStorage.getItem(CACHE_KEY);

  if (cached) {
    const parsed: CachedUserInfo = JSON.parse(cached);
    if (now - parsed.timestamp < CACHE_DURATION) {
      return { userId: parsed.userId, role: parsed.role }; // Return cached
    } else {
      localStorage.removeItem(CACHE_KEY); // Expired
    }
  }

  const token = localStorage.getItem("authToken");
  if (!token) return { userId: null, role: "" };

  const { userId, role } = decodeToken(token);

  // Save to cache
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ userId, role, timestamp: now })
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
