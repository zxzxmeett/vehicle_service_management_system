import { useEffect, useState } from "react";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

function Reception() {
  const [vehicles, setVehicles] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /* ================= FETCH DATA ================= */

  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles?status=CHECKED_IN");
      setVehicles(res.data);
    } catch {
      setError("Failed to fetch vehicles");
    }
  };

  const fetchAdvisors = async () => {
    try {
      const res = await api.get("/users?role=ADVISOR");
      setAdvisors(res.data);
    } catch {
      setError("Failed to fetch advisors");
    }
  };

  //initial loading, runs when page loads, reception immediately sees... 
  useEffect(() => {
    fetchVehicles();
    fetchAdvisors();
  }, []);

  /* ================= ASSIGN ADVISOR ================= */

  const assignAdvisor = async (vehicleId) => {
    if (!selectedAdvisor) {
      setError("Please select an advisor first");
      return;
    }

    try {
      await api.patch(`/vehicles/${vehicleId}/assign-advisor`, {
        advisorId: selectedAdvisor,
      });

      setMessage("Advisor assigned successfully");
      setError("");
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || "Assignment failed");
    }
  };

  /* ================= UI ================= */

return (
    <div className="min-h-screen bg-slate-200 dark:bg-[#0a0f1c] px-6 pt-10 pb-8 transition-colors duration-300">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#e6eef6]">
              Reception Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#9fb0c3]">
              Assign advisors to checked-in vehicles
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>

        {/* Messages */}
        {(message || error) && (
          <div className="mb-6 max-w-xl space-y-2">
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

        <div className="mx-auto max-w-5xl space-y-8">
          {/* Advisor selection */}
          <div className="rounded-xl bg-white dark:bg-[#121a2a] p-6 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
            <h2 className="mb-1 text-lg font-medium text-slate-900 dark:text-[#e6eef6]">
              Select Advisor
            </h2>
            <p className="mb-4 text-sm text-slate-500 dark:text-[#9fb0c3]">
              Choose an advisor before assigning vehicles
            </p>

            <select
              value={selectedAdvisor}
              onChange={(e) => setSelectedAdvisor(e.target.value)}
              className="h-11 w-full max-w-sm rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-slate-900 dark:text-white transition
                     focus:border-slate-900 dark:focus:border-blue-500 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
            >
              <option value="">Choose advisor</option>
              {advisors.map((advisor) => (
                <option key={advisor._id} value={advisor._id}>
                  {advisor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicles list */}
          <div className="rounded-xl bg-white dark:bg-[#121a2a] p-6 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
            <h2 className="mb-4 text-lg font-medium text-slate-900 dark:text-[#e6eef6]">
              Checked-in Vehicles
            </h2>

            {vehicles.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No vehicles waiting for assignment.
              </p>
            )}

            {vehicles.length > 0 && (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle._id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-[#e6eef6]">
                        {vehicle.vehicleNumber}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-[#9fb0c3]">
                        {vehicle.vehicleModel}
                      </p>
                    </div>

                    <button
                      onClick={() => assignAdvisor(vehicle._id)}
                      className="h-9 rounded-md bg-slate-900 dark:bg-blue-600 px-4 text-sm font-medium text-white
                             transition hover:bg-slate-800 dark:hover:bg-blue-500 active:scale-[0.99]"
                    >
                      Assign Advisor
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div>
            <button
              onClick={() => navigate("/reception/delivery")}
              className="rounded-md border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm
                     text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Go to Delivery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reception;
