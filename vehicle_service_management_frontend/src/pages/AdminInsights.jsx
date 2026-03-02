import { useEffect, useState } from "react";
import api from "../services/api";
import { PaperClipIcon } from "@heroicons/react/24/outline";
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

  const openJobs = async (vehicle) => {
    try {
      console.log("Vehicle clicked:", vehicle);

      const res = await api.get(`/vehicles/${vehicle._id}/jobs`);

      console.log("API response:", res);
      console.log("Response data:", res.data);

      setJobs(res.data || []);
      setSelectedVehicle(vehicle);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to load jobs");
    }
  };
  //table
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

  //filtering
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

  //fetch advisors for filter dropdown
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

      {/* Table */}
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg
                border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* HEADER */}
            <thead
              className="bg-gray-50 dark:bg-gray-800
                   text-gray-600 dark:text-gray-300
                   sticky top-0 z-10"
            >
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Vehicle</th>
                <th className="px-6 py-4 text-left font-semibold">Customer</th>
                <th className="px-6 py-4 text-left font-semibold">Service</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Idle</th>
                <th className="px-6 py-4 text-left font-semibold">Jobs</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {vehicles.map((v) => (
                <tr
                  key={v._id}
                  className="border-t border-gray-200 dark:border-gray-800
                       hover:bg-gray-50 dark:hover:bg-gray-800/60
                       transition"
                >
                  {/* Vehicle */}
                  <td className="px-6 py-4 font-mono font-semibold tracking-wide">
                    {v.vehicleNumber}
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4">{v.customerName}</td>

                  {/* Service Type */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium
                ${
                  v.serviceType === "ACCIDENT"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    : v.serviceType === "FREE_SERVICE"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                }`}
                    >
                      {v.serviceType.replace("_", " ")}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium
                ${
                  v.currentStatus === "In Service"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    : v.currentStatus === "Ready"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
                    >
                      {v.currentStatus}
                    </span>
                  </td>

                  {/* Idle Time */}
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

                  {/* Jobs Button */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openJobs(v)}
                      className="inline-flex items-center gap-2
                           px-4 py-1.5 rounded-lg
                           bg-blue-600 text-white
                           hover:bg-blue-700
                           shadow-sm hover:shadow
                           transition"
                    >
                      View Jobs
                      <span className="bg-white/20 px-2 rounded">
                        {v.jobCount}
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center
                  bg-black/50 backdrop-blur-sm p-4"
        >
          <div
            className="w-full max-w-2xl
                    bg-white dark:bg-gray-900
                    text-gray-800 dark:text-gray-100
                    rounded-2xl shadow-2xl
                    border border-gray-200 dark:border-gray-700
                    overflow-hidden"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between
                      px-6 py-4
                      border-b border-gray-200 dark:border-gray-700"
            >
              <div>
                <h3 className="text-xl font-semibold">Job Cards</h3>
                <p className="text-sm text-gray-500">
                  Vehicle — {selectedVehicle?.vehicleNumber}
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
              {jobs.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  No jobs found for this vehicle
                </div>
              ) : (
                jobs.map((job, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl
                         bg-gray-50 dark:bg-gray-800
                         border border-gray-200 dark:border-gray-700
                         hover:shadow-md transition"
                  >
                    {/* Top Row */}
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

                      {/* File Icon */}
                      {job.file && (
                        <a
                          href={`http://localhost:5000/${job.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0
                               p-2 rounded-lg
                               bg-gray-200 dark:bg-gray-700
                               hover:bg-blue-100 dark:hover:bg-blue-900
                               transition"
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

            {/* Footer */}
            <div
              className="px-6 py-4 border-t
                      border-gray-200 dark:border-gray-700
                      bg-gray-50 dark:bg-gray-800/50"
            >
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 rounded-lg
                     bg-blue-600 text-white
                     hover:bg-blue-700 transition
                     font-medium"
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
