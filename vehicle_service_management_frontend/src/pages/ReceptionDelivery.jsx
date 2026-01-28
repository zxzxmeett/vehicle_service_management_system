import { useEffect, useState } from "react";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";

function ReceptionDelivery() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");

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
      <LogoutButton />
      <h1>Delivered Vehicles</h1>

      {error && <p className="msg-error">{error}</p>}

      <ul className="list-reset">
        {vehicles.map((v) => (
          <li key={v._id}>
            <b>{v.vehicleNumber}</b> — {v.customerName}
            <button
              className="btn btn-success ml-1"
              onClick={() => markDone(v._id)}
            >
              Done
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReceptionDelivery;
