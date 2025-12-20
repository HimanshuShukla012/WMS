import { MdAlternateEmail } from "react-icons/md";
import { FaFingerprint, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useState } from "react";
import Navbar from "./Navbar";
import { useAuth } from "./AuthContext";  // Import useAuth hook
import { useNavigate } from "react-router-dom";


const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();


  // Get setters from Auth context
  const { setToken, setUserID, setRole } = useAuth();

  const togglePasswordView = () => setShowPassword(!showPassword);

  // In your Login.tsx, update the handleLogin function's success block:

// Replace the handleLogin function in your Login.tsx with this updated version:

const handleLogin = async () => {
  setError("");
  if (!username.trim() || !password.trim()) {
    setError("Please enter a valid User ID and Password");
    return;
  }
  
  try {
    const response = await fetch(
      "https://wmsapi.kdsgroup.co.in/api/Login/UserLogin",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify({
          Id: 0,
          UserName: username,
          Password: password,
        }),
      }
    );

    const data = await response.json();
    console.log("Login API response:", data);

    if (response.ok && data.Token) {
      // Decode JWT token payload to extract role
      const tokenParts = data.Token.split(".");
      if (tokenParts.length !== 3) {
        setError("Invalid token format");
        return;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const roleFromToken =
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]?.toLowerCase() ||
        "";

      if (!roleFromToken) {
        setError("User role not found in token");
        return;
      }

      // Save token, userID, and role in localStorage first
      localStorage.setItem("authToken", data.Token);
      localStorage.setItem("userID", data.UserID);
      localStorage.setItem("role", roleFromToken);

      // ✅ clear old cached user info so new login reflects correctly
      localStorage.removeItem("cachedUserInfo");

      if (data.uparm) {
        localStorage.setItem("uparm", data.uparm);
      } else {
        // Try extracting from JWT payload if not directly in response
        if (payload.uparm) {
          localStorage.setItem("uparm", payload.uparm);
        }
      }

      // Set context state after localStorage to ensure consistency
      setToken(data.Token);
      setUserID(data.UserID);
      setRole(roleFromToken);

      // ✅ Dispatch custom event to notify other tabs/components about auth change
      window.dispatchEvent(new Event("authStateChange"));

      // Redirect based on role
      if (roleFromToken === "admin") {
        navigate("/admin/dashboard");
      } else if (roleFromToken === "gram panchayat") {
        navigate("/gp/dashboard");
      } else if (roleFromToken === "call center") {
        navigate("/callcenter/dashboard");
      } else if (roleFromToken === "director") {
        navigate("/director/dashboard");
      } else if (roleFromToken === "dd") {
        navigate("/dd/dashboard");
      } else if (roleFromToken === "dpro") {
        navigate("/dpro/dashboard");
      } else if (roleFromToken === "ado") {
        navigate("/ado/dashboard");
      } else {
        setError("Invalid login role");
        localStorage.clear();
        // ✅ Dispatch event for cleared state too
        window.dispatchEvent(new Event("authStateChange"));
      }
    } else {
      setError(data.ResponseMessage || "Login failed");
    }
  } catch (err) {
    console.error("Login error", err);
    setError("Network error. Please try again.");
  }
};
  return (
    <>
      <Navbar />
      <div
        className="w-full h-screen bg-cover bg-center relative flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-10 text-white"
        style={{ backgroundImage: "url('/background.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60 z-0"></div>

        <div className="relative z-10 w-full md:w-1/2 max-w-xl flex flex-col gap-6 bg-gray-900/80 p-10 md:p-14 rounded-3xl shadow-2xl">
          <img src="/logo.png" alt="logo" className="w-24 md:w-28 mx-auto" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-center">
            WELCOME!
          </h1>

          <div className="flex flex-col gap-5 mt-4">
            <div className="flex items-center gap-4 bg-gray-800 p-5 rounded-xl text-white text-lg">
              <MdAlternateEmail size={24} />
              <input
                type="text"
                placeholder="Username"
                className="bg-transparent border-0 w-full outline-none text-lg text-white placeholder-gray-400"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4 bg-gray-800 p-5 rounded-xl relative text-white text-lg">
              <FaFingerprint size={24} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="bg-transparent border-0 w-full outline-none text-lg text-white placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {showPassword ? (
                <FaRegEyeSlash
                  className="absolute right-5 cursor-pointer"
                  size={20}
                  onClick={togglePasswordView}
                />
              ) : (
                <FaRegEye
                  className="absolute right-5 cursor-pointer"
                  size={20}
                  onClick={togglePasswordView}
                />
              )}
            </div>
          </div>

          {error && (
            <p className="text-red-400 font-semibold text-center">{error}</p>
          )}

          <button
            className="w-full mt-6 p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg font-bold transition"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>

        <div className="relative z-10 hidden md:flex flex-col items-end w-1/2 text-right pr-6">
          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight text-white drop-shadow-lg">
             Water Management System
          </h1>
          
        </div>
      </div>
    </>
  );
};

export default Login;