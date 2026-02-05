import { useState } from "react";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";

function Security() {
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    vehicleNumber: "",
    vehicleModel: "",
  });

  const [checkInTime, setCheckInTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/vehicles/checkin", {
        ...formData,
        checkInTime,
      });

      setMessage("Vehicle checked in successfully");

      setFormData({
        customerName: "",
        phone: "",
        vehicleNumber: "",
        vehicleModel: "",
      });

      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setCheckInTime(now.toISOString().slice(0, 16));
    } catch (err) {
      setError(err.response?.data?.message || "Check-in failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Security Dashboard
          </h1>
          <p className="text-sm text-slate-500">Register incoming vehicles</p>
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

      {/* Layout */}
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
        {/* Form Card */}
        <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-1 text-lg font-medium text-slate-900">
            Vehicle Check-In
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            Enter customer and vehicle details
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Customer Name
              </label>
              <input
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-md border border-slate-300 px-3 transition
                         focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-md border border-slate-300 px-3 transition
                         focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Vehicle Number
                </label>
                <input
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-md border border-slate-300 px-3 transition
                           focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Vehicle Model
                </label>
                <input
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-md border border-slate-300 px-3 transition
                           focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Check-in Date & Time
              </label>
              <input
                type="datetime-local"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 px-3 transition
                         focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 h-11 w-full rounded-md bg-slate-900 text-white
                       transition hover:bg-slate-800 active:scale-[0.99]"
            >
              Check In Vehicle
            </button>
          </form>
        </div>

        {/* Info Panel */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Check-In Guidelines
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Verify vehicle number carefully</li>
            <li>• Confirm phone number with customer</li>
            <li>• Default time is auto-filled</li>
            <li>• One entry per vehicle</li>
          </ul>

          <div className="mt-6 rounded-md bg-slate-50 p-4 text-sm text-slate-600">
            <strong className="mb-1 block text-slate-800">Tip</strong>
            Accurate check-ins reduce service delays later.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Security;
