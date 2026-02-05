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
    <div className="min-h-screen bg-slate-200 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <svg
            className="h-10 w-10 text-slate-900"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M3 11.5C3 10.7 3.7 10 4.5 10h15c.8 0 1.5.7 1.5 1.5v3c0 .8-.7 1.5-1.5 1.5H20v1.25c0 .414-.336.75-.75.75h-1.5c-.414 0-.75-.336-.75-.75V16H8v1.25c0 .414-.336.75-.75.75H5.75c-.414 0-.75-.336-.75-.75V16H4.5C3.7 16 3 15.3 3 14.5v-3zM6.5 8.5l1.5-2.5h8l1.5 2.5h-11z" />
          </svg>

          <div className="text-left">
            <h1 className="text-lg font-semibold text-slate-900">
              Vehicle Service
            </h1>
            <p className="text-sm text-slate-500">Internal Management System</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-medium text-slate-900">Sign in</h2>
          <p className="mb-6 text-sm text-slate-500">
            Use your work credentials to continue
          </p>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 w-full rounded-md border border-slate-300 px-3 transition
                         focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 w-full rounded-md border border-slate-300 px-3 transition
                         focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-md bg-slate-900 text-white
                       transition hover:bg-slate-800 active:scale-[0.99]"
            >
              Login
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Authorized Staff only
        </p>
      </div>
    </div>
  );
}

export default Login;
