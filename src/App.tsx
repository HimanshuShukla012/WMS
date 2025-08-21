import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Login from "./components/Login";
import AdminDashboard from "./pages/AdminDashboard";
import GPDashboard from "./pages/GPDashboard";
import AddBeneficiary from "./pages/AddBeneficiary";
import ManageBeneficiary from "./pages/ManageBeneficiary";
import PumpHouseMaster from "./pages/PumpHouseMaster";
import LodgeComplaintPage from "./pages/LodgeComplaintPage";
import ManageComplaint from "./pages/ManageComplaint";
import FeeCollectionPage from "./pages/FeeCollectionPage";
import FeeManagementPage from "./pages/FeeManagementPage";
import CallCenterDashboard from "./pages/CallCenterDashboard";
import DashboardLayout from "./components/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import ManageOHT from "./pages/ManageOHT";
import ManagePumpHouse from "./pages/ManagePumphouse";
import ViewRoaster from "./pages/ViewRoaster";
import WaterQuality from "./pages/waterquality";
import ViewWaterQuality from "./pages/viewwaterquality";
import UserManagement from "./pages/AdminUserManagement";
import FeeManagement from "./pages/AdminFeeManagement";
import UpdateRoaster from "./pages/UpdateRoaster";
import MISReportingPage from "./pages/GPReporting";
import PrivateRoute from "./components/PrivateRoute";

// Declare global types for Google Translate
declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

// Component to handle translate bar positioning based on route
const TranslateBar = () => {
  const location = useLocation();
  
  // Check if we're on landing page or login page
  const isLandingOrLogin = location.pathname === "/" || location.pathname === "/login";
  
  // Adjust positioning for landing/login pages vs dashboard pages
  const translateBarStyle = {
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    height: '40px',
    zIndex: isLandingOrLogin ? 10000 : 9999, // Higher z-index for landing/login
    top: isLandingOrLogin ? '80px' : '0px', // Push down on landing/login to avoid navbar overlap
  };

  return (
    <div 
      id="translate-bar" 
      className="fixed left-0 w-full backdrop-blur bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-800 text-white border-b border-blue-800 shadow-lg"
      style={translateBarStyle}
    >
      <span className="font-semibold">🌐 भाषा चुनें:</span>
      <div id="google_translate_element"></div>
    </div>
  );
};

