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
    <div className="container">
      {/* Header */}
      <div className="header">
        <div>
          <h1>Security Dashboard</h1>
          <p className="muted small">Register incoming vehicles</p>
        </div>
        <LogoutButton />
      </div>

      {message && <p className="msg-success">{message}</p>}
      {error && <p className="msg-error">{error}</p>}

      {/* Check-in form */}
      <div className="card" style={{ maxWidth: 520 }}>
        <h2 className="mb-1">Vehicle Check-In</h2>
        <p className="muted small">
          Enter customer and vehicle details to check in
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <label>Customer Name</label>
          <input
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
          />

          <label>Phone Number</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <label>Vehicle Number</label>
          <input
            name="vehicleNumber"
            value={formData.vehicleNumber}
            onChange={handleChange}
            required
          />

          <label>Vehicle Model</label>
          <input
            name="vehicleModel"
            value={formData.vehicleModel}
            onChange={handleChange}
            required
          />

          <label>Check-in Date & Time</label>
          <input
            type="datetime-local"
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
          />

          <button className="btn btn-primary mt-1" type="submit">
            Check In Vehicle
          </button>
        </form>
      </div>
    </div>
  );
}

export default Security;
