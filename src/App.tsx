import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import Login from "./components/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ViewOHTCleaningDetails from "./pages/viewohtcleaning";
import GPDashboard from "./pages/GPDashboard";
import AddBeneficiary from "./pages/AddBeneficiary";
import ManageBeneficiary from "./pages/ManageBeneficiary";
import PumpHouseMaster from "./pages/PumpHouseMaster";
import LodgeComplaintPage from "./pages/LodgeComplaintPage";
import ManageComplaint from "./pages/ManageComplaint";
import ManageOHTCleaning from "./pages/ohtcleaning";
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
import GuidelinesPage from "./pages/guidelines";
import About from "./pages/AboutPage";
import PDFFlipbook from "./pages/gpusermanual";
import DirectorMonitoring from "./pages/directormonitoring";
import DPROWaterFee from "./pages/DPROWaterFee";
import LoginRoute from "./components/LoginRoute"; // Add this import
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { useNavigate, useLocation } from 'react-router-dom';

// Declare global types for Google Translate
declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}


const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    // Only prevent back button if user is logged in and on dashboard routes
    const isDashboardRoute = location.pathname.includes('/admin/') ||
                            location.pathname.includes('/gp/') ||
                            location.pathname.includes('/callcenter/') ||
                            location.pathname.includes('/director/') ||
                            location.pathname.includes('/dd/') ||
                            location.pathname.includes('/dpro/') ||
                            location.pathname.includes('/ado/');
    
    if (token && isDashboardRoute) {
      // Push current state to prevent back navigation
      window.history.pushState(null, '', window.location.href);
      
      const handlePopState = (e: PopStateEvent) => {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
        
        // Show a confirmation dialog
        const confirmLogout = window.confirm(
          'You are currently logged in. Do you want to logout and leave the dashboard?'
        );
        
        if (confirmLogout) {
          // Clear auth data
          localStorage.removeItem('authToken');
          localStorage.removeItem('userID');
          localStorage.removeItem('role');
          localStorage.removeItem('cachedUserInfo');
          localStorage.removeItem('uparm');
          
          // Dispatch auth state change event
          window.dispatchEvent(new Event('authStateChange'));
          
          // Navigate to landing page
          navigate('/', { replace: true });
        }
      };
      
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [location, navigate]);
  
  return null;
};


// Component to handle translate bar positioning based on route
const TranslateBar = () => {
  const location = useLocation();

  // Check if we're on landing page or login page
  const isLandingOrLogin =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/guidelines" ||
    location.pathname === "/privacy-policy" ||
    location.pathname === "/about";
    

  // Adjust positioning for landing/login pages vs dashboard pages
  const translateBarStyle = {
    padding: "8px 16px",
    display: "flex",
    alignItems: "center",
    //gap: "10px",
    justifyContent: "end",
    fontSize: "14px",
    height: "40px",
    zIndex: isLandingOrLogin ? 10000 : 9999, // Higher z-index for landing/login
    top: isLandingOrLogin ? "80px" : "0px", // Push down on landing/login to avoid navbar overlap
  };

  return (
    <div
      id="translate-bar"
      className="fixed left-0 w-full backdrop-blur bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-800 text-white border-b border-blue-800 shadow-lg"
      style={translateBarStyle}
    >
      <span className="font-semibold">🌐</span>
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
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );
      }
    };

    // Load Google Translate script if not already loaded
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.onerror = () =>
        console.error("Failed to load Google Translate script");
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

        {/* Add Back Button Handler here */}
        <BackButtonHandler />

        <Routes>
          {/* Public routes - with extra margin for translate bar */}
          <Route
            path="/"
            element={
              <div style={{ marginTop: "120px" }}>
                <LandingPage />
              </div>
            }
          />

          {/* Updated login route that handles authenticated users */}
          <Route
            path="/login"
            element={
              <div style={{ marginTop: "120px" }}>
                <LoginRoute />
              </div>
            }
          />

          <Route
            path="/guidelines"
            element={
              <div style={{ marginTop: "120px" }}>
                <GuidelinesPage />
              </div>
            }
          />

          <Route
  path="/privacy-policy"
  element={
    <div style={{ marginTop: "120px" }}>
      <PrivacyPolicy />
    </div>
  }
