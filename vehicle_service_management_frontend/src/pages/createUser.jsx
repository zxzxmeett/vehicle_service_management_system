import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";

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
    <div className="min-h-screen bg-slate-100 px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            User Management
          </h1>
          <p className="text-sm text-slate-500">
            Create users and manage access
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className="h-10 rounded-md border border-slate-300 px-4 text-sm
                     text-slate-700 transition hover:bg-slate-200"
          >
            Back
          </button>
          <LogoutButton />
        </div>
      </div>

      {/* Messages */}
      {(message || error) && (
        <div className="mb-6 max-w-xl space-y-2">
          {message && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Layout */}
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Create User */}
         <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-1 text-lg font-medium text-slate-900">
            Create New User
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            Enter user details and assign role
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                name="name"
                value={userData.name}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-md border border-slate-300 px-3 transition
                         focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                name="email"
                value={userData.email}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-md border border-slate-300 px-3 transition
                         focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-md border border-slate-300 px-3 transition
                         focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Role
              </label>
              <select
                name="role"
                value={userData.role}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-md border border-slate-300 px-3 transition
                         focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
              >
                <option value="">Select Role</option>
                <option value="SECURITY">Security</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="ADVISOR">Advisor</option>
              </select>
            </div>

            <button
              type="submit"
              className="mt-2 h-11 w-full rounded-md bg-slate-900 text-white
                       transition hover:bg-slate-800 active:scale-[0.99]"
            >
              Create User
            </button>
          </form>
        </div>

        {/* Manage Users */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Manage Users
          </h3>

          <label className="mb-1 block text-sm font-medium text-slate-700">
            Filter by role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="mb-4 h-11 w-full rounded-md border border-slate-300 px-3 transition
                     focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            <option value="">Select Role</option>
            <option value="SECURITY">Security</option>
            <option value="RECEPTIONIST">Receptionist</option>
            <option value="ADVISOR">Advisor</option>
          </select>

          {users.length === 0 && selectedRole && (
            <p className="text-sm text-slate-500">
              No users found for this role.
            </p>
          )}

          {users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
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
                      className="border-b border-slate-100 last:border-none"
                    >
                      <td className="py-2">{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td className="text-slate-600">
                        {user.isActive ? "Active" : "Inactive"}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() =>
                            toggleUserStatus(user._id, user.isActive)
                          }
                          className={`h-9 rounded-md px-3 text-xs font-medium transition
                          ${
                            user.isActive
                              ? "border border-slate-300 text-slate-700 hover:bg-slate-200"
                              : "bg-slate-900 text-white hover:bg-slate-800"
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
