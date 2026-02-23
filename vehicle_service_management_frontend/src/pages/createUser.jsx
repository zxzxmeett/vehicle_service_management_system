import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";
import ThemeToggle from "../components/ThemeToggle";

function CreateUser() {
  const navigate = useNavigate();

  // ---------------- CREATE USER ----------------
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/users", userData);
      setMessage("User created successfully");

      setUserData({ name: "", email: "", password: "", role: "" });

      if (selectedRole === userData.role) {
        fetchUsersByRole(selectedRole);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    }
  };

  // ---------------- FETCH USERS BY ROLE ----------------
  const [selectedRole, setSelectedRole] = useState("");
  const [users, setUsers] = useState([]);

  const fetchUsersByRole = async (role) => {
    try {
      const res = await api.get(`/users?role=${role}`);
      setUsers(res.data);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    if (selectedRole) fetchUsersByRole(selectedRole);
  }, [selectedRole]);

  // ---------------- TOGGLE USER STATUS ----------------
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/users/${userId}/status`, {
        isActive: !currentStatus,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isActive: !currentStatus } : u,
        ),
      );
    } catch {
      alert("Failed to update user status");
    }
  };

 return (
  <div className="min-h-screen bg-slate-200 dark:bg-[#0a0f1c] px-6 pt-10 pb-8 transition-colors duration-300">
    <div className="mx-auto max-w-6xl space-y-8">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#e6eef6]">
            User Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#9fb0c3]">
            Create users and manage access
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className="h-10 rounded-md border border-slate-300 dark:border-slate-700 px-4 text-sm
              text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            Back
          </button>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>

      {/* Messages */}
      {(message || error) && (
        <div className="mb-6 max-w-xl space-y-2">
          {message && (
            <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 px-4 py-2 text-sm text-green-700 dark:text-green-400">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Create User + Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Create User Card */}
        <div className="lg:col-span-2 rounded-xl bg-white dark:bg-[#121a2a] p-6 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
          <h2 className="mb-1 text-lg font-medium text-slate-900 dark:text-[#e6eef6]">
            Create New User
          </h2>
          <p className="mb-6 text-sm text-slate-500 dark:text-[#9fb0c3]">
            Enter user details and assign role
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: "Name", name: "name", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "Password", name: "password", type: "password" },
            ].map((input) => (
              <div key={input.name}>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {input.label}
                </label>
                <input
                  type={input.type}
                  name={input.name}
                  value={userData[input.name]}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-slate-900 dark:text-white transition
                    focus:border-slate-900 dark:focus:border-blue-500 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                />
              </div>
            ))}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Role
              </label>
              <select
                name="role"
                value={userData.role}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-slate-900 dark:text-white transition
                  focus:border-slate-900 dark:focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Role</option>
                <option value="SECURITY">Security</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="ADVISOR">Advisor</option>
              </select>
            </div>

            <button
              type="submit"
              className="mt-2 h-11 w-full rounded-md bg-slate-900 dark:bg-blue-600 text-white
                transition hover:bg-slate-800 dark:hover:bg-blue-500 active:scale-[0.99]"
            >
              Create User
            </button>
          </form>
        </div>

        {/* Guidelines Card */}
        <div className="rounded-xl bg-white dark:bg-[#121a2a] p-6 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047] h-fit">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-[#e6eef6] mb-3">
            User Creation Guidelines
          </h3>

          <ul className="space-y-2 text-sm text-slate-600 dark:text-[#9fb0c3] list-disc list-inside">
            <li>Name should match official records</li>
            <li>Email must be unique and valid</li>
            <li>Password should be strong (8+ characters)</li>
            <li>Assign the correct role carefully</li>
            <li>Deactivate users instead of deleting</li>
          </ul>

          <div className="mt-4 text-xs text-slate-500 dark:text-[#7f93ab]">
            ⚠️ Incorrect roles may cause access issues.
          </div>
        </div>

      </div>

      {/* Manage Users Card — Full Width */}
      <div className="rounded-xl bg-white dark:bg-[#121a2a] p-6 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-[#e6eef6]">
          Manage Users
        </h3>

        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Filter by role
        </label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="mb-4 h-11 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-slate-900 dark:text-white transition
            focus:border-slate-900 dark:focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select Role</option>
          <option value="SECURITY">Security</option>
          <option value="RECEPTIONIST">Receptionist</option>
          <option value="ADVISOR">Advisor</option>
        </select>

        {users.length === 0 && selectedRole && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No users found for this role.
          </p>
        )}

        {users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500 dark:text-[#9fb0c3]">
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-slate-100 dark:border-slate-800 last:border-none"
                  >
                    <td className="py-2 text-slate-900 dark:text-[#e6eef6]">
                      {user.name}
                    </td>
                    <td className="text-slate-700 dark:text-[#9fb0c3]">
                      {user.email}
                    </td>
                    <td className="text-slate-700 dark:text-[#9fb0c3]">
                      {user.role}
                    </td>
                    <td className="text-slate-600 dark:text-[#9fb0c3]">
                      {user.isActive ? "Active" : "Inactive"}
                    </td>
                    <td className="text-right py-2">
                      <button
                        onClick={() =>
                          toggleUserStatus(user._id, user.isActive)
                        }
                        className={`h-9 rounded-md px-3 text-xs font-medium transition
                          ${
                            user.isActive
                              ? "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                              : "bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-500"
                          }`}
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  </div>
);
}

export default CreateUser;
