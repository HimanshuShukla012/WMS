import { useEffect, useMemo, useState } from "react";
import { useUserInfo } from '../utils/userInfo';
import {
  Power,
  Lock,
  Download,
  PlusCircle,
  X,
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// -------------------- Types --------------------
interface LocationUser {
  id: number;
  district: string;
  block: string;
  grampanchayat: string;
  username: string;
  password: string;
  active: boolean;
  divisionname: string;
}

interface HQUser {
  id: number;
  role: string;
  username: string;
  password: string;
  active: boolean;
}

type District = { DistrictId: number; DistrictName: string };
type Block = { BlockId: number; BlockName: string };
type GramPanchayat = { Id: number; GramPanchayatName: string };
type Division = { DivisionId: number; DivisionName: string };

// -------------------- Utils --------------------
const normalizeKey = (label: string) =>
  label.toLowerCase().replace(/\s+/g, "");

const escapeCsv = (val: unknown) => {
  const s = String(val ?? "");
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

const downloadCsvFrom = (rows: Array<Record<string, unknown>>, headers: string[], filename: string) => {
  if (!rows || rows.length === 0) {
    const csv = headers.join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  const csvHeader = headers.join(",");
  const csvRows = rows.map((r) => headers.map((h) => escapeCsv(r[normalizeKey(h)])).join(","));
  const csv = [csvHeader, ...csvRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// -------------------- Component --------------------
const UserManagement = () => {
  // data
  const [locationUsers, setLocationUsers] = useState<LocationUser[]>([]);
  const [hqUsers, setHqUsers] = useState<HQUser[]>([]);
  const { userId } = useUserInfo();

  // For new password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState<LocationUser | HQUser | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Pagination states
const [locationPage, setLocationPage] = useState(1);
const [hqPage, setHqPage] = useState(1);
const [locationItemsPerPage, setLocationItemsPerPage] = useState(10);
const [hqItemsPerPage, setHqItemsPerPage] = useState(10);

  // search
  const [globalSearch, setGlobalSearch] = useState("");


  // -------------------- State for dropdowns --------------------
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayat[]>([]);

  const [selectedDivisionId, setSelectedDivisionId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [selectedGramPanchayatId, setSelectedGramPanchayatId] = useState<number | null>(null);

  // Search states for dropdowns
  const [divisionSearch, setDivisionSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [blockSearch, setBlockSearch] = useState("");
  const [gramPanchayatSearch, setGramPanchayatSearch] = useState("");

  // Dropdown open/close states
  const [isDivisionOpen, setIsDivisionOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [isGramPanchayatOpen, setIsGramPanchayatOpen] = useState(false);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    role: "",
    division: "",
    district: "",
    block: "",
    grampanchayat: "",
    userId: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Helper function to determine which location fields are required based on role
  const getRequiredLocationFields = (role: string) => {
    switch (role) {
      case "DD":
        return { division: true, district: false, block: false, gramPanchayat: false };
      case "DPRO":
        return { division: false, district: true, block: false, gramPanchayat: false };
      case "ADO":
        return { division: false, district: true, block: true, gramPanchayat: false };
      case "Gram Panchayat":
        return { division: true, district: true, block: true, gramPanchayat: true };
      default:
        return { division: false, district: false, block: false, gramPanchayat: false };
    }
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return passwordRegex.test(password);
  };

  // -------------------- Fetch Divisions --------------------
  useEffect(() => {
    const requiredFields = getRequiredLocationFields(newUser.role);
    if (!showModal || !requiredFields.division) return;

    fetch("https://wmsapi.kdsgroup.co.in/api/Master/GetDivisionList", {
      method: "GET",
      headers: { accept: "*/*" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status && data.Data?.length) {
          const sortedDivisions = data.Data.sort((a: Division, b: Division) =>
            a.DivisionName.localeCompare(b.DivisionName)
          );
          setDivisions(sortedDivisions);
          setSelectedDivisionId(sortedDivisions[0]?.DivisionId || null);
        } else {
          setDivisions([]);
          setSelectedDivisionId(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching divisions:", err);
        setDivisions([]);
        setSelectedDivisionId(null);
      });
  }, [showModal, newUser.role]);

  // -------------------- Fetch Districts --------------------
  useEffect(() => {
    const requiredFields = getRequiredLocationFields(newUser.role);
    if (!showModal || !requiredFields.district) return;

    fetch("https://wmsapi.kdsgroup.co.in/api/Master/AllDistrict", {
      method: "POST",
      headers: { accept: "*/*", "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status && data.Data?.length) {
          const sortedDistricts = data.Data.sort((a: District, b: District) =>
            a.DistrictName.localeCompare(b.DistrictName)
          );
          setDistricts(sortedDistricts);
          setSelectedDistrictId(sortedDistricts[0]?.DistrictId || null);
        } else {
          setDistricts([]);
          setSelectedDistrictId(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching districts:", err);
        setDistricts([]);
        setSelectedDistrictId(null);
      });
  }, [showModal, newUser.role]);

  // -------------------- Fetch Blocks --------------------
  useEffect(() => {
    const requiredFields = getRequiredLocationFields(newUser.role);
    if (!requiredFields.block) return;
    if (!selectedDistrictId) return;
    if (!showModal) return;

    let apiUrl = "https://wmsapi.kdsgroup.co.in/api/Master/GetAllBlocks";
    if (selectedDistrictId) {
      apiUrl += `?DistrictId=${selectedDistrictId}`;
    }

    fetch(apiUrl, {
      method: "POST",
      headers: { accept: "*/*", "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status && data.Data?.length) {
          const sortedBlocks = data.Data.sort((a: Block, b: Block) =>
            a.BlockName.localeCompare(b.BlockName)
          );
          setBlocks(sortedBlocks);
          setSelectedBlockId(sortedBlocks[0]?.BlockId || null);
        } else {
          setBlocks([]);
          setSelectedBlockId(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching blocks:", err);
        setBlocks([]);
        setSelectedBlockId(null);
      });
  }, [selectedDistrictId, showModal, newUser.role]);

  // -------------------- Fetch Gram Panchayats --------------------
  useEffect(() => {
    if (!selectedBlockId || newUser.role !== "Gram Panchayat") return;

    fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetAllGramPanchayat?BlockId=${selectedBlockId}`, {
      method: "POST",
      headers: { accept: "*/*", "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status && data.Data?.length) {
          const sortedGramPanchayats = data.Data.sort((a: GramPanchayat, b: GramPanchayat) =>
            a.GramPanchayatName.localeCompare(b.GramPanchayatName)
          );
          setGramPanchayats(sortedGramPanchayats);
          setSelectedGramPanchayatId(sortedGramPanchayats[0]?.Id || null);
        } else {
          setGramPanchayats([]);
          setSelectedGramPanchayatId(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching gram panchayats:", err);
        setGramPanchayats([]);
        setSelectedGramPanchayatId(null);
      });
  }, [selectedBlockId, newUser.role]);

  // Helper function to reset form
  const resetForm = () => {
    setShowModal(false);
    setNewUser({
      role: "",
      division: "",
      district: "",
      block: "",
      grampanchayat: "",
      userId: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setDivisionSearch("");
    setDistrictSearch("");
    setBlockSearch("");
    setGramPanchayatSearch("");
    setIsDivisionOpen(false);
    setIsDistrictOpen(false);
    setIsBlockOpen(false);
    setIsGramPanchayatOpen(false);
    setSelectedDivisionId(null);
    setSelectedDistrictId(null);
    setSelectedBlockId(null);
    setSelectedGramPanchayatId(null);
  };

  // -------------------- Create User --------------------
  const createUser = () => {
    if (!newUser.role) {
      alert("Please select a role");
      return;
    }

    if (!newUser.userId) {
      alert("Please enter a username");
      return;
    }

    if (!newUser.email) {
      alert("Please enter an email");
      return;
    }

    if (!validateEmail(newUser.email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (!newUser.password) {
      alert("Please enter a password");
      return;
    }

    if (!validatePassword(newUser.password)) {
      alert("Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character");
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Determine RoleId based on role selection
    let roleId: number;
    switch (newUser.role) {
      case "Admin":
        roleId = 1;
        break;
      case "Call Center":
        roleId = 2;
        break;
      case "Gram Panchayat":
        roleId = 3;
        break;
      case "Director":
        roleId = 4;
        break;
      case "DD":
        roleId = 5;
        break;
      case "ADO":
        roleId = 6;
        break;
      case "DPRO":
        roleId = 7;
        break;
      default:
        alert("Invalid role selected");
        return;
    }

    // Validate required location fields based on role
    const requiredFields = getRequiredLocationFields(newUser.role);
    
    if (requiredFields.division && !selectedDivisionId) {
      alert("Please select a Division");
      return;
    }
    
    if (requiredFields.district && !selectedDistrictId) {
      alert("Please select a District");
      return;
    }
    
    if (requiredFields.block && !selectedBlockId) {
      alert("Please select a Block");
      return;
    }
    
    if (requiredFields.gramPanchayat && !selectedGramPanchayatId) {
      alert("Please select a Gram Panchayat");
      return;
    }

    // Prepare payload based on role requirements
    const payload = {
      UserName: newUser.userId,
      Password: newUser.password,
      Email: newUser.email,
      DistrictId: requiredFields.district ? (selectedDistrictId || 0) : 0,
      BlockId: requiredFields.block ? (selectedBlockId || 0) : 0,
      RoleId: roleId,
      GPId: requiredFields.gramPanchayat ? (selectedGramPanchayatId || 0) : 0,
      CreatedBy: parseInt(String(userId) || "0"),
      UpdatedBy: 0,
      DeviceToken: "",
      IPAddress: "",
      Status: 1,
      division_id: requiredFields.division ? (selectedDivisionId || 0) : 0,
    };

    fetch("https://wmsapi.kdsgroup.co.in/api/User/InsertNewUserDetailsByAdmin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        // Check if the error message indicates username already exists
        if (!data.Status && (data.Message?.toLowerCase().includes("failed to insert") || data.Message?.toLowerCase().includes("duplicate") || data.Message?.toLowerCase().includes("already exists"))) {
          alert("Username already exists. Please choose a different username.");
        } else {
          alert(data.Message || "User created");
          if (data.Status) {
            resetForm();
            window.location.reload();
          }
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to create user. Username may already exist.");
      });
  };

  // -------------------- Fetch Users --------------------
  useEffect(() => {
    fetch("https://wmsapi.kdsgroup.co.in/api/Master/GetUserLocationBasedByAdmin", {
      method: "GET",
      headers: { accept: "*/*" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status && data.Data) {
          const users: LocationUser[] = data.Data.map((u: any) => ({
            id: u.UserId,
            district: u.DistrictName,
            block: u.BlockName,
            grampanchayat: u.GPName,
            username: u.UserName,
            password: u.Password,
            active: u.Status === 1,
            divisionname: u.divisionname,
          }));
          setLocationUsers(users);
        }
      })
      .catch((err) => console.error("Failed to fetch location users:", err));
  }, []);

  useEffect(() => {
    fetch("https://wmsapi.kdsgroup.co.in/api/Master/GetHQCallCenterUserListByAdmin", {
      method: "GET",
      headers: { accept: "*/*" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status && data.Data) {
          const users: HQUser[] = data.Data.map((u: any) => ({
            id: u.UserId,
            role: u.RoleName,
            username: u.UserName,
            password: u.Password,
            active: u.Status === 1,
          }));
          setHqUsers(users);
        }
      })
      .catch((err) => console.error("Failed to fetch HQ users:", err));
  }, []);

  // filtering
  // filtering
const filteredLocationUsers = useMemo(() => {
  const q = globalSearch.trim().toLowerCase();
  if (!q) return locationUsers;
  return locationUsers.filter((u) =>
    [u.district, u.block, u.grampanchayat, u.username, u.password, u.divisionname]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}, [locationUsers, globalSearch]);

const filteredHqUsers = useMemo(() => {
  const q = globalSearch.trim().toLowerCase();
  if (!q) return hqUsers;
  return hqUsers.filter((u) =>
    [u.role, u.username, u.password].join(" ").toLowerCase().includes(q)
  );
}, [hqUsers, globalSearch]);

  const filteredDivisions = useMemo(() => {
    if (!divisionSearch.trim()) return divisions;
    return divisions.filter((d) =>
      d.DivisionName.toLowerCase().includes(divisionSearch.toLowerCase())
    );
  }, [divisions, divisionSearch]);

  const filteredDistricts = useMemo(() => {
    if (!districtSearch.trim()) return districts;
    return districts.filter((d) =>
      d.DistrictName.toLowerCase().includes(districtSearch.toLowerCase())
    );
  }, [districts, districtSearch]);

  const filteredBlocks = useMemo(() => {
    if (!blockSearch.trim()) return blocks;
    return blocks.filter((b) =>
      b.BlockName.toLowerCase().includes(blockSearch.toLowerCase())
    );
  }, [blocks, blockSearch]);

  const filteredGramPanchayats = useMemo(() => {
    if (!gramPanchayatSearch.trim()) return gramPanchayats;
    return gramPanchayats.filter((gp) =>
      gp.GramPanchayatName.toLowerCase().includes(gramPanchayatSearch.toLowerCase())
    );
  }, [gramPanchayats, gramPanchayatSearch]);

  // Pagination logic
const paginateData = <T,>(data: T[], page: number, itemsPerPage: number) => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return data.slice(startIndex, endIndex);
};

  const paginatedLocationUsers = useMemo(
  () => paginateData(filteredLocationUsers, locationPage, locationItemsPerPage),
  [filteredLocationUsers, locationPage, locationItemsPerPage]
);

const paginatedHqUsers = useMemo(
  () => paginateData(filteredHqUsers, hqPage, hqItemsPerPage),
  [filteredHqUsers, hqPage, hqItemsPerPage]
);

const locationTotalPages = Math.ceil(filteredLocationUsers.length / locationItemsPerPage);
const hqTotalPages = Math.ceil(filteredHqUsers.length / hqItemsPerPage);

  // Reset to page 1 when search changes
useEffect(() => {
  setLocationPage(1);
  setHqPage(1);
}, [globalSearch]);

  // actions
  const toggleUserStatus = (userId: number, currentStatus: boolean) => {
    const newStatus = currentStatus ? 0 : 1;

    fetch("https://wmsapi.kdsgroup.co.in/api/User/UpdateUserStatusByUserId", {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "*/*" },
      body: JSON.stringify({ UserId: userId, Status: newStatus }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status) {
          alert(data.Message || "Status updated successfully");
          if (locationUsers.some((u) => u.id === userId)) {
            setLocationUsers((prev) =>
              prev.map((u) =>
                u.id === userId ? { ...u, active: !currentStatus } : u
              )
            );
          } else {
            setHqUsers((prev) =>
              prev.map((u) =>
                u.id === userId ? { ...u, active: !currentStatus } : u
              )
            );
          }
        } else {
          alert("Failed to update status");
        }
      })
      .catch((err) => {
        console.error("Error updating user status:", err);
        alert("Failed to update status");
      });
  };

  const changePassword = (user: LocationUser | HQUser) => {
    setPasswordUser(user);
    setOldPassword("");
    setNewPassword("");
    setShowPasswordModal(true);
  };

  // Enhanced Pagination component
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-4 py-3 bg-gray-50 border-t">
      {/* Items per page selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Rows per page:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            onItemsPerPageChange(Number(e.target.value));
            onPageChange(1); // Reset to first page when changing items per page
          }}
          className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-sm text-gray-600 ml-4">
          Showing {startItem}-{endItem} of {totalItems}
        </span>
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`inline-flex items-center px-2 py-1 rounded text-sm ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
          title="First page"
        >
          <ChevronLeft size={14} />
          <ChevronLeft size={14} className="-ml-2" />
        </button>
        
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded text-sm ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`px-3 py-1 rounded text-sm min-w-[36px] ${
                  currentPage === page
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Current page indicator for mobile */}
        <span className="sm:hidden text-sm text-gray-600 px-2">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded text-sm ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          Next
          <ChevronRight size={16} />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center px-2 py-1 rounded text-sm ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
          title="Last page"
        >
          <ChevronRight size={14} />
          <ChevronRight size={14} className="-ml-2" />
        </button>
      </div>
    </div>
  );
};

  // table helper
  const Table = <T extends { id: number; active?: boolean }>({
    title,
    data,
    columns,
    toolbar,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
  }: {
    title: string;
    data: T[];
    columns: string[];
    toolbar?: React.ReactNode;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
  }) => (
    <div className="bg-white shadow-lg rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {toolbar}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-2 text-left text-sm font-medium">
                  {col}
                </th>
              ))}
              <th className="px-4 py-2 text-sm font-medium text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  {columns.map((col, idx) => {
                    const field = normalizeKey(col) as keyof T;
                    return (
                      <td key={idx} className="px-4 py-2 text-sm align-middle">
                        {String(user[field] ?? "")}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2 align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-white ${
                          user.active ? "bg-red-500" : "bg-green-600"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleUserStatus(user.id, user.active);
                        }}
                        title={user.active ? "Deactivate" : "Activate"}
                      >
                        <Power size={16} />
                        {user.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => changePassword(user)}
                        title="Change Password"
                      >
                        <Lock size={16} />
                        Change Password
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-4 text-gray-500"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
      />
    </div>
  );

  // Custom searchable dropdown component
  const SearchableDropdown = ({
    label,
    options,
    selectedValue,
    onSelect,
    searchValue,
    onSearchChange,
    isOpen,
    setIsOpen,
    displayKey,
    valueKey,
    placeholder = "Select option",
  }: {
    label: string;
    options: any[];
    selectedValue: number | null;
    onSelect: (value: number) => void;
    searchValue: string;
    onSearchChange: (value: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    displayKey: string;
    valueKey: string;
    placeholder?: string;
  }) => {
    const selectedOption = options.find((opt) => opt[valueKey] === selectedValue);

    return (
      <div className="relative">
        <label className="block text-sm mb-1">{label}</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full border p-2 rounded text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
          >
            <span className={selectedOption ? "text-black" : "text-gray-500"}>
              {selectedOption ? selectedOption[displayKey] : placeholder}
            </span>
            <svg
              className={`w-4 h-4 transform transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-hidden">
              <div className="p-2 border-b">
                <div className="relative">
                  <SearchIcon
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    size={14}
                  />
                  <input
                    type="text"
                    placeholder={`Search ${label.toLowerCase()}...`}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-7 pr-3 py-1 border rounded text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {options.length > 0 ? (
                  options.map((option) => (
                    <button
                      key={option[valueKey]}
                      type="button"
                      onClick={() => {
                        onSelect(option[valueKey]);
                        setIsOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                        selectedValue === option[valueKey]
                          ? "bg-blue-50 text-blue-600"
                          : ""
                      }`}
                    >
                      {option[displayKey]}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No results found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // column sets
  const locationColumns = ["District", "Block", "Grampanchayat", "Username", "Password"];
  const hqColumns = ["Role", "Username", "Password"];

  


  // Get the required fields for the current role to conditionally render dropdowns
  const requiredFields = getRequiredLocationFields(newUser.role);

  return (
    <div className="p-6 relative z-10">
      {/* Header */}
<div className="mb-6">
  <div className="flex justify-between items-center mb-4">
    <h1 className="text-2xl font-bold">User Management</h1>
    <button
      onClick={() => {
        setShowModal(true);
      }}
      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
    >
      <PlusCircle size={18} />
      Create New User
    </button>
  </div>
  
  {/* Global Search Bar */}
  <div className="relative max-w-md">
    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
    <input
      type="text"
      placeholder="Search users..."
      value={globalSearch}
      onChange={(e) => setGlobalSearch(e.target.value)}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>
</div>

      {/* Tables */}
      <Table
  title="Gram Panchayat Users"
  data={paginatedLocationUsers}
  columns={locationColumns}
  currentPage={locationPage}
  totalPages={locationTotalPages}
  totalItems={filteredLocationUsers.length}
  itemsPerPage={locationItemsPerPage}
  onPageChange={setLocationPage}
  onItemsPerPageChange={setLocationItemsPerPage}
/>

<Table
  title="Administrative Users"
  data={paginatedHqUsers}
  columns={hqColumns}
  currentPage={hqPage}
  totalPages={hqTotalPages}
  totalItems={filteredHqUsers.length}
  itemsPerPage={hqItemsPerPage}
  onPageChange={setHqPage}
  onItemsPerPageChange={setHqItemsPerPage}
/>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New User</h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm mb-1">Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => {
                    setNewUser({ ...newUser, role: e.target.value });
                    // Reset location selections when role changes
                    setSelectedDivisionId(null);
                    setSelectedDistrictId(null);
                    setSelectedBlockId(null);
                    setSelectedGramPanchayatId(null);
                  }}
                  className="w-full border p-2 rounded text-sm"
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Call Center">Call Center</option>
                  <option value="Director">Director</option>
                  <option value="DD">DD (Division)</option>
                  <option value="DPRO">DPRO (District)</option>
                  <option value="ADO">ADO (Block)</option>
                  <option value="Gram Panchayat">Gram Panchayat</option>
                </select>
              </div>

              {/* Division Dropdown - Only for DD and Gram Panchayat */}
              {requiredFields.division && (
                <SearchableDropdown
                  label="Division *"
                  options={filteredDivisions}
                  selectedValue={selectedDivisionId}
                  onSelect={(value) => {
                    setSelectedDivisionId(value);
                    setDivisionSearch("");
                  }}
                  searchValue={divisionSearch}
                  onSearchChange={setDivisionSearch}
                  isOpen={isDivisionOpen}
                  setIsOpen={setIsDivisionOpen}
                  displayKey="DivisionName"
                  valueKey="DivisionId"
                  placeholder="Select Division"
                />
              )}

              {/* District Dropdown - Only for DPRO, ADO and Gram Panchayat */}
              {requiredFields.district && (
                <SearchableDropdown
                  label="District *"
                  options={filteredDistricts}
                  selectedValue={selectedDistrictId}
                  onSelect={(value) => {
                    setSelectedDistrictId(value);
                    setDistrictSearch("");
                  }}
                  searchValue={districtSearch}
                  onSearchChange={setDistrictSearch}
                  isOpen={isDistrictOpen}
                  setIsOpen={setIsDistrictOpen}
                  displayKey="DistrictName"
                  valueKey="DistrictId"
                  placeholder="Select District"
                />
              )}

              {/* Block Dropdown - Only for ADO and Gram Panchayat */}
              {requiredFields.block && (
                <SearchableDropdown
                  label="Block *"
                  options={filteredBlocks}
                  selectedValue={selectedBlockId}
                  onSelect={(value) => {
                    setSelectedBlockId(value);
                    setBlockSearch("");
                  }}
                  searchValue={blockSearch}
                  onSearchChange={setBlockSearch}
                  isOpen={isBlockOpen}
                  setIsOpen={setIsBlockOpen}
                  displayKey="BlockName"
                  valueKey="BlockId"
                  placeholder="Select Block"
                />
              )}

              {/* Gram Panchayat Dropdown - Only for Gram Panchayat role */}
              {requiredFields.gramPanchayat && (
                <SearchableDropdown
                  label="Gram Panchayat *"
                  options={filteredGramPanchayats}
                  selectedValue={selectedGramPanchayatId}
                  onSelect={(value) => {
                    setSelectedGramPanchayatId(value);
                    setGramPanchayatSearch("");
                  }}
                  searchValue={gramPanchayatSearch}
                  onSearchChange={setGramPanchayatSearch}
                  isOpen={isGramPanchayatOpen}
                  setIsOpen={setIsGramPanchayatOpen}
                  displayKey="GramPanchayatName"
                  valueKey="Id"
                  placeholder="Select Gram Panchayat"
                />
              )}

              {/* Username */}
              <div>
                <label className="block text-sm mb-1">Username *</label>
                <input
                  type="text"
                  value={newUser.userId}
                  onChange={(e) => setNewUser({ ...newUser, userId: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                  placeholder="Enter username"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm mb-1">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                  placeholder="Enter email"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm mb-1">Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                  placeholder="Min 8 chars, 1 upper, 1 lower, 1 special"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must contain at least 8 characters, 1 uppercase, 1 lowercase, and 1 special character
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm mb-1">Confirm Password *</label>
                <input
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                  placeholder="Confirm password"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={createUser}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
                >
                  Create User
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && passwordUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setOldPassword("");
                  setNewPassword("");
                  setPasswordUser(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Username</label>
                <input
                  type="text"
                  value={passwordUser.username}
                  disabled
                  className="w-full border p-2 rounded text-sm bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Old Password *</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full border p-2 rounded text-sm"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">New Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border p-2 rounded text-sm"
                  placeholder="Min 8 chars, 1 upper, 1 lower, 1 special"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must contain at least 8 characters, 1 uppercase, 1 lowercase, and 1 special character
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    if (!oldPassword || !newPassword) {
                      alert("Please fill in both password fields");
                      return;
                    }

                    if (oldPassword === newPassword) {
                      alert("New password must be different from old password");
                      return;
                    }

                    if (!validatePassword(newPassword)) {
                      alert("New password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character");
                      return;
                    }
                    
                    const payload = {
                      UserId: passwordUser.id,
                      OldPassword: oldPassword,
                      NewPassword: newPassword,
                    };

                    fetch("https://wmsapi.kdsgroup.co.in/api/User/UserChangePassword", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    })
                      .then((res) => res.json())
                      .then((data) => {
                        alert(data.Message || "Password updated");
                        if (data.Status) {
                          setShowPasswordModal(false);
                          setOldPassword("");
                          setNewPassword("");
                          setPasswordUser(null);
                        }
                      })
                      .catch((err) => {
                        console.error("Error changing password:", err);
                        alert("Failed to change password");
                      });
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
                >
                  Change Password
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setOldPassword("");
                    setNewPassword("");
                    setPasswordUser(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;