import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
// Dasboard for admin

function Admin() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

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
      <div className="mx-auto max-w-6xl space-y-8">
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
      </div>
    </div>
  );
}

export default Admin;
