// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./pages/AdminDashboard";
import GPDashboard from "./pages/GPDashboard";
import AddBeneficiary from "./pages/AddBeneficiary";
import ManageBeneficiary from "./pages/ManageBeneficiary";
import PumpHouseMaster from "./pages/PumpHouseMaster";
import PumpHouseRoaster from "./pages/PumpHouseRoaster";
import LodgeComplaintPage from "./pages/LodgeComplaintPage";
import ManageComplaint from "./pages/ManageComplaint";
import FeeCollectionPage from "./pages/FeeCollectionPage";
import FeeManagementPage from "./pages/FeeManagementPage";
import CallCenterDashboard from "./pages/CallCenterDashboard"; // ✅ Import
import DashboardLayout from "./components/DashboardLayout"; // ✅ Import this

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        <Route
          path="/admin/*"
          element={<DashboardLayout role="admin" />}
        >

        {/* Admin Dashboard (use layout if needed) */}
        <Route path="dashboard" element={<AdminDashboard />} />
        </Route>
        {/* GP Routes with layout */}
        <Route
          path="/gp/*"
          element={<DashboardLayout role="gp" />}
        >
          <Route path="dashboard" element={<GPDashboard />} />
          <Route path="add-beneficiary" element={<AddBeneficiary />} />
          <Route path="manage-beneficiary" element={<ManageBeneficiary />} />
          <Route path="pump-house-master" element={<PumpHouseMaster />} />
          <Route path="lodge-complaint" element={<LodgeComplaintPage />} />
          <Route path="manage-complaint" element={<ManageComplaint />} />
          <Route path="fee-collection" element={<FeeCollectionPage />} />
          <Route path="fee-management" element={<FeeManagementPage />} />


  <Route path="pump-house-roaster" element={<PumpHouseRoaster />} />

        </Route>
        {/* ✅ Call Center Role */}
        <Route path="/callcenter/*" element={<DashboardLayout role="callcenter" />}>
          <Route path="dashboard" element={<CallCenterDashboard />} />
          <Route path="lodge-complaint" element={<LodgeComplaintPage />} />
          <Route path="manage-complaint" element={<ManageComplaint />} />
          {/* Add other call center routes here if needed */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