function App() {
  useEffect(() => {
    // Define the Google Translate initialization function
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );
      }
    };

    // Load Google Translate script if not already loaded
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onerror = () => console.error('Failed to load Google Translate script');
      document.head.appendChild(script);
    } else {
      // If script is already loaded, just initialize
      window.googleTranslateElementInit();
    }
  }, []);

  return (
    <div>
      <Router>
        {/* Google Translate Bar - now positioned conditionally based on route */}
        <TranslateBar />

        {/* Routes with conditional margin-top */}
        <Routes>
          {/* Public routes - with extra margin for translate bar */}
          <Route path="/" element={
            <div style={{ marginTop: '120px' }}>
              <LandingPage />
            </div>
          } />
          <Route path="/login" element={
            <div style={{ marginTop: '120px' }}>
              <Login />
            </div>
          } />
          <Route path="/unauthorized" element={
            <div className="flex justify-center items-center h-screen" style={{ marginTop: '40px' }}>
              <h1 className="text-3xl font-bold text-red-600">Unauthorized Access</h1>
            </div>
          } />

          {/* Protected routes - normal margin for dashboard layout */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/*" element={
              <div style={{ marginTop: '40px' }}>
                <DashboardLayout role="admin" />
              </div>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="user-management" element={<UserManagement />} />
              <Route path="fee-management" element={<FeeManagement />} />
              <Route path="manage-beneficiary" element={<ManageBeneficiary />} />
              <Route path="manage-oht" element={<ManageOHT />} />
              <Route path="manage-pumphouse" element={<ManagePumpHouse />} />
              <Route path="view-roaster" element={<ViewRoaster />} />
              <Route path="view-water-quality" element={<ViewWaterQuality />} />
              <Route path="reporting" element={<MISReportingPage />} />
            </Route>
          </Route>

          {/* Gram Panchayat protected routes */}
          <Route element={<PrivateRoute allowedRoles={["gram panchayat"]} />}>
            <Route path="/gp/*" element={
              <div style={{ marginTop: '40px' }}>
                <DashboardLayout role="gp" />
              </div>
            }>
              <Route path="dashboard" element={<GPDashboard />} />
              <Route path="add-beneficiary" element={<AddBeneficiary />} />
              <Route path="manage-beneficiary" element={<ManageBeneficiary />} />
              <Route path="pump-house-master" element={<PumpHouseMaster />} />
              <Route path="lodge-complaint" element={<LodgeComplaintPage />} />
              <Route path="manage-complaint" element={<ManageComplaint />} />
              <Route path="fee-collection" element={<FeeCollectionPage />} />
              <Route path="fee-management" element={<FeeManagementPage />} />
              <Route path="manage-oht" element={<ManageOHT />} />
              <Route path="manage-pumphouse" element={<ManagePumpHouse />} />
              <Route path="view-roaster" element={<ViewRoaster />} />
              <Route path="water-quality" element={<WaterQuality />} />
              <Route path="view-water-quality" element={<ViewWaterQuality />} />
              <Route path="update-roaster" element={<UpdateRoaster />} />
              <Route path="reporting" element={<MISReportingPage />} />
            </Route>
          </Route>

          {/* Call Center protected routes */}
          <Route element={<PrivateRoute allowedRoles={["call center"]} />}>
            <Route path="/callcenter/*" element={
              <div style={{ marginTop: '40px' }}>
                <DashboardLayout role="callcenter" />
              </div>
            }>
              <Route path="dashboard" element={<CallCenterDashboard />} />
              <Route path="lodge-complaint" element={<LodgeComplaintPage />} />
              <Route path="manage-complaint" element={<ManageComplaint />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>

      {/* CSS Styles for Google Translate */}
      <style>{`
        /* Hide Google Translate elements we don't want */
        .goog-te-banner-frame {
          display: none !important;
        }
        
        /* Hide the default Google Translate top bar */
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }
        
        body {
          top: 0px !important;
        }
        
        .skiptranslate iframe {
          visibility: hidden !important;
          height: 0 !important;
        }
        
        body.translated-ltr {
          top: 0 !important;
        }
        
        body.translated-rtl {
          top: 0 !important;
        }
        
        .goog-logo-link {
          display: none !important;
        }
        
        .goog-te-gadget {
          color: transparent !important;
          font-size: 0 !important;
        }
        
        .goog-te-gadget > span {
          display: none !important;
        }
        
        .goog-te-gadget > span > a {
          display: none !important;
        }
        
        .goog-te-gadget .goog-te-combo {
          margin: 0 !important;
          padding: 6px 12px !important;
          border-radius: 20px !important;
          border: 1px solid rgba(255,255,255,0.3) !important;
          background: rgba(255,255,255,0.1) !important;
          color: white !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          backdrop-filter: blur(10px) !important;
          transition: all 0.3s ease !important;
        }
        
        .goog-te-gadget .goog-te-combo:hover {
          background: rgba(255,255,255,0.2) !important;
          border-color: rgba(255,255,255,0.5) !important;
        }
        
        .goog-te-gadget .goog-te-combo:focus {
          outline: none !important;
          box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.5) !important;
        }
        
        /* Hide the dropdown arrow and make it custom */
        .goog-te-combo option {
          background: #1e3a8a !important;
          color: white !important;
        }
        
        /* Fix overflow issues */
        #google_translate_element {
          overflow: visible !important;
        }
        
        .goog-te-gadget {
          overflow: visible !important;
        }
        
        /* Remove powered by Google text */
        .goog-te-gadget span:first-child {
          display: none !important;
        }
        
        /* Style the dropdown menu */
        .goog-te-menu-frame {
          border-radius: 8px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3) !important;
        }
        
        /* Fix specific incorrect translations */
        body.translated-ltr [data-original-text="Select Block"]:after,
        body.translated-rtl [data-original-text="Select Block"]:after {
          content: "ब्लॉक का चयन करें";
        }
        
        body.translated-ltr [data-original-text="Select Block"],
        body.translated-rtl [data-original-text="Select Block"] {
          font-size: 0;
        }

        /* Ensure translate bar positioning */
        #translate-bar {
          position: fixed !important;
        }
        
        /* Make sure other elements don't interfere */
        .navbar,
        .hero-section,
        .video-overlay {
          z-index: 1000 !important;
        }

        /* Additional spacing for landing page and login page content */
        .landing-content, .login-content {
          padding-top: 40px;
        }
      `}</style>
    </div>
  );
}

export default App;