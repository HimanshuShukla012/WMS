import { FaFacebookF, FaTwitter, FaYoutube } from "react-icons/fa";

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
                  Water Management System
                </div>
                
              </div>
            </div>
            <p className="text-gray-400 mt-3">
              Developed for effective management of Rural Water Supply under Directorate of Panchayati Raj Uttar Pradesh.
            </p>
          </div>

          
          {/* Social Media (optional or placeholder) */}
          <div>
  <h3 className="font-semibold text-lg mb-4 text-cyan-300 text-right">Social Media</h3>
  <div className="flex justify-end gap-4 text-xl">
    <a href="#" className="hover:text-cyan-400"><FaFacebookF /></a>
    <a href="#" className="hover:text-cyan-400"><FaTwitter /></a>
    <a href="#" className="hover:text-cyan-400"><FaYoutube /></a>
  </div>
  <p className="text-gray-400 mt-4 text-xs text-right">
    Follow us on Social Media for all the recent updates!
  </p>
</div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-800 pt-6 pb-4 text-center text-gray-400 text-xs">
          <p>Copyright © {new Date().getFullYear()} KDS Services Pvt. Ltd. | All Rights Reserved</p>
          
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;
