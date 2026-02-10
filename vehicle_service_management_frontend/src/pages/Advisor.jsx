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

  const statuses = ["IN_SERVICE", "QC_PENDING", "READY_FOR_DELIVERY", "DELIVERED"];

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

  const updateStatus = async (vehicleId) => {
    if (!selectedStatus[vehicleId]) {
      setError("Please select a status");
      return;
    }
    try {
      await api.patch(`/vehicles/${vehicleId}/update-status`, { status: selectedStatus[vehicleId] });
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

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-[#0a0f1c] px-6 pt-10 pb-8 transition-colors duration-300">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#e6eef6]">Advisor Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-[#9fb0c3]">Manage assigned vehicles and jobs</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>

        {(message || error) && (
          <div className="mb-6 max-w-xl space-y-2">
            {message && <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 px-4 py-2 text-sm text-green-700 dark:text-green-400">{message}</div>}
            {error && <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-400">{error}</div>}
          </div>
        )}

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {vehicles.filter((v) => v.currentStatus !== "DELIVERED").map((vehicle) => (
              <div key={vehicle._id} className="rounded-xl bg-white dark:bg-[#121a2a] p-5 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold text-slate-900 dark:text-[#e6eef6]">{vehicle.vehicleNumber}</div>
                    <div className="text-sm text-slate-500 dark:text-[#9fb0c3]">{vehicle.vehicleModel}</div>
                    <div className="mt-1 text-sm text-slate-600 dark:text-[#9fb0c3]">Status: <span className="font-medium text-slate-900 dark:text-[#60a5fa]">{vehicle.currentStatus}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedStatus[vehicle._id] || ""}
                      onChange={(e) => setSelectedStatus((prev) => ({ ...prev, [vehicle._id]: e.target.value }))}
                      className="h-10 w-[160px] rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 pr-10 text-sm text-slate-900 dark:text-slate-100 appearance-none focus:outline-none"
                    >
                      <option value="" disabled>Update status</option>
                      {statuses.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
                    </select>
                    <button onClick={() => updateStatus(vehicle._id)} className="h-9 rounded-md px-4 text-sm font-medium text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 transition">Save</button>
                  </div>
                </div>

                <div className="space-y-2">
                  {vehicle.jobs?.map((job, index) => (
                    <div key={index} className="rounded-md bg-slate-50 dark:bg-slate-800/50 p-3 text-sm">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{job.description}</span>
                      <span className="ml-2 text-slate-500 dark:text-slate-400">({job.estimatedTimeInMinutes} min)</span>
                      {job.file && (
                        <div className="mt-1">
                          <a href={`http://localhost:5000/${job.file}`} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 underline">View Job Card</a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input name="description" placeholder="Job description" value={jobData[vehicle._id]?.description || ""} onChange={(e) => handleJobChange(vehicle._id, e)} className="h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none" />
                    <input name="estimatedTimeInMinutes" placeholder="Time (min)" value={jobData[vehicle._id]?.estimatedTimeInMinutes || ""} onChange={(e) => handleJobChange(vehicle._id, e)} className="h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none" />
                    <button onClick={() => addJob(vehicle._id)} className="h-9 rounded-md bg-slate-900 dark:bg-slate-700 text-sm text-white transition">Add Job</button>
                  </div>

                  <div
                    onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={(e) => handleDrop(vehicle._id, e)}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-4 text-sm transition ${dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30"}`}
                  >
                    <input type="file" name="file" accept="image/*,.pdf" onChange={(e) => handleJobChange(vehicle._id, e)} className="hidden" id={`file-${vehicle._id}`} />
                    <label htmlFor={`file-${vehicle._id}`} className="text-center cursor-pointer">
                      <span className="font-medium text-slate-900 dark:text-slate-200">Drag & drop job card here</span><br />
                      <span className="text-slate-500 dark:text-slate-400">or click to upload</span>
                    </label>
                    {jobData[vehicle._id]?.file && <p className="mt-2 text-xs text-green-600 font-medium">Selected: {jobData[vehicle._id].file.name}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-white dark:bg-[#121a2a] p-6 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047] h-fit">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-[#e6eef6]">Advisor Guidelines</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-[#9fb0c3]">
              <li>• Update vehicle status as work progresses</li>
              <li>• Add all service jobs before QC</li>
              <li>• Include estimated time for each job</li>
              <li>• Upload job cards when required</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Advisor;