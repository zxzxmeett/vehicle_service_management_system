import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ThemeToggle from "../components/ThemeToggle";
import { toast } from "react-toastify";

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
  
  // 1. Create the promise (don't await it yet)
  const loginPromise = api.post("/auth/login", { email, password });

  // 2. Wrap the promise in a toast
  toast.promise(loginPromise, {
    pending: 'Checking credentials...',
    success: 'Login successful! Redirecting...',
    error: {
      render({ data }) {
        // This dynamically catches the error message from your API
        return data.response?.data?.message || "Invalid email or password";
      }
    }
  });

  try {
    // 3. Now await the response to handle navigation
    const res = await loginPromise;
    const { token, role } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    // Short delay so they can actually see the "Success" toast before navigating
    setTimeout(() => {
      if (role === "ADMIN") navigate("/admin");
      else if (role === "SECURITY") navigate("/security");
      else if (role === "RECEPTIONIST") navigate("/reception");
      else if (role === "ADVISOR") navigate("/advisor");
    }, 1000);

  } catch (err) {
    // Error is already handled by toast.promise!
    console.error("Login Error:", err);
  }
};
  return (
    <div className="min-h-screen bg-slate-200 dark:bg-[#0a0f1c] flex items-center justify-center px-6 transition-colors duration-300">
      {/* Floating Toggle for Login Page */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <svg
            className="h-10 w-10 text-slate-900 dark:text-blue-500"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M3 11.5C3 10.7 3.7 10 4.5 10h15c.8 0 1.5.7 1.5 1.5v3c0 .8-.7 1.5-1.5 1.5H20v1.25c0 .414-.336.75-.75.75h-1.5c-.414 0-.75-.336-.75-.75V16H8v1.25c0 .414-.336.75-.75.75H5.75c-.414 0-.75-.336-.75-.75V16H4.5C3.7 16 3 15.3 3 14.5v-3zM6.5 8.5l1.5-2.5h8l1.5 2.5h-11z" />
          </svg>

          <div className="text-left">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-[#e6eef6]">
              Vehicle Service
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#9fb0c3]">Internal Management System</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-xl bg-white dark:bg-[#121a2a] p-6 shadow-sm ring-1 ring-slate-200 dark:ring-[#243047]">
          <h2 className="text-lg font-medium text-slate-900 dark:text-[#e6eef6]">Sign in</h2>
          <p className="mb-6 text-sm text-slate-500 dark:text-[#9fb0c3]">
            Use your work credentials to continue
          </p>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-slate-900 dark:text-white transition
                         focus:border-slate-900 dark:focus:border-blue-500 focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-blue-500/10 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-slate-900 dark:text-white transition
                         focus:border-slate-900 dark:focus:border-blue-500 focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-blue-500/10 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-md bg-slate-900 dark:bg-blue-600 text-white
                       transition hover:bg-slate-800 dark:hover:bg-blue-500 active:scale-[0.99]"
            >
              Login
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-[#9fb0c3]">
          Authorized Staff only
        </p>
      </div>
    </div>
  );
}

export default Login;