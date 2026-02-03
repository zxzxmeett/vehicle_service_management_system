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
    <div className="container">
      {/* Header */}
      <div className="header">
        <div>
          <h1>User Management</h1>
          <p className="muted small">Create users and manage access</p>
        </div>

        <div className="flex-row">
          <button className="btn btn-ghost" onClick={() => navigate("/admin")}>
            Back to Dashboard
          </button>
          <LogoutButton />
        </div>
      </div>

      {message && <p className="msg-success">{message}</p>}
      {error && <p className="msg-error">{error}</p>}

      {/* Create User */}
      <div className="card">
        <h2 className="mb-1">Create New User</h2>

        <form className="form" onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            name="name"
            value={userData.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            required
          />

          <label>Role</label>
          <select
            name="role"
            value={userData.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="SECURITY">Security</option>
            <option value="RECEPTIONIST">Receptionist</option>
            <option value="ADVISOR">Advisor</option>
          </select>

          <button className="btn btn-primary mt-1" type="submit">
            Create User
          </button>
        </form>
      </div>

      {/* User List */}
      <div className="card">
        <h2 className="mb-1">Manage Users</h2>

        <label className="muted">Filter by role</label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">Select Role</option>
          <option value="SECURITY">Security</option>
          <option value="RECEPTIONIST">Receptionist</option>
          <option value="ADVISOR">Advisor</option>
        </select>

        {users.length === 0 && selectedRole && (
          <p className="muted mt-1">No users found for this role.</p>
        )}

        {users.length > 0 && (
          <table className="table mt-1">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.isActive ? "Active" : "Inactive"}</td>
                  <td>
                    <button
                      className={`btn ${
                        user.isActive ? "btn-ghost" : "btn-primary"
                      }`}
                      onClick={() =>
                        toggleUserStatus(user._id, user.isActive)
                      }
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default CreateUser;
