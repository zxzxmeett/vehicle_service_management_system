import { useEffect, useState } from "react";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";
import { useNavigate } from "react-router-dom";

function Reception() {
  const [vehicles, setVehicles] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /* ================= FETCH DATA ================= */

  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles?status=CHECKED_IN");
      setVehicles(res.data);
    } catch {
      setError("Failed to fetch vehicles");
    }
  };

  const fetchAdvisors = async () => {
    try {
      const res = await api.get("/users?role=ADVISOR");
      setAdvisors(res.data);
    } catch {
      setError("Failed to fetch advisors");
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchAdvisors();
  }, []);

  /* ================= ASSIGN ADVISOR ================= */

  const assignAdvisor = async (vehicleId) => {
    if (!selectedAdvisor) {
      setError("Please select an advisor first");
      return;
    }

    try {
      await api.patch(`/vehicles/${vehicleId}/assign-advisor`, {
        advisorId: selectedAdvisor,
      });

      setMessage("Advisor assigned successfully");
      setError("");
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || "Assignment failed");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div>
          <h1>Reception Dashboard</h1>
          <p className="muted small">Assign advisors to checked-in vehicles</p>
        </div>
        <LogoutButton />
      </div>

      {message && <p className="msg-success">{message}</p>}
      {error && <p className="msg-error">{error}</p>}

      {/* Advisor selection */}
      <div className="card">
        <h2 className="mb-1">Select Advisor</h2>

        <select
          value={selectedAdvisor}
          onChange={(e) => setSelectedAdvisor(e.target.value)}
        >
          <option value="">Choose advisor</option>
          {advisors.map((advisor) => (
            <option key={advisor._id} value={advisor._id}>
              {advisor.name}
            </option>
          ))}
        </select>
      </div>

      {/* Vehicles list */}
      <div className="card">
        <h2 className="mb-1">Checked-in Vehicles</h2>

        {vehicles.length === 0 && (
          <p className="muted">No vehicles waiting for assignment.</p>
        )}

        {vehicles.map((vehicle) => (
          <div key={vehicle._id} className="vehicle-card">
            <div>
              <b>{vehicle.vehicleNumber}</b> — {vehicle.vehicleModel}
            </div>

            <div className="flex-row mt-1">
              <button
                className="btn btn-primary"
                onClick={() => assignAdvisor(vehicle._id)}
              >
                Assign Advisor
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-1">
        <button
          className="btn btn-ghost"
          onClick={() => navigate("/reception/delivery")}
        >
          Go to Delivery
        </button>
      </div>
    </div>
  );
}

export default Reception;
