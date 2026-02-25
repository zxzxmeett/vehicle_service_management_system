import { useState } from "react";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";
import ThemeToggle from "../components/ThemeToggle";

function Security() {
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    vehicleNumber: "",
    vehicleModel: "",
    serviceType: "PAID_SERVICE", // REQUIRED
    vehicleBrand: "",
    fuelType: "",
    priority: "NORMAL", // ENUM
    paymentStatus: "PENDING", // ENUM
    isInsuranceJob: false,
    estimatedCost: "",
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

  const handleCheckbox = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
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
        serviceType: "PAID_SERVICE",
        vehicleBrand: "",
        fuelType: "",
        priority: "NORMAL",
        paymentStatus: "PENDING",
        isInsuranceJob: false,
        estimatedCost: "",
      });
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setCheckInTime(now.toISOString().slice(0, 16));
    } catch (err) {
      setError(err.response?.data?.message || "Check-in failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-[#0a0f1c] px-6 pt-10 pb-8 transition-colors duration-300">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#e6eef6]">
              Security Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#9fb0c3]">
              Welcome to Entry Point of Vehicle Service Management System.
            </p>
            <p className="text-sm text-slate-500 dark:text-[#9fb0c3]">
              Use the form below to check in vehicles as they arrive.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>

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

        {/* Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* FORM */}
          <div className="lg:col-span-2 rounded-xl bg-white dark:bg-[#121a2a] p-6 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* VEHICLE NUMBER — PRIMARY FIELD */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Vehicle Number
                </label>
                <input
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  required
                  autoFocus
                  className="h-12 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-lg font-semibold text-slate-900 dark:text-white focus:border-slate-900 dark:focus:border-blue-500 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                />
              </div>

              {/* CUSTOMER INFO */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Customer Name
                  </label>
                  <input
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    className="h-11 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="h-11 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* BRAND + MODEL */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Vehicle Brand
                  </label>
                  <input
                    name="vehicleBrand"
                    value={formData.vehicleBrand}
                    onChange={handleChange}
                    className="h-11 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Vehicle Model
                  </label>
                  <input
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleChange}
                    required
                    className="h-11 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* FUEL + SERVICE */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Fuel Type
                  </label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    className="h-11 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-slate-900 dark:text-white"
                  >
                    <option value="">Select</option>
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="EV">Electric</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Service Type
                  </label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    required
                    className="h-11 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-slate-900 dark:text-white"
                  >
                    <option value="PAID_SERVICE">Paid Service</option>
                    <option value="FREE_SERVICE">Free Service</option>
                    <option value="ACCIDENT">Accident</option>
                  </select>
                </div>
              </div>

              {/* CHECK-IN TIME */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Check-in Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="h-11 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-slate-900 dark:text-white"
                />
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                className="h-12 w-full rounded-md bg-slate-900 dark:bg-blue-600 text-white font-medium hover:bg-slate-800 dark:hover:bg-blue-500 active:scale-[0.99]"
              >
                Check In Vehicle
              </button>
            </form>
          </div>

          {/* INFO PANEL */}
          <div className="rounded-xl bg-white dark:bg-[#121a2a] p-6 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-[#e6eef6]">
              Quick Entry Tips
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-[#9fb0c3]">
              <li>• Start with vehicle number</li>
              <li>• Confirm phone before submission</li>
              <li>• Use NORMAL priority unless urgent</li>
              <li>• Insurance jobs require documents later</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Security;
