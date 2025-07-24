import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-800 text-white text-sm mt-20 pt-12 border-t border-blue-800">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10">
          {/* Logo & Tagline */}
          <div>
            <div className="flex items-center gap-4 mb-3">
              <img src="/logo.png" alt="IWMS Logo" className="h-14 w-auto" />
              <div className="leading-tight">
                <div className="font-bold text-base">
                  Integrated Water Management System
                </div>
                <div className="text-gray-300 text-xs">
                  Operation & Maintenance of Rural Water Supply Projects in Uttar Pradesh
                </div>
              </div>
            </div>
            <p className="text-gray-400 mt-3">
              यह वेबसाइट उत्तर प्रदेश पंचायती राज विभाग के अंतर्गत ग्रामीण जल आपूर्ति परियोजनाओं के प्रभावी प्रबंधन हेतु विकसित की गई है।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-cyan-300">त्वरित लिंक</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="hover:text-cyan-400">होम</a></li>
              <li><a href="#about" className="hover:text-cyan-400">योजना</a></li>
              <li><a href="#contact" className="hover:text-cyan-400">संपर्क</a></li>
              <li><a href="#info" className="hover:text-cyan-400">जानकारी</a></li>
              <li><Link to="/login" className="hover:text-cyan-400">लॉगिन</Link></li>
              <li><Link to="/complaint" className="hover:text-cyan-400">शिकायत दर्ज करें</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-cyan-300">संपर्क जानकारी</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <FaMapMarkerAlt className="text-cyan-400 mt-1" />
                <span>
                  पंचायती राज विभाग, उत्तर प्रदेश <br />
                  लोक भवन, लखनऊ - 226001
                </span>
              </li>
              <li className="flex items-center gap-2">
                <FaPhoneAlt className="text-cyan-400" />
                <span>0522-XXXXXXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-cyan-400" />
                <span>support@iwmsup.in</span>
              </li>
            </ul>
          </div>

          {/* Social Media (optional or placeholder) */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-cyan-300">सोशल मीडिया</h3>
            <div className="flex gap-4 text-xl">
              <a href="#" className="hover:text-cyan-400"><FaFacebookF /></a>
              <a href="#" className="hover:text-cyan-400"><FaTwitter /></a>
              <a href="#" className="hover:text-cyan-400"><FaYoutube /></a>
            </div>
            <p className="text-gray-400 mt-4 text-xs">
              आधिकारिक जानकारी के लिए केवल इस पोर्टल का उपयोग करें।
            </p>
            {/* Developer Credit */}
        <div className="text-center text-gray-500 text-xs pt-4 pb-6">
  Developed and maintained by <br />
  <span className="text-white font-semibold">KDS Services Pvt. Ltd.</span>
</div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-800 pt-6 pb-4 text-center text-gray-400 text-xs">
          <p>© {new Date().getFullYear()} पंचायती राज विभाग, उत्तर प्रदेश | सर्वाधिकार सुरक्षित</p>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <a href="#" className="hover:text-cyan-400">डिस्क्लेमर</a>
            <a href="#" className="hover:text-cyan-400">गोपनीयता नीति</a>
            <a href="#" className="hover:text-cyan-400">साइट मैप</a>
            <a href="#" className="hover:text-cyan-400">सुलभता सहायता</a>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;
