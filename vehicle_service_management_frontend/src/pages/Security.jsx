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
      await api.post("/vehicles/checkin", formData);
      setMessage("Vehicle checked in successfully");

      setFormData({
        customerName: "",
        phone: "",
        vehicleNumber: "",
        vehicleModel: "",
      });
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
        <input
          name="customerName"
          placeholder="Customer Name"
          value={formData.customerName}
          onChange={handleChange}
          required
        />

        <input
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <input
          name="vehicleNumber"
          placeholder="Vehicle Number"
          value={formData.vehicleNumber}
          onChange={handleChange}
          required
        />

        <input
          name="vehicleModel"
          placeholder="Vehicle Model"
          value={formData.vehicleModel}
          onChange={handleChange}
          required
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