/>

          <Route
            path="/about"
            element={
              <div style={{ marginTop: "120px" }}>
                <About />
              </div>
            }
          />

          <Route
            path="/unauthorized"
            element={
              <div
                className="flex justify-center items-center h-screen"
                style={{ marginTop: "40px" }}
              >
                <h1 className="text-3xl font-bold text-red-600">
                  Unauthorized Access
                </h1>
              </div>
            }
          />

          {/* Protected routes - normal margin for dashboard layout */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route
              path="/admin/*"
              element={
                <div style={{ marginTop: "40px" }}>
                  <DashboardLayout role="admin" />
                </div>
              }
            >
              <Route path="dashboard" element={<DirectorMonitoring />} />
              <Route path="user-management" element={<UserManagement />} />
              <Route path="fee-management" element={<FeeManagement />} />
              <Route
                path="manage-beneficiary"
                element={<ManageBeneficiary />}
              />
              <Route path="manage-complaint" element={<ManageComplaint />} />
              <Route path="manage-oht" element={<ManageOHT />} />
              <Route path="manage-oht-cleaning" element={<ManageOHTCleaning />} />
              <Route path="view-oht-cleaning" element={<ViewOHTCleaningDetails />} />
              <Route path="manage-pumphouse" element={<ManagePumpHouse />} />
              <Route path="view-roaster" element={<ViewRoaster />} />
              <Route path="view-water-quality" element={<ViewWaterQuality />} />
              <Route
                path="location-reporting"
                element={<DirectorMonitoring />}
              />
              <Route path="reporting" element={<MISReportingPage />} />
            </Route>
          </Route>

          {/* Protected routes - normal margin for dashboard layout */}
          <Route element={<PrivateRoute allowedRoles={["director"]} />}>
            <Route
              path="/director/*"
              element={
                <div style={{ marginTop: "40px" }}>
                  <DashboardLayout role="director" />
                </div>
              }
            >
              <Route path="dashboard" element={<DirectorMonitoring />} />
              <Route
                path="manage-beneficiary"
                element={<ManageBeneficiary />}
              />
              <Route path="manage-complaint" element={<ManageComplaint />} />
              <Route path="manage-oht" element={<ManageOHT />} />
              <Route path="manage-pumphouse" element={<ManagePumpHouse />} />
              <Route path="view-roaster" element={<ViewRoaster />} />
              <Route path="view-oht-cleaning" element={<ViewOHTCleaningDetails />} />
              <Route path="manage-oht-cleaning" element={<ManageOHTCleaning />} />
              <Route path="view-water-quality" element={<ViewWaterQuality />} />
              <Route path="reporting" element={<MISReportingPage />} />
              <Route path="fee-management" element={<FeeManagementPage />} />
            </Route>
          </Route>

          <Route element={<PrivateRoute allowedRoles={["dd"]} />}>
            <Route
              path="/dd/*"
              element={
                <div style={{ marginTop: "40px" }}>
                  <DashboardLayout role="dd" />
                </div>
              }
            >
              <Route path="dashboard" element={<DirectorMonitoring />} />
              <Route
                path="manage-beneficiary"
                element={<ManageBeneficiary />}
              />
              <Route path="manage-complaint" element={<ManageComplaint />} />
              <Route path="manage-oht" element={<ManageOHT />} />
              <Route path="manage-oht-cleaning" element={<ManageOHTCleaning />} />
              <Route path="manage-pumphouse" element={<ManagePumpHouse />} />
              <Route path="view-roaster" element={<ViewRoaster />} />
              <Route path="view-water-quality" element={<ViewWaterQuality />} />
              <Route path="view-oht-cleaning" element={<ViewOHTCleaningDetails />} />
              <Route path="reporting" element={<MISReportingPage />} />
              <Route path="fee-management" element={<FeeManagementPage />} />
            </Route>
          </Route>

          <Route element={<PrivateRoute allowedRoles={["dpro"]} />}>
            <Route
              path="/dpro/*"
              element={
                <div style={{ marginTop: "40px" }}>
                  <DashboardLayout role="dpro" />
                </div>
              }
            >
              <Route path="dashboard" element={<DirectorMonitoring />} />
              <Route
                path="manage-beneficiary"
                element={<ManageBeneficiary />}
              />
              <Route path="manage-complaint" element={<ManageComplaint />} />
              <Route path="manage-oht" element={<ManageOHT />} />
              <Route path="manage-pumphouse" element={<ManagePumpHouse />} />
              <Route path="view-roaster" element={<ViewRoaster />} />
              <Route path="manage-oht-cleaning" element={<ManageOHTCleaning />} />
              <Route path="view-water-quality" element={<ViewWaterQuality />} />
              <Route path="reporting" element={<MISReportingPage />} />
              <Route path="view-oht-cleaning" element={<ViewOHTCleaningDetails />} />
              <Route path="fee-management" element={<FeeManagementPage />} />
              <Route path="dpro-fee-update" element={<DPROWaterFee />} />
            </Route>
          </Route>

          <Route element={<PrivateRoute allowedRoles={["ado"]} />}>
            <Route
              path="/ado/*"
              element={
                <div style={{ marginTop: "40px" }}>
                  <DashboardLayout role="ado" />
                </div>
              }
            >
              <Route path="dashboard" element={<DirectorMonitoring />} />
              <Route
                path="manage-beneficiary"
                element={<ManageBeneficiary />}
              />
              <Route path="manage-complaint" element={<ManageComplaint />} />
              <Route path="manage-oht" element={<ManageOHT />} />
              <Route path="manage-oht-cleaning" element={<ManageOHTCleaning />} />
              <Route path="manage-pumphouse" element={<ManagePumpHouse />} />
              <Route path="view-roaster" element={<ViewRoaster />} />
              <Route path="view-water-quality" element={<ViewWaterQuality />} />
              <Route path="view-oht-cleaning" element={<ViewOHTCleaningDetails />} />
              <Route path="reporting" element={<MISReportingPage />} />
              <Route path="fee-management" element={<FeeManagementPage />} />
            </Route>
          </Route>

          {/* Gram Panchayat protected routes */}
          <Route element={<PrivateRoute allowedRoles={["gram panchayat"]} />}>
            <Route
              path="/gp/*"
              element={
                <div style={{ marginTop: "40px" }}>
                  <DashboardLayout role="gp" />
                </div>
              }
            >
              <Route path="dashboard" element={<GPDashboard />} />
              <Route path="add-beneficiary" element={<AddBeneficiary />} />
              <Route
                path="manage-beneficiary"
                element={<ManageBeneficiary />}
              />
              <Route path="pump-house-master" element={<PumpHouseMaster />} />
              <Route path="lodge-complaint" element={<LodgeComplaintPage />} />
              <Route path="view-oht-cleaning" element={<ViewOHTCleaningDetails />} />
              <Route path="manage-complaint" element={<ManageComplaint />} />
              <Route path="fee-collection" element={<FeeCollectionPage />} />
              <Route path="fee-management" element={<FeeManagementPage />} />
              <Route path="manage-oht" element={<ManageOHT />} />
              <Route path="manage-oht-cleaning" element={<ManageOHTCleaning />} />
              <Route path="manage-pumphouse" element={<ManagePumpHouse />} />
              <Route path="view-roaster" element={<ViewRoaster />} />
              <Route path="water-quality" element={<WaterQuality />} />
              <Route path="view-water-quality" element={<ViewWaterQuality />} />
              <Route path="update-roaster" element={<UpdateRoaster />} />
              <Route path="reporting" element={<MISReportingPage />} />
              <Route path="user-manual" element={<PDFFlipbook />} />
            </Route>
          </Route>

          {/* Call Center protected routes */}
          <Route element={<PrivateRoute allowedRoles={["call center"]} />}>
            <Route
              path="/callcenter/*"
              element={
                <div style={{ marginTop: "40px" }}>
                  <DashboardLayout role="callcenter" />
                </div>
              }
            >
              <Route path="dashboard" element={<CallCenterDashboard />} />
              <Route path="lodge-complaint" element={<LodgeComplaintPage />} />
              <Route path="manage-complaint" element={<ManageComplaint />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      {/* CSS Styles for Google Translate */}
      <style>{`
        /* Hide Google Translate elements we don't want */
        .goog-te-banner-frame {
          display: none !important;
        }

        .goog-te-gadget-simple {
    background-color: #FFF;
    border-left: 1px solid #D5D5D5;
    border-top: 1px solid #9B9B9B;
    border-bottom: 1px solid #E8E8E8;
    border-right: 1px solid #D5D5D5;
    font-size: 10pt;
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
          font-size: 13px !important;
          color: white !important;
        }
        .goog-te-gadget-simple .VIpgJd-ZVi9od-xl07Ob-lTBxed{
            width: auto !important;
            display: flex !important;
            background: #fff !important;
            padding: 4px 8px !important;
            border-radius: 10px !important;
        }
        .goog-te-gadget span:first-child {
          display:flex !important
        }
        
        // .goog-te-gadget > span {
        //   display: none !important;
        // }
        
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
