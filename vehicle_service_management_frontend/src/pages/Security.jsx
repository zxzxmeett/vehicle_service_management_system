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
    // default to current datetime in local format
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      // e.target.name is the name attribute of the input field
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
      <div className="header">
        <h1>Security Dashboard</h1>
        <LogoutButton />
      </div>

      <h3>Vehicle Check-In</h3>

      {message && <p className="msg-success">{message}</p>}
      {error && <p className="msg-error">{error}</p>}

      <form className="card form" onSubmit={handleSubmit}>
        <p id="customer-name-label">Customer name :</p>
        <input
          name="customerName"
          placeholder="Customer Name"
          value={formData.customerName}
          onChange={handleChange}
          required
        />
        <p>Phone number :</p>
        <input
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <p>Vehicle details :</p>
        <input
          name="vehicleNumber"
          placeholder="Vehicle Number"
          value={formData.vehicleNumber}
          onChange={handleChange}
          required
        />
        <p>Vehicle Model :</p>
        <input
          name="vehicleModel"
          placeholder="Vehicle Model"
          value={formData.vehicleModel}
          onChange={handleChange}
          required
        />

        <p>Check-in Date & Time :</p>
        <input
          type="datetime-local"
          value={checkInTime}
          onChange={(e) => setCheckInTime(e.target.value)}
        />

        <div>
          <button className="btn btn-primary" type="submit">
            Check In Vehicle
          </button>
        </div>
      </form>
    </div>
  );
}

export default Security;
