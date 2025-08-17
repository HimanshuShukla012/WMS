import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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


import PrivateRoute from "./components/PrivateRoute"; // import the new component

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={
          <div className="flex justify-center items-center h-screen">
            <h1 className="text-3xl font-bold text-red-600">Unauthorized Access</h1>
          </div>
        } />

        {/* Admin protected routes */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/*" element={<DashboardLayout role="admin" />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="fee-management" element={<FeeManagement />} />
            <Route path="manage-oht" element={<ManageOHT />} />
            <Route path="manage-pumphouse" element={<ManagePumpHouse />} />
            <Route path="view-roaster" element={<ViewRoaster />} />
            <Route path="view-water-quality" element={<ViewWaterQuality />} />
            <Route path="reporting" element={<MISReportingPage />} />
            {/* Add other admin routes here */}
          </Route>
        </Route>

        {/* Gram Panchayat protected routes */}
        <Route element={<PrivateRoute allowedRoles={["gram panchayat"]} />}>
          <Route path="/gp/*" element={<DashboardLayout role="gp" />}>
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
          <Route path="/callcenter/*" element={<DashboardLayout role="callcenter" />}>
            <Route path="dashboard" element={<CallCenterDashboard />} />
            <Route path="lodge-complaint" element={<LodgeComplaintPage />} />
            <Route path="manage-complaint" element={<ManageComplaint />} />
            {/* Add other call center routes here */}
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
