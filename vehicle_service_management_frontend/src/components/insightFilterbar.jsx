import { useState } from "react";

export default function InsightsFilterBar({
  filters,
  onChange,
  advisors = [],
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (key, value) => {
  onChange((prev) => ({
    ...prev,
    [key]: value || undefined,
  }));
};

  const resetFilters = () => onChange({});

  /* ---------- Date Presets ---------- */

  const applyPreset = (days) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);

    update("fromDate", from.toISOString().slice(0, 10));
    update("toDate", to.toISOString().slice(0, 10));
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg
                    border border-gray-200 dark:border-gray-700
                    p-4 mb-6 space-y-4">

      {/* 🔝 QUICK FILTERS */}
      <div className="flex flex-wrap items-center gap-3">

        {/* ⭐ DATE RANGE GROUP */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800
                        px-3 py-2 rounded-lg border
                        border-gray-200 dark:border-gray-700">

          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Date:
          </span>

          <button
            onClick={() => applyPreset(0)}
            className="chip"
          >
            Today
          </button>

          <button
            onClick={() => applyPreset(7)}
            className="chip"
          >
            7d
          </button>

          <button
            onClick={() => applyPreset(30)}
            className="chip"
          >
            30d
          </button>

          {/* Custom */}
          <input
            type="date"
            value={filters.fromDate || ""}
            onChange={(e) => update("fromDate", e.target.value)}
            className="date-input"
          />

          <span className="text-gray-400">→</span>

          <input
            type="date"
            value={filters.toDate || ""}
            onChange={(e) => update("toDate", e.target.value)}
            className="date-input"
          />
        </div>

        {/* STATUS */}
        <select
          value={filters.status || ""}
          onChange={(e) => update("status", e.target.value)}
          className="input"
        >
          <option value="">Status</option>
          <option value="IN_SERVICE">In Service</option>
          <option value="READY_FOR_DELIVERY">Ready</option>
          <option value="DELIVERED">Delivered</option>
        </select>

        {/* SERVICE */}
        <select
          value={filters.serviceType || ""}
          onChange={(e) => update("serviceType", e.target.value)}
          className="input"
        >
          <option value="">Service</option>
          <option value="PAID_SERVICE">Paid</option>
          <option value="FREE_SERVICE">Free</option>
          <option value="ACCIDENT">Accident</option>
        </select>

        {/* ADVISOR */}
        <select
          value={filters.advisor || ""}
          onChange={(e) => update("advisor", e.target.value)}
          className="input"
        >
          <option value="">Advisor</option>
          {advisors.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search vehicle / customer / phone"
          value={filters.search || ""}
          onChange={(e) => update("search", e.target.value)}
          className="input min-w-[220px]"
        />

        {/* ACTIONS */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="btn-secondary"
        >
          ⚙️ Advanced
        </button>

        <button
          onClick={resetFilters}
          className="btn-danger"
        >
          Reset
        </button>
      </div>

      {/* 🔽 ADVANCED FILTERS */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4
                        pt-4 border-t border-gray-200 dark:border-gray-700">

          <select
            value={filters.priority || ""}
            onChange={(e) => update("priority", e.target.value)}
            className="input"
          >
            <option value="">Priority</option>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="EMERGENCY">Emergency</option>
          </select>

          <select
            value={filters.paymentStatus || ""}
            onChange={(e) => update("paymentStatus", e.target.value)}
            className="input"
          >
            <option value="">Payment</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Paid</option>
          </select>

          <select
            value={filters.fuelType || ""}
            onChange={(e) => update("fuelType", e.target.value)}
            className="input"
          >
            <option value="">Fuel</option>
            <option value="PETROL">Petrol</option>
            <option value="DIESEL">Diesel</option>
            <option value="CNG">CNG</option>
            <option value="EV">EV</option>
            <option value="HYBRID">Hybrid</option>
          </select>

          <input
            type="number"
            placeholder="Idle > hours"
            value={filters.idleGt || ""}
            onChange={(e) => update("idleGt", e.target.value)}
            className="input"
          />
        </div>
      )}
    </div>
  );
}