import { useEffect, useState } from "react";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

function ReceptionDelivery() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");
  const [paymentSelection, setPaymentSelection] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      const [readyRes, reworkRes] = await Promise.all([
        api.get("/vehicles?status=READY_FOR_DELIVERY"),
        api.get("/vehicles?status=REWORK_DONE"),
      ]);

      setVehicles([...readyRes.data, ...reworkRes.data]);
    } catch {
      setError("Failed to fetch vehicles");
    }
  };

  const handlePaymentChange = (vehicleId, value) => {
    setPaymentSelection((prev) => ({
      ...prev,
      [vehicleId]: value,
    }));
  };

  const updatePaymentStatus = async (vehicleId) => {
    const selected = paymentSelection[vehicleId];

    if (!selected) {
      setError("Please select payment status");
      return;
    }

    try {
      await api.patch(`/vehicles/${vehicleId}/payment`, {
        paymentStatus: selected,
      });

      setMessage("Payment status updated");
      setError("");

      // Wrap refresh separately
      try {
        await fetchVehicles();
      } catch {
        console.warn("Refresh failed, but update succeeded");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update payment status",
      );
    }
  };

  const sendForRework = async (vehicleId) => {
    const reason = prompt("Enter reason for rework:");

    if (!reason) return;

    try {
      await api.patch(`/vehicles/${vehicleId}/request-rework`, {
        reason,
      });

      setVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
    } catch {
      alert("Failed to request rework");
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
      <div className="mx-auto max-w-6xl space-y-8">
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
        {message && (
          <div
            className="mb-6 max-w-xl rounded-lg border border-green-200 bg-green-50
                  dark:bg-green-900/20 dark:border-green-800 px-4 py-2 text-sm
                  text-green-700 dark:text-green-400"
          >
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 max-w-xl rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        <div className="mx-auto max-w-6xl">
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

                      {/* Rework Count */}
                      {v.reworkCount > 0 && (
                        <p className="text-xs text-orange-500 mt-1">
                          Rework #{v.reworkCount}
                        </p>
                      )}

                      {/* Rework Reason */}
                      {v.reworkReason && (
                        <p className="text-xs text-red-500 mt-1">
                          Reason: {v.reworkReason}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-start gap-2">
                      {/* ===== Buttons Row ===== */}
                      <div className="flex gap-2">
                        <select
                          value={
                            paymentSelection[v._id] ||
                            v.paymentStatus ||
                            "PENDING"
                          }
                          onChange={(e) =>
                            handlePaymentChange(v._id, e.target.value)
                          }
                          className="h-10 rounded-md border border-slate-300 dark:border-slate-700
                 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PARTIAL">Partial</option>
                          <option value="PAID">Paid</option>
                        </select>

                        <button
                          onClick={() => updatePaymentStatus(v._id)}
                          className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500"
                        >
                          Update
                        </button>

                        <button
                          onClick={() => markDelivered(v._id)}
                          disabled={
                            (v.paymentStatus || paymentSelection[v._id]) !==
                            "PAID"
                          }
                          className={`h-10 rounded-md px-4 text-sm font-medium text-white transition
                                      ${
                                      (v.paymentStatus || paymentSelection[v._id]) === "PAID"
                                       ? "bg-green-600 hover:bg-green-500"
                                        : "bg-gray-400 cursor-not-allowed"
                                         }`}
                        >
                          Deliver
                        </button>

                        {(v.currentStatus === "READY_FOR_DELIVERY" ||
                          v.currentStatus === "REWORK_DONE") && (
                          <button
                            onClick={() => sendForRework(v._id)}
                            className="h-10 rounded-md bg-yellow-500 px-4 text-sm font-medium text-white hover:bg-yellow-400"
                          >
                            Rework
                          </button>
                        )}
                      </div>

                      {/* ===== Status UNDER Buttons ===== */}
                      <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        <div>
                          Status:{" "}
                          <span className="font-medium text-slate-900 dark:text-white">
                            {v.currentStatus.replaceAll("_", " ")}
                          </span>
                        </div>

                        <div>
                          Payment:{" "}
                          <span className="font-medium text-slate-900 dark:text-white">
                            {v.paymentStatus || "PENDING"}
                          </span>
                        </div>
                      </div>
                    </div>
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
