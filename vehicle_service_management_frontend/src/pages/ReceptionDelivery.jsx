import { useEffect, useState } from "react";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";
import { useNavigate } from "react-router-dom";

function ReceptionDelivery() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      const res = await api.get(
        "/vehicles?status=DELIVERED&isReceptionCompleted=false"
      );
      setVehicles(res.data);
    } catch {
      setError("Failed to fetch delivered vehicles");
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const markDone = async (vehicleId) => {
    try {
      await api.patch(`/vehicles/${vehicleId}/reception-done`);
      setVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
    } catch {
      alert("Failed to mark vehicle as done");
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div>
          <h1>Delivered Vehicles</h1>
          <p className="muted small">
            Finalize reception process for delivered vehicles
          </p>
        </div>

        <div className="flex-row">
          <button
            className="btn btn-ghost"
            onClick={() => navigate("/reception")}
          >
            Back to Reception
          </button>
          <LogoutButton />
        </div>
      </div>

      {error && <p className="msg-error">{error}</p>}

      {/* Vehicles */}
      <div className="card">
        {vehicles.length === 0 && (
          <p className="muted">No delivered vehicles pending completion.</p>
        )}

        {vehicles.map((v) => (
          <div key={v._id} className="vehicle-card">
            <div>
              <b>{v.vehicleNumber}</b> — {v.customerName}
            </div>

            <div className="flex-row mt-1">
              <button
                className="btn btn-primary"
                onClick={() => markDone(v._id)}
              >
                Mark as Completed
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReceptionDelivery;
