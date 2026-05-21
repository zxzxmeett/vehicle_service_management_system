import { useEffect, useState } from "react";
import api from "../services/api";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ResponsiveContainer } from "recharts";
import { toast } from "react-toastify";
// Dasboard for admin

function Admin() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

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
      (v) =>
        normalize(v.currentStatus) === STATUS.IN_SERVICE ||
        normalize(v.currentStatus) === "QC_PENDING",
    ).length ?? 0;

  const readyCount =
    report?.vehicles?.filter((v) => normalize(v.currentStatus) === STATUS.READY)
      .length ?? 0;

  const deliveredCount =
    report?.vehicles?.filter(
      (v) => normalize(v.currentStatus) === STATUS.DELIVERD,
    ).length ?? 0;

  //monthly summary report
  useEffect(() => {
    const fetchSummary = async () => {
      const res = await api.get("/reports/summary?range=30d");
      setSummary(res.data);
    };

    fetchSummary();
  }, []);

  useEffect(() => {
  const toastId = "dashboard-loading";

  if (!report && !error && !toast.isActive(toastId)) {
    toast.info("Loading report...", {
      toastId,
      autoClose: 2000,
      theme: "colored",
    });
  }
}, [report, error]);

  if (!summary) return null;

  const statusData = summary.statusCounts.map((item) => ({
    name: item._id,
    value: item.count,
  }));

  const serviceData = summary.serviceTypeCounts.map((item) => ({
    name:
      item._id === "FREE_SERVICE"
        ? "Free"
        : item._id === "PAID_SERVICE"
          ? "Paid"
          : item._id === "ACCIDENT"
            ? "Accident"
            : item._id,
    count: item.count,
  }));

  //KPI
  const paid = summary.paymentCounts.find((p) => p._id === "PAID")?.count || 0;
  const totalPayments = summary.paymentCounts.reduce(
    (sum, p) => sum + p.count,
    0,
  );
  const paidPercent = totalPayments
    ? Math.round((paid / totalPayments) * 100)
    : 0;
  return (
    <div className="min-h-screen bg-slate-200 dark:bg-[#0a0f1c] px-6 pt-1 pb-8 transition-colors duration-300">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#e6eef6]">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#9fb0c3]">
              Overview of today’s operations
            </p>
          </div>
        </div> */}

        {/* Error / Loading */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Summary Card */}
        {report && (
          <div className="mb-3 rounded-xl bg-white dark:bg-[#121a2a] p-6 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
            <h2 className="mb-1 text-lg font-medium text-slate-900 dark:text-[#e6eef6]">
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

      {/* ===== Monthly KPI Cards ===== */}
      <div className="mx-auto max-w-6xl space-y-4">
        <h2 className="text-xl my-3 font-semibold text-slate-900 dark:text-[#e6eef6]">
          Last 30 Days — Key Metrics
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Vehicles */}
          <div className="rounded-xl bg-white dark:bg-[#121a2a] p-5 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
            <div className="text-2xl font-semibold text-slate-900 dark:text-white">
              {summary.totals.totalVehicles}
            </div>
            <div className="text-sm text-slate-500 dark:text-[#9fb0c3]">
              Vehicles This Month
            </div>
          </div>

          {/* Revenue */}
          <div className="rounded-xl bg-white dark:bg-[#121a2a] p-5 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
            <div className="text-2xl font-semibold text-slate-900 dark:text-white">
              ₹{summary.totals.totalEstimatedRevenue?.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500 dark:text-[#9fb0c3]">
              Estimated Revenue
            </div>
          </div>

          {/* Insurance Jobs */}
          <div className="rounded-xl bg-white dark:bg-[#121a2a] p-5 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
            <div className="text-2xl font-semibold text-slate-900 dark:text-white">
              {summary.totals.insuranceJobs}
            </div>
            <div className="text-sm text-slate-500 dark:text-[#9fb0c3]">
              Insurance Jobs
            </div>
          </div>

          {/* Paid Percentage */}
          <div className="rounded-xl bg-white dark:bg-[#121a2a] p-5 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
            <div className="text-2xl font-semibold text-green-600">
              {paidPercent}%
            </div>
            <div className="text-sm text-slate-500 dark:text-[#9fb0c3]">
              Payments Collected
            </div>
          </div>
        </div>
      </div>

      {/* ===== 30 Days Analytics ===== */}
      <div className="mx-auto max-w-6xl my-10 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Status Donut Card */}
          <div className="rounded-xl bg-white dark:bg-[#121a2a] p-5 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
            <h3 className="mb-4 text-sm font-medium text-slate-600 dark:text-[#9fb0c3]">
              Vehicle Status Distribution
            </h3>

            <div className="h-72 w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    labelLine={false}
                    label={({ percent }) =>
                      percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
                    }
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          [
                            "#3b82f6",
                            "#10b981",
                            "#f59e0b",
                            "#ef4444",
                            "#8b5cf6",
                          ][index % 5]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Service Type Bar Card */}
          <div className="rounded-xl bg-white dark:bg-[#121a2a] p-5 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
            <h3 className="mb-4 text-sm font-medium text-slate-600 dark:text-[#9fb0c3]">
              Service Type Distribution
            </h3>

            <div className="flex justify-center">
              <BarChart width={360} height={260} data={serviceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
