import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";

function Admin() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [jobsMap, setJobsMap] = useState({});

  // fetch daily report
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

  // fetch jobs for a vehicle
  const fetchJobs = async (vehicleId) => {
    try {
      const res = await api.get(`/vehicles/${vehicleId}/jobs`);
      setJobsMap((prev) => ({
        ...prev,
        [vehicleId]: res.data,
      }));
    } catch {
      setError("Failed to load jobs");
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Admin Dashboard</h1>
        <div>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/admin/create-user")}
          >
            Create New User
          </button>
        </div>
      </div>

      <LogoutButton />

      {error && <p className="msg-error">{error}</p>}

      {!report && !error && <p>Loading report...</p>}

      <h2>Daily Report</h2>

      {report && (
        <>
          <h3>Date: {report.date}</h3>
          <h4>Total Vehicles Today: {report.totalVehicles}</h4>

          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Status</th>
                  <th>Service Time (min)</th>
                  <th>Idle Time (min)</th>
                  <th>Jobs</th>
                </tr>
              </thead>
              <tbody>
                {report.vehicles.map((vehicle) => (
                  <tr key={vehicle.vehicleId}>
                    <td>{vehicle.vehicleNumber}</td>
                    <td>{vehicle.currentStatus}</td>
                    <td>{vehicle.serviceTimeInMinutes}</td>
                    <td>{vehicle.idleTimeInMinutes}</td>
                    <td>
                      <button
                        className="btn"
                        onClick={() => fetchJobs(vehicle.vehicleId)}
                      >
                        View Jobs
                      </button>

                      {jobsMap[vehicle.vehicleId]?.length > 0 && (
                        <div className="muted mt-1">
                          {jobsMap[vehicle.vehicleId].map((job, i) => (
                            <div key={i}>
                              <b>{job.description}</b>
                              {job.file && (
                                <>
                                  {" "}
                                  —{" "}
                                  <a
                                    href={`http://localhost:5000/${job.file}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    View Card
                                  </a>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Admin;
