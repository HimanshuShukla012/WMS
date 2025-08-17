import { useEffect, useMemo, useState } from "react";
import { useUserInfo } from '../utils/userInfo'; // same path as WaterQualityPage
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
  id: number;             // maps to UserId
  district: string;       // maps to DistrictName
  block: string;          // maps to BlockName
  grampanchayat: string;  // maps to GPName
  username: string;       // maps to UserName
  password: string;       // maps to Password
  active: boolean;        // maps to Status === 1
}

interface HQUser {
  id: number;          // maps to UserId
  role: string;        // maps to RoleName
  username: string;    // maps to UserName
  password: string;    // maps to Password
  active: boolean;     // maps to Status === 1
}

type District = { DistrictId: number; DistrictName: string };
type Block = { BlockId: number; BlockName: string };
type GramPanchayat = { Id: number; GramPanchayatName: string };

// -------------------- Utils --------------------
const normalizeKey = (label: string) =>
  label.toLowerCase().replace(/\s+/g, ""); // "Gram Panchayat" -> "grampanchayat"

const escapeCsv = (val: unknown) => {
  const s = String(val ?? "");
  if (/[",\n]/.test(s)) {
    // escape quotes and wrap in quotes
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

const downloadCsvFrom = (rows: Array<Record<string, unknown>>, headers: string[], filename: string) => {
  if (!rows || rows.length === 0) {
    // still create a file with just headers
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
  const { userId } = useUserInfo(); // ✅ dynamically fetch logged-in user ID

  // For new password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState<LocationUser | HQUser | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // search
  const [searchLocation, setSearchLocation] = useState("");
  const [searchHq, setSearchHq] = useState("");

  // -------------------- State for dropdowns (using AddBeneficiary pattern) --------------------
  const [districts, setDistricts] = useState<District[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayat[]>([]);

  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [selectedGramPanchayatId, setSelectedGramPanchayatId] = useState<number | null>(null);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    role: "",
    district: "",
    block: "",
    grampanchayat: "",
    userId: "",
    password: "",
    confirmPassword: "",
  });

  // -------------------- Fetch Districts (AddBeneficiary pattern) --------------------
  useEffect(() => {
    if (!showModal || newUser.role !== "Gram Panchayat" || !userId) return;

    fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetDistrict?UserId=${userId}`, {
      method: "POST",
      headers: { accept: "*/*" },
    })
      .then(res => res.json())
      .then(data => {
        if (data.Status && data.Data.length) {
          setDistricts(data.Data);
          setSelectedDistrictId(data.Data[0].DistrictId);
        }
      })
      .catch(err => console.error(err));
  }, [showModal, newUser.role, userId]);

  // -------------------- Fetch Blocks (AddBeneficiary pattern) --------------------
  useEffect(() => {
    if (!selectedDistrictId || !userId) return;

    fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetBlockListByDistrict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ UserId: userId, DistrictId: selectedDistrictId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.Status && data.Data.length) {
          setBlocks(data.Data);
          setSelectedBlockId(data.Data[0]?.BlockId || null);
        } else {
          setBlocks([]);
          setSelectedBlockId(null);
        }
      })
      .catch(err => console.error(err));
  }, [selectedDistrictId, userId]);

  // -------------------- Fetch Gram Panchayats (AddBeneficiary pattern) --------------------
  useEffect(() => {
    if (!selectedBlockId || !userId) return;

    fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetGramPanchayatByBlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ UserId: userId, BlockId: selectedBlockId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.Status && data.Data.length) {
          setGramPanchayats(data.Data);
          setSelectedGramPanchayatId(data.Data[0]?.Id || null);
        } else {
          setGramPanchayats([]);
          setSelectedGramPanchayatId(null);
        }
      })
      .catch(err => console.error(err));
  }, [selectedBlockId, userId]);

  // -------------------- Create User --------------------
  const createUser = () => {
    if (!newUser.role) {
      alert("Please select a role");
      return;
    }

    if (newUser.role === "Gram Panchayat") {
      const payload = {
        FirstName: newUser.userId,
        LastName: "",
        UserName: newUser.userId,
        Password: newUser.password,
        Email: "",
        Contact: "",
        DistrictId: selectedDistrictId || 0,
        BlockId: selectedBlockId || 0,
        GPId: selectedGramPanchayatId || 0,
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
          if (data.Status) setShowModal(false);
        })
        .catch((err) => {
          console.error(err);
          alert("Failed to create user");
        });
    } else {
      alert("User creation for HQ Admin / Call Center not implemented yet.");
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
          // Map API data to LocationUser format
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

  // actions
  const toggleUserStatus = (userId: number, currentStatus: boolean) => {
    const newStatus = currentStatus ? 0 : 1; // 1 = active, 0 = inactive

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
    setOldPassword(""); // reset fields
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
    columns: string[]; // visible columns (no Actions)
    toolbar?: React.ReactNode; // search + download per table
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
                <th
                  key={idx}
                  className="px-4 py-2 text-left text-sm font-medium"
                >
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
                    {/* centered action buttons */}
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-white ${
                          (user as any).active ? "bg-red-500" : "bg-green-600"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleUserStatus(user.id, user.active);
                        }}
                        title={(user as any).active ? "Deactivate" : "Activate"}
                      >
                        <Power size={16} />
                        {(user as any).active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => changePassword(user)} // pass the user object
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

  // column sets
  const locationColumns = ["District", "Block", "Grampanchayat", "Username", "Password"];
  const hqColumns = ["Role", "Username", "Password"];

  // toolbar nodes
  const LocationToolbar = (
    <div className="flex items-center gap-2">
      <div className="relative">
        <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2" size={16} />
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
        <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2" size={16} />
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
        title="HQ / Call Center Users"
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
                  <option value="Gram Panchayat">Gram Panchayat</option>
                  <option value="HQ Admin">HQ Admin</option>
                  <option value="Call Center">Call Center</option>
                </select>
              </div>

              {newUser.role === "Gram Panchayat" && (
                <>
                  {/* District */}
                  <div>
                    <label className="block text-sm mb-1">District</label>
                    <select
                      value={selectedDistrictId || ""}
                      onChange={(e) => setSelectedDistrictId(Number(e.target.value))}
                      className="border p-2 rounded w-full text-sm"
                    >
                      <option value="">Select District</option>
                      {districts.map(d => (
                        <option key={d.DistrictId} value={d.DistrictId}>{d.DistrictName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Block */}
                  <div>
                    <label className="block text-sm mb-1">Block</label>
                    <select
                      value={selectedBlockId || ""}
                      onChange={(e) => setSelectedBlockId(Number(e.target.value))}
                      className="border p-2 rounded w-full text-sm"
                    >
                      <option value="">Select Block</option>
                      {blocks.map(b => (
                        <option key={b.BlockId} value={b.BlockId}>{b.BlockName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Gram Panchayat */}
                  <div>
                    <label className="block text-sm mb-1">Gram Panchayat</label>
                    <select
                      value={selectedGramPanchayatId || ""}
                      onChange={(e) => setSelectedGramPanchayatId(Number(e.target.value))}
                      className="border p-2 rounded w-full text-sm"
                    >
                      <option value="">Select Gram Panchayat</option>
                      {gramPanchayats.map(gp => (
                        <option key={gp.Id} value={gp.Id}>{gp.GramPanchayatName}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm mb-1">User ID</label>
                <input
                  type="text"
                  value={newUser.userId}
                  onChange={(e) => setNewUser({ ...newUser, userId: e.target.value })}
                  className="border p-2 rounded w-full text-sm"
                  placeholder="Enter user ID"
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
                  onClick={() => setShowModal(false)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded border hover:bg-gray-50"
                >
                  <X size={16} />
                  Cancel
                </button>
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