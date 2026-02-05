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
    <div className="min-h-screen bg-slate-100 px-6 py-8">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Overview of today’s operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/create-user")}
            className="h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white
                     transition hover:bg-slate-800"
          >
            Create User
          </button>
          <LogoutButton />
        </div>
      </div>

      {/* Error / Loading */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {!report && !error && (
        <p className="text-sm text-slate-500">Loading report…</p>
      )}

      {/* Summary */}
      {report && (
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-medium text-slate-900">
            Today at a glance
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-2xl font-semibold text-slate-900">
                {report.totalVehicles}
              </div>
              <div className="text-sm text-slate-500">Vehicles Today</div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-2xl font-semibold text-slate-900">
                {report.inService ?? "-"}
              </div>
              <div className="text-sm text-slate-500">In Service</div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-2xl font-semibold text-slate-900">
                {report.readyForDelivery ?? "-"}
              </div>
              <div className="text-sm text-slate-500">Ready</div>
            </div>

            {report.pendingPayments != null && (
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="text-2xl font-semibold text-slate-900">
                  {report.pendingPayments}
                </div>
                <div className="text-sm text-slate-500">Pending Payments</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vehicles Table */}
      {report && (
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Vehicles</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2">Vehicle</th>
                  <th>Status</th>
                  <th>Service Time</th>
                  <th>Idle Time</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {report.vehicles.map((v) => (
                  <tr
                    key={v.vehicleId}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-2 font-medium text-slate-900">
                      {v.vehicleNumber}
                    </td>
                    <td className="text-slate-700">{v.currentStatus}</td>
                    <td className="text-slate-700">
                      {v.serviceTimeInMinutes} min
                    </td>
                    <td className="text-slate-700">
                      {v.idleTimeInMinutes} min
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => fetchJobs(v.vehicleId)}
                        className="rounded-md px-3 py-1 text-sm text-slate-700
                                 hover:bg-slate-100"
                      >
                        View Jobs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Jobs Panel */}
      {activeVehicleId && jobsMap[activeVehicleId] && (
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-medium text-slate-900">
            Jobs for Vehicle
          </h2>

          {jobsMap[activeVehicleId].length === 0 ? (
            <p className="text-sm text-slate-500">No jobs found.</p>
          ) : (
            <ul className="space-y-3">
              {jobsMap[activeVehicleId].map((job, i) => (
                <li key={i} className="rounded-lg bg-slate-50 p-4">
                  <div className="font-medium text-slate-900">
                    {job.description}
                  </div>

                  {job.file && (
                    <div className="mt-2">
                      <a
                        href={`http://localhost:5000/${job.file}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-slate-700 underline hover:text-slate-900"
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
