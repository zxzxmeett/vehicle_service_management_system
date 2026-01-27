import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";

function CreateUser() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/users", userData);
      setMessage("User created successfully");

      setUserData({
        name: "",
        email: "",
        password: "",
        role: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <div className="container">
      <LogoutButton />
      <h1>Create New User</h1>

      {message && <p className="msg-success">{message}</p>}
      {error && <p className="msg-error">{error}</p>}

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

      <button className="btn btn-ghost" onClick={() => navigate("/admin")}>
        Back to Admin Dashboard
      </button>
    </div>
  );
}

export default CreateUser;
