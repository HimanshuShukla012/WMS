import { MdAlternateEmail } from "react-icons/md";
import { FaFingerprint } from "react-icons/fa";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useState } from "react";
import Navbar from "./Navbar"; // ✅ Import

const Login = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const togglePasswordView = () => setShowPassword(!showPassword);

  return (
    <>
      <Navbar />
      <div
        className="w-full h-screen bg-cover bg-center relative flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-10 text-white"
        style={{ backgroundImage: "url('/background.jpg')" }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 z-0"></div>

        {/* Login Box - Bigger */}
        <div className="relative z-10 w-full md:w-1/2 max-w-xl flex flex-col gap-6 bg-gray-900/80 p-10 md:p-14 rounded-3xl shadow-2xl">
          <img src="/logo.png" alt="logo" className="w-24 md:w-28 mx-auto" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-center">WELCOME BACK!</h1>

          <div className="flex flex-col gap-5 mt-4">
            <div className="flex items-center gap-4 bg-gray-800 p-5 rounded-xl text-white text-lg">
              <MdAlternateEmail size={24} />
              <input
                type="email"
                placeholder="Email address"
                className="bg-transparent border-0 w-full outline-none text-lg text-white placeholder-gray-400"
              />
            </div>

            <div className="flex items-center gap-4 bg-gray-800 p-5 rounded-xl relative text-white text-lg">
              <FaFingerprint size={24} />
              <input
                type={showPassword ? "password" : "text"}
                placeholder="Password"
                className="bg-transparent border-0 w-full outline-none text-lg text-white placeholder-gray-400"
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

          <button className="w-full mt-6 p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg font-bold transition">
            Login
          </button>
        </div>

        {/* Right Side Heading */}
        <div className="relative z-10 hidden md:flex flex-col items-end w-1/2 text-right pr-6">
          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight text-white drop-shadow-lg">
            Integrated Water Management System
          </h1>
          <p className="text-xl lg:text-2xl mt-6 text-gray-200 font-semibold max-w-xl drop-shadow">
            Operation & Maintenance of Rural Water Supply Projects in Uttar Pradesh
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
