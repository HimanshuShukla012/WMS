import React, { useState } from "react";
import BubblesBackground from "./BubblesBackground";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Add this import
import {
  LayoutDashboard,
  Users,
  BarChart3,
  UserPlus,
  Users2,
  Building2,
  Calendar,
  Megaphone,
  ClipboardList,
  CreditCard,
  FileText,
  Building2 as Building2Icon,
  Droplet,
  DropletIcon,
  BookAIcon,
} from "lucide-react";
import { BiBuildingHouse, BiDroplet, BiMoney } from "react-icons/bi";
import { FaRupeeSign } from "react-icons/fa";

type Role = "admin" | "gp" | "callcenter" | "director" | "dd" | "dpro" | "ado";

type MenuItem = {
  name: string;
  to?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
};

const roleLabels: Record<Role, string> = {
  admin: "Admin Dashboard",
  gp: "Gram Panchayat Dashboard",
  callcenter: "Call Center Dashboard",
  director: "Director's Dashboard",
  dpro: "DPRO's Dashboard",
  ado: "ADO's Dashboard",
  dd: "DD's Dashboard",
};

const getMenuLinks = (role: Role): MenuItem[] => {
  if (role === "admin") {
    return [
      { name: "Dashboard", to: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
      { name: "User Management", to: "/admin/user-management", icon: <Users size={18} /> },
      { name: "Fee Management", to: "/admin/fee-management", icon: <BiMoney size={18} /> },
      { name: "Complaint Status", to: "/admin/manage-complaint", icon: <ClipboardList size={16} /> },
      { name: "Manage Beneficiaries", to: "/admin/manage-beneficiary", icon: <Users2 size={16} /> },
      { name: "Manage OHT", to: "/admin/manage-oht", icon: <Calendar size={16} /> },
      { name: "Manage Pump House", to: "/admin/manage-pumphouse", icon: <ClipboardList size={16} /> },
      { name: "View Roaster", to: "/admin/view-roaster", icon: <ClipboardList size={16} /> },
    ];
  }
  else if (role === "director") {
    return [
      { name: "Dashboard", to: "/director/dashboard", icon: <LayoutDashboard size={18} /> },
      { name: "Complaint Status", to: "/director/manage-complaint", icon: <ClipboardList size={16} /> },
      { name: "Manage Beneficiaries", to: "/director/manage-beneficiary", icon: <Users2 size={16} /> },
      { name: "Manage OHT", to: "/director/manage-oht", icon: <Calendar size={16} /> },
      { name: "Manage Pump House", to: "/director/manage-pumphouse", icon: <ClipboardList size={16} /> },
      { name: "View Roaster", to: "/director/view-roaster", icon: <ClipboardList size={16} /> },
      { name: "Fee Management", to: "/director/fee-management", icon: <ClipboardList size={16} /> },
    ];
  }
  else if (role === "dd") {
    return [
      { name: "Dashboard", to: "/dd/dashboard", icon: <LayoutDashboard size={18} /> },
      { name: "Complaint Status", to: "/dd/manage-complaint", icon: <ClipboardList size={16} /> },
      { name: "Manage Beneficiaries", to: "/dd/manage-beneficiary", icon: <Users2 size={16} /> },
      { name: "Manage OHT", to: "/dd/manage-oht", icon: <Calendar size={16} /> },
      { name: "Manage Pump House", to: "/dd/manage-pumphouse", icon: <ClipboardList size={16} /> },
      { name: "View Roaster", to: "/dd/view-roaster", icon: <ClipboardList size={16} /> },
      { name: "Fee Management", to: "/dd/fee-management", icon: <ClipboardList size={16} /> },
    ];
  }
  else if (role === "dpro") {
    return [
      { name: "Dashboard", to: "/dpro/dashboard", icon: <LayoutDashboard size={18} /> },
      { name: "Complaint Status", to: "/dpro/manage-complaint", icon: <ClipboardList size={16} /> },
      { name: "Manage Beneficiaries", to: "/dpro/manage-beneficiary", icon: <Users2 size={16} /> },
      { name: "Manage OHT", to: "/dpro/manage-oht", icon: <Calendar size={16} /> },
      { name: "Manage Pump House", to: "/dpro/manage-pumphouse", icon: <ClipboardList size={16} /> },
      { name: "View Roaster", to: "/dpro/view-roaster", icon: <ClipboardList size={16} /> },
      { name: "GP Fee Updation", to: "/dpro/dpro-fee-update", icon: <FaRupeeSign size={16} /> },
      { name: "Fee Management", to: "/dpro/fee-management", icon: <ClipboardList size={16} /> },
    ];
  }
  else if (role === "ado") {
    return [
      { name: "Dashboard", to: "/ado/dashboard", icon: <LayoutDashboard size={18} /> },
      { name: "Complaint Status", to: "/ado/manage-complaint", icon: <ClipboardList size={16} /> },
      { name: "Manage Beneficiaries", to: "/ado/manage-beneficiary", icon: <Users2 size={16} /> },
      { name: "Manage OHT", to: "/ado/manage-oht", icon: <Calendar size={16} /> },
      { name: "Manage Pump House", to: "/ado/manage-pumphouse", icon: <ClipboardList size={16} /> },
      { name: "View Roaster", to: "/ado/view-roaster", icon: <ClipboardList size={16} /> },
      { name: "Fee Management", to: "/ado/fee-management", icon: <ClipboardList size={16} /> },
    ];
  }
  else if (role === "gp") {
    return [
      { name: "Dashboard", to: "/gp/dashboard", icon: <LayoutDashboard size={18} /> },
      {
        name: "Beneficiary",
        icon: <Users2 size={18} />,
        children: [
          { name: "Add Beneficiary", to: "/gp/add-beneficiary", icon: <UserPlus size={16} /> },
          { name: "Manage Beneficiaries", to: "/gp/manage-beneficiary", icon: <Users2 size={16} /> },
        ],
      },
      {
        name: "Infrastructure",
        icon: <Building2 size={18} />,
        children: [
          {
            name: "OHT Master",
            icon: <Building2Icon size={16} />,
            children: [
              { name: "Add OHT", to: "/gp/pump-house-master", icon: <Building2Icon size={16} /> },
              {
                name: "Manage Infrastructure",
                icon: <BiBuildingHouse size={16} />,
                children: [
                  { name: "Manage OHT", to: "/gp/manage-oht", icon: <Calendar size={16} /> },
                  { name: "Manage Pump House", to: "/gp/manage-pumphouse", icon: <ClipboardList size={16} /> },
                ],
              },
            ],
          },
          {
            name: "Pump House Roaster",
            icon: <Calendar size={16} />,
            children: [
              { name: "Update Roaster", to: "/gp/update-roaster", icon: <Calendar size={16} /> },
              { name: "View Roaster", to: "/gp/view-roaster", icon: <ClipboardList size={16} /> },
            ],
          },
        ],
      },
      {
        name: "Complaints",
        icon: <Megaphone size={18} />,
        children: [
          { name: "Lodge Complaint", to: "/gp/lodge-complaint", icon: <Megaphone size={16} /> },
          { name: "Complaint Status", to: "/gp/manage-complaint", icon: <ClipboardList size={16} /> },
        ],
      },
      {
        name: "Fee Management",
        icon: <CreditCard size={18} />,
        children: [
          { name: "Fee Collection", to: "/gp/fee-collection", icon: <CreditCard size={16} /> },
          { name: "Fee Management", to: "/gp/fee-management", icon: <ClipboardList size={16} /> },
        ],
      },
      {
        name: "Water Quality",
        icon: <Droplet size={18} />,
        children: [
          { name: "Update Water Quality", to: "/gp/water-quality", icon: <DropletIcon size={16} /> },
          { name: "View Water Quality", to: "/gp/view-water-quality", icon: <BiDroplet size={16} /> },
        ],
      },
      { name: "Reporting", to: "/gp/reporting", icon: <FileText size={18} /> },
      { name: "User Manual", to: "/gp/user-manual", icon: <BookAIcon size={18} /> },
    ];
  } else {
    return [
      { name: "Dashboard", to: "/callcenter/dashboard", icon: <LayoutDashboard size={18} /> },
      { name: "Lodge Complaint", to: "/callcenter/lodge-complaint", icon: <Megaphone size={16} /> },
      { name: "Manage Complaint", to: "/callcenter/manage-complaint", icon: <ClipboardList size={16} /> },
    ];
  }
};

const DashboardLayout = ({ role }: { children?: React.ReactNode; role: Role }) => {
  const location = useLocation();
  const { logout } = useAuth(); // Get logout from AuthContext (this now shows the custom popup)
  const links = getMenuLinks(role);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Simplified logout handler - just call logout directly
  // The AuthContext will handle showing the custom confirmation modal
  const handleLogout = () => {
    logout(); // This will now show the custom modal from AuthContext
  };

  const renderMenuItems = (items: MenuItem[], level: number = 0) => {
    return items.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <div key={item.name}>
            <div
              onClick={() => toggleMenu(item.name)}
              className={`cursor-pointer flex items-center justify-between px-3 py-1 rounded-lg hover:bg-white hover:bg-opacity-10 transition ml-${level * 4}`}
            >
              <div className="flex items-center gap-2 text-sm">
                {item.icon}
                <span>{item.name}</span>
              </div>
              <span>{openMenus[item.name] ? "▲" : "▼"}</span>
            </div>
            {openMenus[item.name] && (
              <div className="ml-4 mt-1 flex flex-col gap-1">
                {renderMenuItems(item.children, level + 1)}
              </div>
            )}
          </div>
        );
      }

      return (
        <Link
          key={item.to}
          to={item.to!}
          className={`flex items-center gap-2 text-sm px-3 py-1 rounded-lg transition ml-${level * 4} ${
            location.pathname === item.to
              ? "bg-white bg-opacity-20 font-semibold"
              : "hover:bg-white hover:bg-opacity-10"
          }`}
        >
          {item.icon}
          <span>{item.name}</span>
        </Link>
      );
    });
  };

  return (
    <div className="relative h-screen overflow-visible">
      <BubblesBackground />

      {/* Main Layout */}
      <div className="flex h-full bg-gradient-to-br from-blue-50 to-blue-100">
        {/* Sidebar */}
        <div className="w-72 bg-gradient-to-b from-sky-900 to-indigo-900 text-white shadow-xl flex flex-col p-6 overflow-y-auto relative">
          <div className="flex flex-col items-center mb-10">
            <img src="/logo.png" alt="Logo" className="h-16 w-24 rounded-lg object-cover" />
            <h1 className="text-2xl font-bold tracking-wide text-center">WMS</h1>
            <span className="text-sm text-indigo-200 mt-1">{roleLabels[role]}</span>
          </div>
          <div className="flex flex-col items-center mb-10">
          </div>

          {/* Menu items */}
          <nav className="flex flex-col gap-3 flex-grow">{renderMenuItems(links)}</nav>

          {/* Logout button fixed at bottom */}
          <button
            onClick={handleLogout}
            className="mt-auto flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition text-white font-semibold"
          >
            {/* Logout Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;