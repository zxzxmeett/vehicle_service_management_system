import { useEffect, useState } from "react";
import api from "../services/api";
import { PaperClipIcon } from "@heroicons/react/24/outline";

function VehicleInsights() {
  const [vehicles, setVehicles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  return (
    <div className="p-6 text-gray-800 dark:text-gray-100">
      <h2 className="text-2xl font-semibold mb-6">
        Vehicle Service Insights — Last 30 Days
      </h2>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left">Vehicle</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Service</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Idle</th>
              <th className="px-4 py-3 text-left">Jobs</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.map((v) => (
              <tr
                key={v._id}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60"
              >
                <td className="px-4 py-3 font-medium">{v.vehicleNumber}</td>
                <td className="px-4 py-3">{v.customerName}</td>
                <td className="px-4 py-3">{v.serviceType}</td>
                <td className="px-4 py-3">{v.status}</td>
                <td className="px-4 py-3">{v.idleTime ?? "-"}</td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => openJobs(v)}
                    className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    View Jobs ({v.jobCount})
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center
                  bg-black/50 backdrop-blur-sm p-4">

    <div className="w-full max-w-2xl
                    bg-white dark:bg-gray-900
                    text-gray-800 dark:text-gray-100
                    rounded-2xl shadow-2xl
                    border border-gray-200 dark:border-gray-700
                    overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between
                      px-6 py-4
                      border-b border-gray-200 dark:border-gray-700">

        <div>
          <h3 className="text-xl font-semibold">
            Job Cards
          </h3>
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
                  <p className="font-semibold">
                    {job.description}
                  </p>

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
      <div className="px-6 py-4 border-t
                      border-gray-200 dark:border-gray-700
                      bg-gray-50 dark:bg-gray-800/50">

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
