import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";
import ThemeToggle from "../components/ThemeToggle";

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

  const STATUS = {
    IN_SERVICE: "IN_SERVICE",
    READY: "READY_FOR_DELIVERY",
    DELIVERD: "DELIVERED",
  };

  const normalize = (s = "") => s.toUpperCase();

  const inServiceCount =
    report?.vehicles?.filter(
      (v) => normalize(v.currentStatus) === STATUS.IN_SERVICE || normalize(v.currentStatus) === "QC_PENDING"
    ).length ?? 0;

  const readyCount =
    report?.vehicles?.filter((v) => normalize(v.currentStatus) === STATUS.READY)
      .length ?? 0;

  const deliveredCount =
    report?.vehicles?.filter(
      (v) => normalize(v.currentStatus) === STATUS.DELIVERD,
    ).length ?? 0;

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-[#0a0f1c] px-6 pt-10 pb-8 transition-colors duration-300">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#e6eef6]">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#9fb0c3]">
              Overview of today’s operations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/create-user")}
              className="h-10 rounded-md bg-slate-900 dark:bg-blue-600 px-4 text-sm font-medium text-white
                     transition hover:bg-slate-800 dark:hover:bg-blue-500"
            >
              Create User
            </button>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>

        {/* Error / Loading */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        {!report && !error && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading report…
          </p>
        )}

        {/* Summary Card */}
        {report && (
          <div className="mb-8 rounded-xl bg-white dark:bg-[#121a2a] p-6 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
            <h2 className="mb-4 text-lg font-medium text-slate-900 dark:text-[#e6eef6]">
              Today at a glance
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Vehicles Today", val: report.totalVehicles },
                { label: "In Service", val: inServiceCount },
                { label: "Ready", val: readyCount },
                { label: "Delivered", val: deliveredCount },
                {
                  label: "Pending Payments",
                  val: report.pendingPayments,
                  condition: report.pendingPayments != null,
                },
              ].map(
                (stat, i) =>
                  stat.condition !== false && (
                    <div
                      key={i}
                      className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4"
                    >
                      <div className="text-2xl font-semibold text-slate-900 dark:text-white">
                        {stat.val}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-[#9fb0c3]">
                        {stat.label}
                      </div>
                    </div>
                  ),
              )}
            </div>
          </div>
        )}

        {/* Vehicles Table */}
        {report && (
          <div className="mb-8 rounded-xl bg-white dark:bg-[#121a2a] p-6 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
            <h2 className="mb-4 text-lg font-medium text-slate-900 dark:text-[#e6eef6]">
              Vehicles
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500 dark:text-[#9fb0c3]">
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
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-2 font-medium text-slate-900 dark:text-[#e6eef6]">
                        {v.vehicleNumber}
                      </td>
                      <td className="text-slate-700 dark:text-[#9fb0c3]">
                        {v.currentStatus}
                      </td>
                      <td className="text-slate-700 dark:text-[#9fb0c3]">
                        {v.serviceTimeInMinutes} min
                      </td>
                      <td className="text-slate-700 dark:text-[#9fb0c3]">
                        {v.idleTimeInMinutes} min
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => fetchJobs(v.vehicleId)}
                          className="rounded-md px-3 py-1 text-sm text-slate-700 dark:text-[#9fb0c3]
                                 hover:bg-slate-200 dark:hover:bg-slate-700"
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
        {/* Updated Jobs Panel Section in Admin.jsx */}
        {activeVehicleId && jobsMap[activeVehicleId] && (
          <div className="rounded-xl bg-white dark:bg-[#121a2a] p-6 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
            <h2 className="mb-4 text-lg font-medium text-slate-900 dark:text-[#e6eef6]">
              Jobs for Vehicle
            </h2>

            {jobsMap[activeVehicleId].length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No jobs found.
              </p>
            ) : (
              <ul className="space-y-3">
                {jobsMap[activeVehicleId].map((job, i) => (
                  <li
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 border border-transparent dark:border-slate-700"
                  >
                    <div>
                      <div className="font-medium text-slate-900 dark:text-[#e6eef6]">
                        {job.description}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Estimated Time: {job.estimatedTimeInMinutes || "--"}{" "}
                        mins
                      </div>
                    </div>

                    {/* Verification: Link only renders if job.file exists */}
                    {job.file ? (
                      <div className="mt-3 sm:mt-0">
                        <a
                          href={`http://localhost:5000/${job.file}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          View Job Card
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        No attachment
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
