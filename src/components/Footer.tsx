import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-800 text-white  text-sm mt-0 pt-6 border-t border-blue-800">
      <div className="max-w-7xl mx-auto px-6 md:px-12 ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-10">
          {/* Logo & Tagline */}
          <div>
            <div className="flex items-center gap-4 mb-1">
              <img src="/logo.png" alt="IWMS Logo" className="h-14 w-auto" />
              <div className="leading-tight">
                <div className="font-bold text-base">
                  Integrated Water Management System
                </div>
                
              </div>
            </div>
            <p className="text-gray-400 mt-3">
              उत्तर प्रदेश पंचायती राज विभाग के अंतर्गत ग्रामीण जल आपूर्ति परियोजनाओं के प्रभावी प्रबंधन हेतु विकसित।
            </p>
          </div>

          
          {/* Social Media (optional or placeholder) */}
          <div>
  <h3 className="font-semibold text-lg mb-4 text-cyan-300 text-right">सोशल मीडिया</h3>
  <div className="flex justify-end gap-4 text-xl">
    <a href="#" className="hover:text-cyan-400"><FaFacebookF /></a>
    <a href="#" className="hover:text-cyan-400"><FaTwitter /></a>
    <a href="#" className="hover:text-cyan-400"><FaYoutube /></a>
  </div>
  <p className="text-gray-400 mt-4 text-xs text-right">
    आधिकारिक जानकारी के लिए केवल इस पोर्टल का उपयोग करें।
  </p>
</div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-800 pt-6 pb-4 text-center text-gray-400 text-xs">
          <p>Cpoyright © {new Date().getFullYear()} KDS Services Pvt. Ltd. | All Rights Reserved</p>
          
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;
