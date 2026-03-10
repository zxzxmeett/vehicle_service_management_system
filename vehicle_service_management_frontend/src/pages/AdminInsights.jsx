import { useEffect, useState } from "react";
import React from "react";
import api from "../services/api";
import {
  PaperClipIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import InsightsFilterBar from "../components/insightFilterbar";

function VehicleInsights() {
  const [vehicles, setVehicles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [advisorList, setAdvisorList] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);

  const openJobs = async (vehicle) => {
    try {
      const res = await api.get(`/vehicles/${vehicle._id}/jobs`);
      setJobs(res.data || []);
      setSelectedVehicle(vehicle);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to load jobs");
    }
  };

  const fetchVehicleInsights = async () => {
    try {
      const res = await api.get("/reports/vehicle-insights");
      setVehicles(res.data);
    } catch (err) {
      setError("Failed to load vehicle insights");
    }
  };

  useEffect(() => {
    fetchVehicleInsights();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/vehicles/vehicle-insights?${params}`);
      setVehicles(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch insights", err);
      setError("Failed to fetch insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [filters]);

  const fetchAdvisors = async () => {
    try {
      const res = await api.get("/users?role=ADVISOR");
      setAdvisorList(res.data || []);
    } catch (err) {
      console.error("Failed to load advisors", err);
    }
  };

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const toggleRow = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  // ─── CHANGE 1: Helper badge components ───────────────────────────────────────
  // Defined outside the main component so React doesn't recreate them on
  // every render. They're pure display — just take a prop and return a styled span.

  // PENDING → red, PARTIAL → amber, PAID → green
  function PaymentBadge({ status }) {
    const styles = {
      PAID: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
      PARTIAL:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      PENDING: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.PENDING}`}
      >
        {status || "PENDING"}
      </span>
    );
  }

  // LOW → gray, NORMAL → blue, HIGH → orange, EMERGENCY → red
  function PriorityBadge({ priority }) {
    const styles = {
      LOW: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
      NORMAL:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
      HIGH: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300",
      EMERGENCY: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[priority] || styles.NORMAL}`}
      >
        {priority || "NORMAL"}
      </span>
    );
  }

  // ─── CHANGE 2: Status timeline component ─────────────────────────────────────
  // Takes statusHistory array (from DB) and renders each stage as a
  // vertical dotted timeline sorted oldest → newest.
  // entry.status and entry.timestamp come directly from statusHistorySchema.
  function StatusTimeline({ history }) {
    if (!history || history.length === 0) {
      return (
        <p className="text-sm text-gray-400">No status history available.</p>
      );
    }

    const sorted = [...history].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    );

    return (
      <ol className="relative border-l border-gray-300 dark:border-gray-600 ml-2 space-y-4">
        {sorted.map((entry, i) => (
          <li key={i} className="ml-4">
            <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900" />
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
              {entry.status.replace(/_/g, " ")}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(entry.timestamp).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="p-6 text-gray-800 dark:text-gray-100">
      <h2 className="text-2xl font-semibold mb-6">
        Vehicle Service Insights — Last 30 Days
      </h2>

      <InsightsFilterBar
        filters={filters}
        onChange={setFilters}
        advisors={advisorList}
      />

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* ─── CHANGE 3: Added Payment and Priority columns to header ─── */}
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Vehicle</th>
                <th className="px-6 py-4 text-left font-semibold">Customer</th>
                <th className="px-6 py-4 text-left font-semibold">Service</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Payment</th>
                <th className="px-6 py-4 text-left font-semibold">Priority</th>
                <th className="px-6 py-4 text-left font-semibold">Idle</th>
                <th className="px-6 py-4 text-left font-semibold">Jobs</th>
                <th className="px-6 py-4 text-left font-semibold">Details</th>
              </tr>
            </thead>

            <tbody>
              {vehicles.map((v) => (
                // key must go on React.Fragment when using the explicit syntax
                // (<> shorthand doesn't support key prop)
                <React.Fragment key={v._id}>
                  {/* ── Main row ── */}
                  <tr className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition">
                    <td className="px-6 py-4 font-mono font-semibold tracking-wide">
                      {v.vehicleNumber}
                    </td>

                    <td className="px-6 py-4">{v.customerName}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          v.serviceType === "ACCIDENT"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                            : v.serviceType === "FREE_SERVICE"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        }`}
                      >
                        {v.serviceType.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          v.currentStatus === "IN_SERVICE"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                            : v.currentStatus === "READY_FOR_DELIVERY"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {v.currentStatus?.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* ─── CHANGE 4: paymentStatus now in main row ─── */}
                    <td className="px-6 py-4">
                      <PaymentBadge status={v.paymentStatus} />
                    </td>

                    {/* ─── CHANGE 5: priority now in main row ─── */}
                    <td className="px-6 py-4">
                      <PriorityBadge priority={v.priority} />
                    </td>

                    <td className="px-6 py-4 font-medium">
                      {v.idleHours ? (
                        <span
                          className={
                            parseFloat(v.idleHours) > 72
                              ? "text-red-500 font-semibold"
                              : parseFloat(v.idleHours) > 48
                                ? "text-amber-500"
                                : "text-gray-700 dark:text-gray-300"
                          }
                        >
                          {v.idleHours}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => openJobs(v)}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow transition"
                      >
                        View Jobs
                        <span className="bg-white/20 px-2 rounded">
                          {v.jobCount}
                        </span>
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleRow(v._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-xs font-medium"
                      >
                        {expandedRow === v._id ? (
                          <>
                            {" "}
                            Hide <ChevronUpIcon className="w-3.5 h-3.5" />{" "}
                          </>
                        ) : (
                          <>
                            {" "}
                            Details{" "}
                            <ChevronDownIcon className="w-3.5 h-3.5" />{" "}
                          </>
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* ─── CHANGE 6: Expanded row — timings only ───────────────
                      Left side: check-in time, delivery time, rework info, insurance flag.
                      Right side: full statusHistory rendered as a vertical timeline.
                      paymentStatus is gone from here — it's in the main row now.
                      colSpan={9} because we now have 9 columns total. */}
                  {expandedRow === v._id && (
                    <tr className="bg-gray-50 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-700">
                      <td colSpan={9} className="px-8 py-5">
                        <div className="flex flex-wrap gap-10">
                          {/* Left: summary cards */}
                          <div className="flex flex-col gap-3 min-w-[180px]">
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                Check-in
                              </p>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                {v.checkInTime
                                  ? new Date(v.checkInTime).toLocaleString(
                                      "en-IN",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )
                                  : "—"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                Delivered
                              </p>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                {v.deliveryTime
                                  ? new Date(v.deliveryTime).toLocaleString(
                                      "en-IN",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )
                                  : "Not yet delivered"}
                              </p>
                            </div>

                            {/* Only show rework section if reworkCount > 0 */}
                            {v.reworkCount > 0 && (
                              <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                  Rework
                                </p>
                                <p className="text-sm font-medium text-red-500">
                                  {v.reworkCount}x
                                  {v.lastReworkAt && (
                                    <span className="text-gray-400 ml-1 text-xs">
                                      (last:{" "}
                                      {new Date(
                                        v.lastReworkAt,
                                      ).toLocaleDateString("en-IN")}
                                      )
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}

                            {/* Only show insurance badge if true */}
                            {v.isInsuranceJob && (
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 w-fit">
                                Insurance Job
                              </span>
                            )}
                          </div>

                          {/* Right: stage timeline */}
                          <div className="flex-1 min-w-[220px]">
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
                              Stage Timeline
                            </p>
                            <StatusTimeline history={v.statusHistory} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal — unchanged */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-semibold">Job Cards</h3>
                <p className="text-sm text-gray-500">
                  Vehicle — {selectedVehicle?.vehicleNumber}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
              {jobs.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  No jobs found for this vehicle
                </div>
              ) : (
                jobs.map((job, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{job.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Estimated: {job.estimatedTimeInMinutes} min
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Added: {new Date(job.addedAt).toLocaleString()}
                        </p>
                      </div>
                      {job.file && (
                        <a
                          href={`http://localhost:5000/${job.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                          title="Open attachment"
                        >
                          <PaperClipIcon className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehicleInsights;
