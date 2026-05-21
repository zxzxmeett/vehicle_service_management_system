import { useNavigate } from "react-router-dom";
import {  toast } from "react-toastify";
function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Successfully logged out", {
      autoClose: 2000,
      theme: "colored",
    });
    localStorage.removeItem("role");
    navigate("/", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="h-9 rounded-md border border-slate-300 dark:border-slate-700 
                 px-4 text-sm font-medium text-slate-700 dark:text-slate-200
                 transition hover:bg-slate-200 dark:hover:bg-slate-800"
    >
      Logout
    </button>
  );
}

export default LogoutButton;