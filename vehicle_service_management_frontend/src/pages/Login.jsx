import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });

      const token = res.data.token;
      const role = res.data.role;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (role === "ADMIN") navigate("/admin", { replace: true });
      else if (role === "SECURITY") navigate("/security", { replace: true });
      else if (role === "RECEPTIONIST")
        navigate("/reception", { replace: true });
      else if (role === "ADVISOR") navigate("/advisor", { replace: true });
      else console.error("Unknown role:", role);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container">
      {/* Brand header */}
      <div className="header">
        <div className="flex-row">
          <svg
            className="logo-icon"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M3 11.5C3 10.7 3.7 10 4.5 10h15c.8 0 1.5.7 1.5 1.5v3c0 .8-.7 1.5-1.5 1.5H20v1.25c0 .414-.336.75-.75.75h-1.5c-.414 0-.75-.336-.75-.75V16H8v1.25c0 .414-.336.75-.75.75H5.75c-.414 0-.75-.336-.75-.75V16H4.5C3.7 16 3 15.3 3 14.5v-3zM5.5 12.5c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1zm12 0c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1zM6.5 8.5l1.5-2.5h8l1.5 2.5h-11z" />
          </svg>

          <div>
            <h2>Vehicle Service</h2>
            <p className="muted small">Internal Management System</p>
          </div>
        </div>
      </div>

      {/* Login card */}
      <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
        <h3 className="mb-1">Sign in</h3>
        <p className="muted small">
          Use your work credentials to continue
        </p>

        {error && <p className="msg-error mt-1">{error}</p>}

        <form className="form" onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn btn-primary mt-1" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
