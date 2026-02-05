import { useEffect, useState } from "react";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";
import { useNavigate } from "react-router-dom";

function ReceptionDelivery() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      const res = await api.get(
        "/vehicles?status=DELIVERED&isReceptionCompleted=false",
      );
      setVehicles(res.data);
    } catch {
      setError("Failed to fetch delivered vehicles");
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const markDone = async (vehicleId) => {
    try {
      await api.patch(`/vehicles/${vehicleId}/reception-done`);
      setVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
    } catch {
      alert("Failed to mark vehicle as done");
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 px-6 pt-10 pb-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {" "}
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Delivered Vehicles
            </h1>
            <p className="text-sm text-slate-500">
              Finalize reception process for delivered vehicles
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/reception")}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm
                     text-slate-700 transition hover:bg-slate-200"
            >
              Back to Reception
            </button>
            <LogoutButton />
          </div>
        </div>
        {error && (
          <div className="mb-6 max-w-xl rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 text-lg font-medium text-slate-900">
              Pending Completion
            </h2>

            {vehicles.length === 0 && (
              <p className="text-sm text-slate-500">
                No delivered vehicles pending completion.
              </p>
            )}

            {vehicles.length > 0 && (
              <div className="divide-y divide-slate-200">
                {vehicles.map((v) => (
                  <div
                    key={v._id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {v.vehicleNumber}
                      </p>
                      <p className="text-sm text-slate-500">{v.customerName}</p>
                    </div>

                    <button
                      onClick={() => markDone(v._id)}
                      className="h-9 rounded-md bg-slate-900 px-4 text-sm font-medium
                             text-white transition hover:bg-slate-800 active:scale-[0.99]"
                    >
                      Mark as Completed
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
