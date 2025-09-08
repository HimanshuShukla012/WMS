import { useEffect, useMemo, useState } from "react";
import { useUserInfo } from '../utils/userInfo';
import {
  Power,
  Lock,
  Download,
  PlusCircle,
  X,
  CheckCircle2,
  Search as SearchIcon,
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

  // search
  const [searchLocation, setSearchLocation] = useState("");
  const [searchHq, setSearchHq] = useState("");

  // -------------------- State for dropdowns --------------------
  const [districts, setDistricts] = useState<District[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayat[]>([]);

  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [selectedGramPanchayatId, setSelectedGramPanchayatId] = useState<number | null>(null);

  // Search states for dropdowns
  const [districtSearch, setDistrictSearch] = useState("");
  const [blockSearch, setBlockSearch] = useState("");
  const [gramPanchayatSearch, setGramPanchayatSearch] = useState("");

  // Dropdown open/close states
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [isGramPanchayatOpen, setIsGramPanchayatOpen] = useState(false);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    role: "",
    district: "",
    block: "",
    grampanchayat: "",
    userId: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // -------------------- Fetch Districts --------------------
  useEffect(() => {
    if (!showModal || newUser.role !== "Gram Panchayat") return;

    fetch("https://wmsapi.kdsgroup.co.in/api/Master/AllDistrict", {
      method: "POST",
      headers: { accept: "*/*", "Content-Type": "application/json" },
      body: JSON.stringify({}), // Empty body as no parameters are required
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status && data.Data?.length) {
          // Sort districts alphabetically by DistrictName
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
    if (!selectedDistrictId) return;

    fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetAllBlocks?DistrictId=${selectedDistrictId}`, {
      method: "POST",
      headers: { accept: "*/*", "Content-Type": "application/json" },
      body: JSON.stringify({}), // Empty body as DistrictId is in query
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status && data.Data?.length) {
          // Sort blocks alphabetically by BlockName
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
  }, [selectedDistrictId]);

  // -------------------- Fetch Gram Panchayats --------------------
  useEffect(() => {
    if (!selectedBlockId) return;

    fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetAllGramPanchayat?BlockId=${selectedBlockId}`, {
      method: "POST",
      headers: { accept: "*/*", "Content-Type": "application/json" },
      body: JSON.stringify({}), // Empty body as BlockId is in query
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status && data.Data?.length) {
          // Sort gram panchayats alphabetically by GramPanchayatName
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
  }, [selectedBlockId]);

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

    if (!newUser.password) {
      alert("Please enter a password");
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Determine RoleId based on role selection
    let roleId: number;
    if (newUser.role === "Admin") {
      roleId = 1;
    } else if (newUser.role === "Gram Panchayat") {
      roleId = 3;
    } else {
      alert("Invalid role selected");
      return;
    }

    if (newUser.role === "Gram Panchayat") {
      if (!selectedDistrictId || !selectedBlockId || !selectedGramPanchayatId) {
        alert("Please select District, Block, and Gram Panchayat");
        return;
      }

      const payload = {
        UserName: newUser.userId,
        Password: newUser.password,
        Email: newUser.email,
        DistrictId: selectedDistrictId,
        BlockId: selectedBlockId,
        RoleId: roleId,
        GPId: selectedGramPanchayatId,
        CreatedBy: parseInt(String(userId) || "0"),
        UpdatedBy: 0,
        DeviceToken: "",
        IPAddress: "",
        Status: 1,
      };

      fetch("https://wmsapi.kdsgroup.co.in/api/User/InsertNewUserDetailsByAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.Message || "User created");
          if (data.Status) {
            setShowModal(false);
            setNewUser({
              role: "",
              district: "",
              block: "",
              grampanchayat: "",
              userId: "",
              email: "",
              password: "",
              confirmPassword: "",
            });
            setDistrictSearch("");
            setBlockSearch("");
            setGramPanchayatSearch("");
            setIsDistrictOpen(false);
            setIsBlockOpen(false);
            setIsGramPanchayatOpen(false);
            setSelectedDistrictId(null);
            setSelectedBlockId(null);
            setSelectedGramPanchayatId(null);
            window.location.reload();
          }
        })
        .catch((err) => {
          console.error(err);
          alert("Failed to create user");
        });
    } else if (newUser.role === "Admin") {
      const payload = {
        UserName: newUser.userId,
        Password: newUser.password,
        Email: newUser.email,
        DistrictId: 0,
        BlockId: 0,
        RoleId: roleId,
        GPId: 0,
        CreatedBy: parseInt(String(userId) || "0"),
        UpdatedBy: 0,
        DeviceToken: "",
        IPAddress: "",
        Status: 1,
      };

      fetch("https://wmsapi.kdsgroup.co.in/api/User/InsertNewUserDetailsByAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.Message || "User created");
          if (data.Status) {
            setShowModal(false);
            setNewUser({
              role: "",
              district: "",
              block: "",
              grampanchayat: "",
              userId: "",
              email: "",
              password: "",
              confirmPassword: "",
            });
            window.location.reload();
          }
        })
        .catch((err) => {
          console.error(err);
          alert("Failed to create user");
        });
    }
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
  const filteredLocationUsers = useMemo(() => {
    const q = searchLocation.trim().toLowerCase();
    if (!q) return locationUsers;
    return locationUsers.filter((u) =>
      [u.district, u.block, u.grampanchayat, u.username, u.password]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [locationUsers, searchLocation]);

  const filteredHqUsers = useMemo(() => {
    const q = searchHq.trim().toLowerCase();
    if (!q) return hqUsers;
    return hqUsers.filter((u) =>
      [u.role, u.username, u.password].join(" ").toLowerCase().includes(q)
    );
  }, [hqUsers, searchHq]);

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

  // table helper
  const Table = <T extends { id: number; active?: boolean }>({
    title,
    data,
    columns,
    toolbar,
  }: {
    title: string;
    data: T[];
    columns: string[];
    toolbar?: React.ReactNode;
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

  // toolbar nodes
  const LocationToolbar = (
    <div className="flex items-center gap-2">
      <div className="relative">
        <SearchIcon
          className="absolute left-2 top-1/2 -translate-y-1/2"
          size={16}
        />
        <input
          type="text"
          placeholder="Search..."
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          className="pl-7 pr-3 py-1 border rounded text-sm"
        />
      </div>
      <button
        onClick={() =>
          downloadCsvFrom(
            filteredLocationUsers as unknown as Record<string, unknown>[],
            locationColumns,
            "location_users.csv"
          )
        }
        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-sm"
        title="Download CSV"
      >
        <Download size={16} />
        Download
      </button>
    </div>
  );

  const HqToolbar = (
    <div className="flex items-center gap-2">
      <div className="relative">
        <SearchIcon
          className="absolute left-2 top-1/2 -translate-y-1/2"
          size={16}
        />
        <input
          type="text"
          placeholder="Search..."
          value={searchHq}
          onChange={(e) => setSearchHq(e.target.value)}
          className="pl-7 pr-3 py-1 border rounded text-sm"
        />
      </div>
      <button
        onClick={() =>
          downloadCsvFrom(
            filteredHqUsers as unknown as Record<string, unknown>[],
            hqColumns,
            "hq_users.csv"
          )
        }
        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-sm"
        title="Download CSV"
      >
        <Download size={16} />
        Download
      </button>
    </div>
  );

  return (
    <div className="p-6 relative z-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => {
            console.log("Create New User button clicked");
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          <PlusCircle size={18} />
          Create New User
        </button>
      </div>

      {/* Location-Based Users */}
      <Table<LocationUser>
        title="Location-Based Users"
        columns={locationColumns}
        data={filteredLocationUsers}
        toolbar={LocationToolbar}
      />

      {/* HQ / Call Center Users */}
      <Table<HQUser>
        title="HQ / Admin Users"
        columns={hqColumns}
        data={filteredHqUsers}
        toolbar={HqToolbar}
      />

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]">
          <div className="bg-white p-6 rounded-lg w-[420px] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create New User</h2>
              <button
                onClick={() => setShowModal(false)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded border hover:bg-gray-50"
                title="Close"
              >
                <X size={16} />
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="border p-2 rounded w-full text-sm"
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Gram Panchayat">Gram Panchayat</option>
                </select>
              </div>

              {newUser.role === "Gram Panchayat" && (
                <>
                  <SearchableDropdown
                    label="District"
                    options={filteredDistricts}
                    selectedValue={selectedDistrictId}
                    onSelect={(value) => {
                      setSelectedDistrictId(value);
                      setSelectedBlockId(null);
                      setSelectedGramPanchayatId(null);
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

                  <SearchableDropdown
                    label="Block"
                    options={filteredBlocks}
                    selectedValue={selectedBlockId}
                    onSelect={(value) => {
                      setSelectedBlockId(value);
                      setSelectedGramPanchayatId(null);
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

                  <SearchableDropdown
                    label="Gram Panchayat"
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
                </>
              )}

              <div>
                <label className="block text-sm mb-1">Username</label>
                <input
                  type="text"
                  value={newUser.userId}
                  onChange={(e) => setNewUser({ ...newUser, userId: e.target.value })}
                  className="border p-2 rounded w-full text-sm"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="border p-2 rounded w-full text-sm"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="border p-2 rounded w-full text-sm"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={(e) =>
                    setNewUser({ ...newUser, confirmPassword: e.target.value })
                  }
                  className="border p-2 rounded w-full text-sm"
                  placeholder="Re-enter password"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={createUser}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <CheckCircle2 size={18} />
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && passwordUser && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]">
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Change Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded border hover:bg-gray-50"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Old Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="border p-2 rounded w-full text-sm"
                  placeholder="Enter old password"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border p-2 rounded w-full text-sm"
                  placeholder="Enter new password"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded border hover:bg-gray-50"
                >
                  <X size={16} /> Cancel
                </button>

                <button
                  onClick={() => {
                    if (!oldPassword || !newPassword) return alert("Please fill both fields");

                    fetch("https://wmsapi.kdsgroup.co.in/api/User/UserChangePassword", {
                      method: "POST",
                      headers: { "Content-Type": "application/json", accept: "*/*" },
                      body: JSON.stringify({
                        UserId: passwordUser.id,
                        OldPassword: oldPassword,
                        NewPassword: newPassword,
                      }),
                    })
                      .then((res) => res.json())
                      .then((data) => {
                        if (data.Status) {
                          alert(data.Message || "Password updated successfully");
                          if (locationUsers.some((u) => u.id === passwordUser.id)) {
                            setLocationUsers((prev) =>
                              prev.map((u) =>
                                u.id === passwordUser.id ? { ...u, password: newPassword } : u
                              )
                            );
                          } else {
                            setHqUsers((prev) =>
                              prev.map((u) =>
                                u.id === passwordUser.id ? { ...u, password: newPassword } : u
                              )
                            );
                          }
                          setShowPasswordModal(false);
                        } else {
                          alert("Failed to update password");
                        }
                      })
                      .catch((err) => {
                        console.error(err);
                        alert("Failed to update password");
                      });
                  }}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  <CheckCircle2 size={16} /> Update
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