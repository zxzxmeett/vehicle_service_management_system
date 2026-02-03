import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";

function Admin() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [jobsMap, setJobsMap] = useState({});
  const [activeVehicleId, setActiveVehicleId] = useState(null);

  const fetchDailyReport = async () => {
    try {
      const res = await api.get("/reports/daily");
      setReport(res.data);
    } catch {
      setError("Failed to load admin report");
    }
  };

  useEffect(() => {
    fetchDailyReport();
  }, []);

  const fetchJobs = async (vehicleId) => {
    try {
      const res = await api.get(`/vehicles/${vehicleId}/jobs`);
      setJobsMap((prev) => ({ ...prev, [vehicleId]: res.data }));
      setActiveVehicleId(vehicleId);
    } catch {
      setError("Failed to load jobs");
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="muted small">Overview of today’s operations</p>
        </div>

        <div className="flex-row">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/admin/create-user")}
          >
            Create User
          </button>
          <LogoutButton />
        </div>
      </div>

      {error && <p className="msg-error">{error}</p>}
      {!report && !error && <p>Loading report...</p>}

      {/* Dashboard Summary */}
      {report && (
        <div className="card">
          <h2 className="mb-1">Today at a glance</h2>

          <div className="flex-row" style={{ flexWrap: "wrap" }}>
            <div className="vehicle-card">
              <b>{report.totalVehicles}</b>
              <div className="muted small">Vehicles Today</div>
            </div>

            <div className="vehicle-card">
              <b>{report.inService ?? "-"}</b>
              <div className="muted small">In Service</div>
            </div>

            <div className="vehicle-card">
              <b>{report.readyForDelivery ?? "-"}</b>
              <div className="muted small">Ready</div>
            </div>

            {report.pendingPayments != null && (
              <div className="vehicle-card">
                <b>{report.pendingPayments}</b>
                <div className="muted small">Pending Payments</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vehicles Table */}
      {report && (
        <div className="card">
          <h2>Vehicles</h2>

          <table className="table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Service Time</th>
                <th>Idle Time</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {report.vehicles.map((v) => (
                <tr key={v.vehicleId}>
                  <td>{v.vehicleNumber}</td>
                  <td>{v.currentStatus}</td>
                  <td>{v.serviceTimeInMinutes} min</td>
                  <td>{v.idleTimeInMinutes} min</td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      onClick={() => fetchJobs(v.vehicleId)}
                    >
                      View Jobs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Jobs Panel */}
      {activeVehicleId && jobsMap[activeVehicleId] && (
        <div className="card">
          <h2>Jobs for Vehicle</h2>

          {jobsMap[activeVehicleId].length === 0 ? (
            <p className="muted">No jobs found.</p>
          ) : (
            <ul className="list-reset">
              {jobsMap[activeVehicleId].map((job, i) => (
                <li key={i} className="vehicle-card">
                  <b>{job.description}</b>
                  {job.file && (
                    <div className="mt-1">
                      <a
                        href={`http://localhost:5000/${job.file}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Job Card
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Admin;
