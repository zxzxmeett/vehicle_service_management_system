import { useEffect, useState } from "react";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";

function Admin() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [userMessage, setUserMessage] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const fetchDailyReport = async () => {
    try {
      const res = await api.get("/reports/daily");
      setReport(res.data);
    } catch (err) {
      setError("Failed to load admin report");
    }
  };

  useEffect(() => {
    fetchDailyReport();
  }, []);

  const handleUserChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };
//create new user
  const createUser = async (e) => {
    e.preventDefault();
    setUserMessage("");
    setError("");

    try {
      await api.post("/users", userData);
      setUserMessage("User created successfully");

      setUserData({
        name: "",
        email: "",
        password: "",
        role: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "User creation failed");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Admin Dashboard</h1>
      <LogoutButton />

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!report && !error && <p>Loading report...</p>}

      <hr />

      <h3>Create New User</h3>

      {userMessage && <p className="success">{userMessage}</p>}

      <form onSubmit={createUser} className="card">
        <input
          name="name"
          placeholder="Name"
          value={userData.name}
          onChange={handleUserChange}
          required
        />

        <input
          name="email"
          placeholder="Email"
          value={userData.email}
          onChange={handleUserChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={userData.password}
          onChange={handleUserChange}
          required
        />

        <select
          name="role"
          value={userData.role}
          onChange={handleUserChange}
          required
        >
          <option value="">Select Role</option>
          <option value="SECURITY">Security</option>
          <option value="RECEPTIONIST">Receptionist</option>
          <option value="ADVISOR">Advisor</option>
        </select>

        <button type="submit">Create User</button>
      </form>

      <hr />

      {report && (
        <>
          <h3>Date: {report.date}</h3>
          <h4>Total Vehicles Today: {report.totalVehicles}</h4>

          <table
            border="1"
            cellPadding="10"
            style={{ marginTop: "20px", borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th>Vehicle Number</th>
                <th>Status</th>
                <th>Service Time (min)</th>
                <th>Idle Time (min)</th>
              </tr>
            </thead>
            <tbody>
              {report.vehicles.map((vehicle) => (
                <tr key={vehicle.vehicleId}>
                  <td>{vehicle.vehicleNumber}</td>
                  <td>{vehicle.currentStatus}</td>
                  <td>{vehicle.serviceTimeInMinutes}</td>
                  <td>{vehicle.idleTimeInMinutes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default Admin;
