import { useEffect, useState } from "react";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

function ReceptionDelivery() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles?status=READY_FOR_DELIVERY");
      setVehicles(res.data);
    } catch {
      setError("Failed to fetch delivered vehicles");
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const markDelivered = async (vehicleId) => {
    try {
      await api.patch(`/vehicles/${vehicleId}/deliver`);

      // remove from list after delivery
      setVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
    } catch {
      alert("Failed to deliver vehicle");
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-[#0a0f1c] px-6 pt-10 pb-8 transition-colors duration-300">
      <div className="mx-auto max-w-5xl space-y-8">
        {" "}
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#e6eef6]">
              Ready Vehicles
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#9fb0c3]">
              Finalize reception process for delivered vehicles
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/reception")}
              className="rounded-md border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm
                     text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Back to Reception
            </button>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
        {error && (
          <div className="mb-6 max-w-xl rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl bg-white dark:bg-[#121a2a] p-6 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
            <h2 className="mb-4 text-lg font-medium text-slate-900 dark:text-[#e6eef6]">
              Pending Completion
            </h2>

            {vehicles.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No delivered vehicles pending completion.
              </p>
            )}

            {vehicles.length > 0 && (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {vehicles.map((v) => (
                  <div
                    key={v._id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-[#e6eef6]">
                        {v.vehicleNumber}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-[#9fb0c3]">
                        {v.customerName}
                      </p>
                    </div>

                    <button
                      onClick={() => markDelivered(v._id)}
                      className="h-9 rounded-md bg-green-600 px-4 text-sm font-medium
                      text-white transition hover:bg-green-500 active:scale-[0.99]"
                    >
                      Deliver Vehicle
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceptionDelivery;
