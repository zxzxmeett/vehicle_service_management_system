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
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/users", userData);
      setMessage("User created successfully");

      setUserData({
        name: "",
        email: "",
        password: "",
        role: "",
      });

      // refresh list if same role is selected
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
    if (selectedRole) {
      fetchUsersByRole(selectedRole);
    }
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
    } catch (err) {
      alert("Failed to update user status");
    }
  };

  return (
    <div className="container">
      <LogoutButton />

      <h1>Create New User</h1>

      {message && <p className="msg-success">{message}</p>}
      {error && <p className="msg-error">{error}</p>}

      {/* -------- CREATE USER FORM -------- */}
      <form className="card" onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={userData.name}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          placeholder="Email"
          value={userData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={userData.password}
          onChange={handleChange}
          required
        />

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

        <button className="btn btn-primary" type="submit">
          Create User
        </button>
      </form>

      {/* -------- FILTER USERS -------- */}
      <h2 style={{ marginTop: "30px" }}>View Users By Role</h2>

      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
      >
        <option value="">Select Role</option>
        <option value="SECURITY">Security</option>
        <option value="RECEPTIONIST">Receptionist</option>
        <option value="ADVISOR">Advisor</option>
      </select>

      {/* -------- USERS TABLE -------- */}
      {users.length > 0 && (
        <table className="user-table" style={{ marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
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
                    className={
                      user.isActive ? "btn btn-danger" : "btn btn-success"
                    }
                    onClick={() => toggleUserStatus(user._id, user.isActive)}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="btn btn-ghost" onClick={() => navigate("/admin")}>
        Back to Admin Dashboard
      </button>
    </div>
  );
}

export default CreateUser;
