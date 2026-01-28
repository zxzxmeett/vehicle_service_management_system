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
    setError(""); // Clear previous errors

    //send login request to backend
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      //extract token and role from backend response
      const token = res.data.token;
      const role = res.data.role;

      //store token and role in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (role === "ADMIN") navigate("/admin", { replace: true });
      else if (role === "SECURITY") navigate("/security", { replace: true });
      else if (role === "RECEPTIONIST") navigate("/reception", { replace: true });
      else if (role === "ADVISOR") navigate("/advisor", { replace: true });
      else console.error("Unknown role:", role);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h2>
          <svg
            className="logo-icon"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M3 11.5C3 10.7 3.7 10 4.5 10h15c.8 0 1.5.7 1.5 1.5v3c0 .8-.7 1.5-1.5 1.5H20v1.25c0 .414-.336.75-.75.75h-1.5c-.414 0-.75-.336-.75-.75V16H8v1.25c0 .414-.336.75-.75.75H5.75c-.414 0-.75-.336-.75-.75V16H4.5C3.7 16 3 15.3 3 14.5v-3zM5.5 12.5c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1zm12 0c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1zM6.5 8.5l1.5-2.5h8l1.5 2.5h-11z" />
          </svg>
          Vehicle Service
        </h2>
      </div>

      {error && <p className="msg-error">{error}</p>}

      <form className="card form" onSubmit={handleSubmit}>
        <input
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div>
          <button className="btn btn-primary" type="submit">
            Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
