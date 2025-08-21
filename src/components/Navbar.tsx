import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import gsap from "gsap";

const Navbar = () => {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      ".navbar",
      { opacity: 0, y: -40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        clearProps: "opacity,transform",
      }
    );
  }, []);

  const toggleNav = () => setNavOpen(!navOpen);

  return (
    <nav className="navbar fixed top-0 left-0 w-full z-50 backdrop-blur bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-800 text-white border-b border-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Left: Logo & Title */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          <img src="/logo.png" alt="IWMS Logo" className="h-14 w-auto object-contain" />
          <div className="leading-tight">
            <div className="text-lg md:text-xl font-bold">
               Water Management System
            </div>
            
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <ul className="hidden md:flex gap-10 font-semibold text-base xl:text-lg text-white">
          <li><a href="#home" className="hover:text-cyan-400 transition">होम</a></li>
          <li><a href="#about" className="hover:text-cyan-400 transition">योजना</a></li>
          <li><a href="#contact" className="hover:text-cyan-400 transition">संपर्क</a></li>
          <li><a href="#info" className="hover:text-cyan-400 transition">जानकारी</a></li>
        </ul>

        {/* Right: Buttons */}
        <div className="hidden md:flex gap-3 flex-shrink-0">
          <Link to="/login">
            <button className="bg-blue-700 px-5 py-2 rounded-full hover:bg-blue-800 transition font-semibold text-sm">
              Login
            </button>
          </Link>
          <Link to="/complaint">
            <button className="bg-red-600 px-5 py-2 rounded-full hover:bg-red-700 transition font-semibold text-sm">
              शिकायत दर्ज करें
            </button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          aria-label="Toggle Menu"
          onClick={toggleNav}
          className="md:hidden text-white text-2xl ml-4"
        >
          {navOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          navOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        } bg-blue-950 px-6 pb-6`}
      >
        <ul className="flex flex-col gap-4 pt-4 font-medium text-lg text-white">
          <li><a href="#home" onClick={toggleNav}>होम</a></li>
          <li><a href="#about" onClick={toggleNav}>योजना</a></li>
          <li><a href="#contact" onClick={toggleNav}>संपर्क</a></li>
          <li><a href="#info" onClick={toggleNav}>जानकारी</a></li>
          <li>
            <Link to="/login">
              <button
                onClick={toggleNav}
                className="w-full mt-3 bg-blue-700 text-white px-6 py-2 rounded-full hover:bg-blue-800 transition"
              >
                लॉगिन
              </button>
            </Link>
          </li>
          <li>
            <Link to="/complaint">
              <button
                onClick={toggleNav}
                className="w-full mt-3 bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition"
              >
                शिकायत दर्ज करें
              </button>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
