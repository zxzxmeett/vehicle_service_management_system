import { useEffect, useState } from "react";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";
import ThemeToggle from "../components/ThemeToggle";

function Advisor() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [jobData, setJobData] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const statuses = ["IN_SERVICE", "QC_PENDING", "READY_FOR_DELIVERY"];
  const reworkStatuses = ["REWORK_REQUESTED", "IN_REWORK", "REWORK_QC_PENDING"];

  const [details, setDetails] = useState({});

  const handleDetailChange = (vehicleId, e) => {
    setDetails((prev) => ({
      ...prev,
      [vehicleId]: {
        ...prev[vehicleId],
        [e.target.name]: e.target.value,
      },
    }));
  };

  const handleDetailCheckbox = (vehicleId, e) => {
    setDetails((prev) => ({
      ...prev,
      [vehicleId]: {
        ...prev[vehicleId],
        [e.target.name]: e.target.checked,
      },
    }));
  };
  const updateVehicleDetails = async (vehicleId) => {
    try {
      await api.patch(`/vehicles/${vehicleId}/details`, details[vehicleId]);
      setMessage("Details updated");
      setError("");
      fetchVehicles();
    } catch {
      setError("Failed to update details");
    }
  };
  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles/assigned");
      setVehicles(res.data);
    } catch (err) {
      setError("Failed to fetch vehicles");
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (vehicleId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setJobData((prev) => ({
        ...prev,
        [vehicleId]: { ...prev[vehicleId], file }, // Consistent key 'file'
      }));
    }
  };

  const addJob = async (vehicleId) => {
    const data = jobData[vehicleId];
    if (!data?.description) {
      setError("Job description required");
      return;
    }

    const formData = new FormData();
    formData.append("description", data.description);
    formData.append("estimatedTimeInMinutes", data.estimatedTimeInMinutes || 0);
    if (data.file) formData.append("jobFile", data.file); // Matches backend 'jobFile'

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

  const startRework = async (vehicleId) => {
    try {
      await api.patch(`/vehicles/${vehicleId}/start-rework`);
      fetchVehicles();
    } catch {
      setError("Failed to start rework");
    }
  };

  const sendReworkToQC = async (vehicleId) => {
    try {
      await api.patch(`/vehicles/${vehicleId}/rework-qc`);
      fetchVehicles();
    } catch {
      setError("Failed to send rework to QC");
    }
  };

  const completeRework = async (vehicleId) => {
    try {
      await api.patch(`/vehicles/${vehicleId}/rework-done`);
      fetchVehicles();
    } catch {
      setError("Failed to complete rework");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0a0f1c]">
      {/* ===== Sticky Top Bar ===== */}
      <header
        className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800
      bg-white/80 dark:bg-[#0f1626]/80 backdrop-blur"
      >
        <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              Advisor Console
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage assigned vehicles and service jobs
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* ===== Content ===== */}
      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Messages */}
        {(message || error) && (
          <div className="max-w-xl space-y-2">
            {message && (
              <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 px-4 py-2 text-sm text-green-700 dark:text-green-400">
                {message}
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
          </div>
        )}

        {/* ===== Main Grid ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ===== Vehicles Column ===== */}
          <div className="lg:col-span-3 space-y-6">
            {vehicles
              .filter((v) =>
                [
                  "CHECKED_IN",
                  "ADVISOR_ASSIGNED",
                  "IN_SERVICE",
                  "QC_PENDING",
                  "REWORK_REQUESTED",
                  "IN_REWORK",
                  "REWORK_QC_PENDING",
                ].includes(v.currentStatus),
              )
              .map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="rounded-xl bg-white dark:bg-[#121a2a] shadow-sm ring-1 ring-slate-200 dark:ring-[#243047] overflow-hidden"
                >
                  {/* ===== Header ===== */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {vehicle.vehicleNumber}
                      </h2>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {vehicle.vehicleBrand} {vehicle.vehicleModel}
                      </p>

                      <span
                        className="inline-block mt-2 rounded-full px-3 py-1 text-xs font-medium
        bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        {vehicle.currentStatus.replaceAll("_", " ")}
                      </span>
                      {vehicle.reworkReason && (
                        <p className="text-xs text-red-500 mt-1">
                          Rework Reason: {vehicle.reworkReason}
                        </p>
                      )}
                      {vehicle.reworkCount > 0 && (
                        <p className="text-xs text-orange-500 mt-1">
                          Rework #{vehicle.reworkCount}
                        </p>
                      )}
                    </div>

                    {/* ===== ACTIONS AREA ===== */}

                    <div className="flex items-center gap-2">
                      {/* Normal Flow Controls */}
                      {!reworkStatuses.includes(vehicle.currentStatus) && (
                        <>
                          <select
                            value={selectedStatus[vehicle._id] || ""}
                            onChange={(e) =>
                              setSelectedStatus((prev) => ({
                                ...prev,
                                [vehicle._id]: e.target.value,
                              }))
                            }
                            className="h-10 rounded-md border border-slate-300 dark:border-slate-700
                   bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white"
                          >
                            <option value="" disabled>
                              Update status
                            </option>
                            {statuses.map((s) => (
                              <option key={s} value={s}>
                                {s.replaceAll("_", " ")}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => updateStatus(vehicle._id)}
                            className="h-10 rounded-md bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-500"
                          >
                            Save
                          </button>
                        </>
                      )}

                      {/* 🔥 Rework Actions (ALWAYS checked separately) */}

                      {vehicle.currentStatus === "REWORK_REQUESTED" && (
                        <button
                          onClick={() => startRework(vehicle._id)}
                          className="h-10 rounded-md bg-orange-500 px-4 text-sm font-medium text-white hover:bg-orange-400"
                        >
                          Start Rework
                        </button>
                      )}

                      {vehicle.currentStatus === "IN_REWORK" && (
                        <button
                          onClick={() => sendReworkToQC(vehicle._id)}
                          className="h-10 rounded-md bg-purple-600 px-4 text-sm font-medium text-white hover:bg-purple-500"
                        >
                          Send to QC
                        </button>
                      )}

                      {vehicle.currentStatus === "REWORK_QC_PENDING" && (
                        <button
                          onClick={() => completeRework(vehicle._id)}
                          className="h-10 rounded-md bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-500"
                        >
                          Mark Rework Done
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ===== DETAILS SECTION ===== */}
                  <div className="px-6 py-5 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      Vehicle Details
                    </h3>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {/* Priority */}
                      <select
                        name="priority"
                        value={details[vehicle._id]?.priority || "NORMAL"}
                        onChange={(e) => handleDetailChange(vehicle._id, e)}
                        className="h-10 rounded-md border border-slate-300 dark:border-slate-700
                   bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white"
                      >
                        <option value="LOW">Low</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">High</option>
                        <option value="EMERGENCY">Emergency</option>
                      </select>

                      {/* Estimated Cost */}
                      <input
                        type="number"
                        name="estimatedCost"
                        placeholder="Estimated cost"
                        value={details[vehicle._id]?.estimatedCost || ""}
                        onChange={(e) => handleDetailChange(vehicle._id, e)}
                        className="h-10 rounded-md border border-slate-300 dark:border-slate-700
                   bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white"
                      />

                      {/* Insurance */}
                      <label className="flex items-center gap-2 text-sm text-slate-900 dark:text-white">
                        <input
                          type="checkbox"
                          name="isInsuranceJob"
                          checked={
                            details[vehicle._id]?.isInsuranceJob || false
                          }
                          onChange={(e) => handleDetailCheckbox(vehicle._id, e)}
                        />
                        Insurance Job
                      </label>

                      {/* Save Button */}
                      <button
                        onClick={() => updateVehicleDetails(vehicle._id)}
                        className="sm:col-span-3 h-10 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-500"
                      >
                        Save Details
                      </button>
                    </div>
                  </div>

                  {/* ===== JOBS SECTION ===== */}
                  <div className="px-6 py-5 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Jobs
                    </h3>

                    {/* Jobs List */}
                    <div className="space-y-3">
                      {vehicle.jobs?.map((job, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-slate-200 dark:border-slate-800
                   bg-slate-50 dark:bg-slate-900/40 p-3 text-sm"
                        >
                          <div className="font-medium text-slate-900 dark:text-white">
                            {job.description}
                          </div>

                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Estimated: {job.estimatedTimeInMinutes} min
                          </div>

                          {job.file && (
                            <a
                              href={`http://localhost:5000/${job.file}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 dark:text-blue-400 text-xs underline"
                            >
                              View Job Card
                            </a>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Job Inputs */}
                    <div className="grid gap-3 sm:grid-cols-3">
                      <input
                        name="description"
                        placeholder="Job description"
                        value={jobData[vehicle._id]?.description || ""}
                        onChange={(e) => handleJobChange(vehicle._id, e)}
                        className="h-10 rounded-md border border-slate-300 dark:border-slate-700
                 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white"
                      />

                      <input
                        name="estimatedTimeInMinutes"
                        placeholder="Time (min)"
                        value={
                          jobData[vehicle._id]?.estimatedTimeInMinutes || ""
                        }
                        onChange={(e) => handleJobChange(vehicle._id, e)}
                        className="h-10 rounded-md border border-slate-300 dark:border-slate-700
                 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white"
                      />

                      <button
                        type="button"
                        onClick={() => addJob(vehicle._id)}
                        className="h-10 rounded-md bg-slate-900 dark:bg-slate-700 text-sm text-white"
                      >
                        Add Job
                      </button>
                    </div>

                    {/* Drag & Drop Upload (RESTORED) */}
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={(e) => handleDrop(vehicle._id, e)}
                      className={`flex flex-col items-center justify-center rounded-md
      border-2 border-dashed p-5 text-sm transition
      ${
        dragActive
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
          : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30"
      }`}
                    >
                      <input
                        type="file"
                        name="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleJobChange(vehicle._id, e)}
                        className="hidden"
                        id={`file-${vehicle._id}`}
                      />

                      <label
                        htmlFor={`file-${vehicle._id}`}
                        className="cursor-pointer text-center"
                      >
                        <span className="font-medium text-slate-900 dark:text-white">
                          Drag & drop job card here
                        </span>
                        <br />
                        <span className="text-slate-500 dark:text-slate-400">
                          or click to upload
                        </span>
                      </label>

                      {jobData[vehicle._id]?.file && (
                        <p className="mt-2 text-xs text-green-600 font-medium">
                          Selected: {jobData[vehicle._id].file.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* ===== Guidelines Panel ===== */}
          <aside
            className="lg:col-span-1 h-fit sticky top-20 rounded-xl bg-white dark:bg-[#121a2a]
          p-6 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]"
          >
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Advisor Guidelines
            </h3>

            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>Update status as work progresses</li>
              <li>Add all jobs before QC stage</li>
              <li>Include estimated time</li>
              <li>Upload job cards when required</li>
            </ul>
          </aside>
        </div>
      </main>
    </div>
  );
}
export default Advisor;
