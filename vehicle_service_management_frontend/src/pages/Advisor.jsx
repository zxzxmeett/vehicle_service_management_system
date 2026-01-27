import { useEffect, useState } from "react";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";

function Advisor() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [jobData, setJobData] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const statuses = [
    "IN_SERVICE",
    "QC_PENDING",
    "READY_FOR_DELIVERY",
    "DELIVERED",
  ];

  /* ================= FETCH VEHICLES ================= */

  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles/assigned");
      setVehicles(res.data);
    } catch {
      setError("Failed to fetch vehicles");
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  /* ================= STATUS UPDATE ================= */

  const updateStatus = async (vehicleId) => {
    if (!selectedStatus[vehicleId]) {
      setError("Please select a status");
      return;
    }

    try {
      await api.patch(`/vehicles/${vehicleId}/update-status`, {
        status: selectedStatus[vehicleId],
      });
      setMessage("Status updated successfully");
      setError("");
      fetchVehicles();
    } catch {
      setError("Failed to update status");
    }
  };

  /* ================= JOB HANDLING ================= */

  const handleJobChange = (vehicleId, e) => {
    const { name, value, files } = e.target;

    setJobData((prev) => ({
      ...prev,
      [vehicleId]: {
        ...prev[vehicleId],
        [name]: files ? files[0] : value,
      },
    }));
  };

  const addJob = async (vehicleId) => {
    const data = jobData[vehicleId];

    if (!data?.description) {
      setError("Job description required");
      return;
    }

    const formData = new FormData();
    formData.append("description", data.description);
    formData.append("estimatedTimeInMinutes", data.estimatedTimeInMinutes);
    if (data.file) {
      formData.append("jobFile", data.file);
    }

    try {
      await api.post(`/vehicles/${vehicleId}/jobs`, formData);
      setMessage("Job added successfully");
      setError("");

      // clear only this vehicle's form
      setJobData((prev) => ({
        ...prev,
        [vehicleId]: {},
      }));

      fetchVehicles();
    } catch {
      setError("Failed to add job");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="container">
      <div className="header">
        <h1>Advisor Dashboard</h1>
        <LogoutButton />
      </div>

      {message && <p className="msg-success">{message}</p>}
      {error && <p className="msg-error">{error}</p>}

      <h3>Assigned Vehicles</h3>

      {vehicles.length === 0 && <p>No vehicles assigned.</p>}

      {vehicles
        .filter((vehicle) => vehicle.currentStatus !== "DELIVERED")
        .map((vehicle) => (
          <div key={vehicle._id} className="vehicle-card">
            <div>
              <b>{vehicle.vehicleNumber}</b> — {vehicle.vehicleModel}
            </div>
            <div className="muted">
              Current Status: <b>{vehicle.currentStatus}</b>
            </div>
            <hr />

            <div className="flex-row">
              <select
                value={selectedStatus[vehicle._id] || ""}
                onChange={(e) =>
                  setSelectedStatus((prev) => ({
                    ...prev,
                    [vehicle._id]: e.target.value,
                  }))
                }
              >
                <option value="">Update Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <button className="btn" onClick={() => updateStatus(vehicle._id)}>
                Update
              </button>
            </div>

            <hr />
            <h4>Jobs</h4>
            {vehicle.jobs?.length === 0 && <p>No jobs added yet.</p>}
            {vehicle.jobs?.map((job, index) => (
              <div key={index} className="mb-1">
                <b>{job.description}</b> ({job.estimatedTimeInMinutes} min)
                <br />
                {job.file && (
                  <a
                    href={`http://localhost:5000/${job.file}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Job Card
                  </a>
                )}
              </div>
            ))}

            <hr />
            <h4>Add Job</h4>
            <div className="form">
              <input
                name="description"
                placeholder="Job description"
                value={jobData[vehicle._id]?.description || ""}
                onChange={(e) => handleJobChange(vehicle._id, e)}
              />

              <input
                name="estimatedTimeInMinutes"
                placeholder="Estimated time (min)"
                value={jobData[vehicle._id]?.estimatedTimeInMinutes || ""}
                onChange={(e) => handleJobChange(vehicle._id, e)}
              />

              <input
                type="file"
                name="file"
                onChange={(e) => handleJobChange(vehicle._id, e)}
              />

              <div>
                <button
                  className="btn btn-primary"
                  onClick={() => addJob(vehicle._id)}
                >
                  Add Job
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

export default Advisor;