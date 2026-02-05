import { useEffect, useState } from "react";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";

function Advisor() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [jobData, setJobData] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

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
    if (data.file) formData.append("jobFile", data.file);

    try {
      await api.post(`/vehicles/${vehicleId}/jobs`, formData);
      setMessage("Job added successfully");
      setError("");

      setJobData((prev) => ({ ...prev, [vehicleId]: {} }));
      fetchVehicles();
    } catch {
      setError("Failed to add job");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-slate-200 px-6 pt-10 pb-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {" "}
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Advisor Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Manage assigned vehicles and jobs
            </p>
          </div>
          <LogoutButton />
        </div>
        {/* Messages */}
        {(message || error) && (
          <div className="mb-6 max-w-xl space-y-2">
            {message && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
                {message}
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        )}
        {vehicles.length === 0 && (
          <p className="text-sm text-slate-500">No vehicles assigned.</p>
        )}
        {/* Layout */}
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          {/* LEFT: Vehicles */}
          <div className="lg:col-span-2 space-y-6">
            {vehicles
              .filter((v) => v.currentStatus !== "DELIVERED")
              .map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
                >
                  {/* Vehicle Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="text-base font-semibold text-slate-900">
                        {vehicle.vehicleNumber}
                      </div>
                      <div className="text-sm text-slate-500">
                        {vehicle.vehicleModel}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        Status:{" "}
                        <span className="font-medium text-slate-900">
                          {vehicle.currentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedStatus[vehicle._id] || ""}
                        onChange={(e) =>
                          setSelectedStatus((prev) => ({
                            ...prev,
                            [vehicle._id]: e.target.value,
                          }))
                        }
                        className="h-10 w-[160px] rounded-md border border-slate-300 bg-white px-4 pr-10 text-sm text-slate-900 appearance-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                      >
                        <option value="" disabled>
                          Update status
                        </option>
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => updateStatus(vehicle._id)}
                        className="h-9 rounded-md px-4 text-sm font-medium text-white
             bg-slate-900 hover:bg-slate-800 transition"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Jobs */}
                  <div className="space-y-2">
                    {vehicle.jobs?.length === 0 && (
                      <p className="text-sm text-slate-500">
                        No jobs added yet.
                      </p>
                    )}

                    {vehicle.jobs?.map((job, index) => (
                      <div
                        key={index}
                        className="rounded-md bg-slate-50 p-3 text-sm"
                      >
                        <span className="font-medium text-slate-900">
                          {job.description}
                        </span>
                        <span className="ml-2 text-slate-500">
                          ({job.estimatedTimeInMinutes} min)
                        </span>

                        {job.file && (
                          <div className="mt-1">
                            <a
                              href={`http://localhost:5000/${job.file}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-700 underline hover:text-slate-900"
                            >
                              View Job Card
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Job (compact) */}
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <input
                      name="description"
                      placeholder="Job description"
                      value={jobData[vehicle._id]?.description || ""}
                      onChange={(e) => handleJobChange(vehicle._id, e)}
                      className="h-9 rounded-md border border-slate-300 px-2 text-sm
                             focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                    />

                    <input
                      name="estimatedTimeInMinutes"
                      placeholder="Time (min)"
                      value={jobData[vehicle._id]?.estimatedTimeInMinutes || ""}
                      onChange={(e) => handleJobChange(vehicle._id, e)}
                      className="h-9 rounded-md border border-slate-300 px-2 text-sm
                             focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                    />

                    <button
                      onClick={() => addJob(vehicle._id)}
                      className="h-9 rounded-md bg-slate-900 text-sm text-white
                             transition hover:bg-slate-800"
                    >
                      Add Job
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* RIGHT: Guidelines (once) */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Advisor Guidelines
            </h3>

            <ul className="space-y-2 text-sm text-slate-600">
              <li>• Update vehicle status as work progresses</li>
              <li>• Add all service jobs before QC</li>
              <li>• Include estimated time for each job</li>
              <li>• Upload job cards when required</li>
              <li>• Delivered vehicles disappear automatically</li>
            </ul>

            <div className="mt-6 rounded-md bg-slate-50 p-4 text-sm text-slate-600">
              <strong className="block text-slate-800 mb-1">
                Workflow Tip
              </strong>
              Keep job descriptions short and precise for faster approvals.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Advisor;
