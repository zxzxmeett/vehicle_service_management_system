import { useState, useEffect } from "react";
import api from "../services/api";

function ManageUsers() {
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

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/users/${userId}/status`, {
        isActive: !currentStatus,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isActive: !currentStatus } : u
        )
      );
    } catch {
      alert("Failed to update user status");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        Manage Users
      </h1>

      <div className="rounded-xl bg-white dark:bg-[#121a2a] p-6 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-[#e6eef6]">
          Manage Users
        </h3>

        {/* Filter */}
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Filter by role
        </label>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="mb-4 h-11 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-slate-900 dark:text-white"
        >
          <option value="">Select Role</option>
          <option value="SECURITY">Security</option>
          <option value="RECEPTIONIST">Receptionist</option>
          <option value="ADVISOR">Advisor</option>
        </select>

        {/* Empty */}
        {users.length === 0 && selectedRole && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No users found for this role.
          </p>
        )}

        {/* Table */}
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
                    className="border-b border-slate-100 dark:border-slate-800"
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
  );
}

export default ManageUsers;