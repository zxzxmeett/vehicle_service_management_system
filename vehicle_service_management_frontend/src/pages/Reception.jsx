import { useEffect, useState } from "react";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";

function Reception() {
  const [vehicles, setVehicles] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch checked-in vehicles
  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles?status=CHECKED_IN");
      setVehicles(res.data);
    } catch (err) {
      setError("Failed to fetch vehicles");
    }
  };

  // Fetch advisors
  const fetchAdvisors = async () => {
    try {
      const res = await api.get("/users?role=ADVISOR");
      setAdvisors(res.data);
    } catch (err) {
      setError("Failed to fetch advisors");
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchAdvisors();
  }, []);

  const assignAdvisor = async (vehicleId) => {
    if (!selectedAdvisor) {
      setError("Please select an advisor");
      return;
    }

    try {
      await api.patch(`/vehicles/${vehicleId}/assign-advisor`, {
        advisorId: selectedAdvisor,
      });

      setMessage("Advisor assigned successfully");
      setError("");
      fetchVehicles(); // refresh list
    } catch (err) {
      setError(err.response?.data?.message || "Assignment failed");
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Reception Dashboard</h1>
        <LogoutButton />
      </div>

      {message && <p className="msg-success">{message}</p>}
      {error && <p className="msg-error">{error}</p>}

      <h3>Assign Advisor</h3>

      <div className="card flex-row">
        <select
          value={selectedAdvisor}
          onChange={(e) => setSelectedAdvisor(e.target.value)}
        >
          <option value="">Select Advisor</option>
          {advisors.map((advisor) => (
            <option key={advisor._id} value={advisor._id}>
              {advisor.name}
            </option>
          ))}
        </select>
      </div>

      <ul className="list-reset">
        {vehicles.map((vehicle) => (
          <li key={vehicle._id} className="mt-1">
            <b>{vehicle.vehicleNumber}</b> — {vehicle.vehicleModel}
            <button
              className="btn ml-1"
              onClick={() => assignAdvisor(vehicle._id)}
            >
              Assign
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Reception;