import { useEffect, useState } from "react";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";

function Advisor() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [jobData, setJobData] = useState({
    description: "",
    estimatedTimeInMinutes: "",
    file: null,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const statuses = [
    "IN_SERVICE",
    "QC_PENDING",
    "READY_FOR_DELIVERY",
    "DELIVERED",
  ];

  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles/assigned");
      setVehicles(res.data);
    } catch (err) {
      setError("Failed to fetch vehicles");
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Update status
  const updateStatus = async (vehicleId) => {
    if (!selectedStatus) {
      setError("Please select a status");
      return;
    }

    try {
      await api.patch(`/vehicles/${vehicleId}/update-status`, {
        status: selectedStatus,
      });
      setMessage("Status updated successfully");
      setError("");
      fetchVehicles();
    } catch (err) {
      setError("Failed to update status");
    }
  };

  // Job form handlers
  const handleJobChange = (e) => {
    const { name, value, files } = e.target;
    setJobData({
      ...jobData,
      [name]: files ? files[0] : value,
    });
  };

  const addJob = async (vehicleId) => {
    if (!jobData.description) {
      setError("Job description required");
      return;
    }

    const formData = new FormData();
    formData.append("description", jobData.description);
    formData.append("estimatedTimeInMinutes", jobData.estimatedTimeInMinutes);
    if (jobData.file) {
      formData.append("jobFile", jobData.file);
    }

    try {
      await api.post(`/vehicles/${vehicleId}/jobs`, formData);
      setMessage("Job added successfully");
      setError("");
      setJobData({ description: "", estimatedTimeInMinutes: "", file: null });
    } catch (err) {
      setError("Failed to add job");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Advisor Dashboard</h1>
      <LogoutButton />

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Assigned Vehicles</h3>

      {vehicles.length === 0 && <p>No vehicles assigned.</p>}

      {vehicles.map((vehicle) => (
        <div
          key={vehicle._id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
          }}
        >
          <b>{vehicle.vehicleNumber}</b> — {vehicle.vehicleModel}
          <br />
          Current Status: <b>{vehicle.currentStatus}</b>

          <hr />

          {/* Status update */}
          <select
            onChange={(e) => setSelectedStatus(e.target.value)}
            defaultValue=""
          >
            <option value="">Update Status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            style={{ marginLeft: "10px" }}
            onClick={() => updateStatus(vehicle._id)}
          >
            Update
          </button>

          <hr />

          {/* Job form */}
          <h4>Add Job</h4>

          <input
            name="description"
            placeholder="Job description"
            value={jobData.description}
            onChange={handleJobChange}
          />
          <br />

          <input
            name="estimatedTimeInMinutes"
            placeholder="Estimated time (min)"
            value={jobData.estimatedTimeInMinutes}
            onChange={handleJobChange}
          />
          <br />

          <input
            type="file"
            name="file"
            onChange={handleJobChange}
          />
          <br /><br />

          <button onClick={() => addJob(vehicle._id)}>Add Job</button>
        </div>
      ))}
    </div>
  );
}

export default Advisor;
