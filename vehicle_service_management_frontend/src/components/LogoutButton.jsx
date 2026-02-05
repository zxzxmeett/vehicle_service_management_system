import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/", { replace: true });
  };

return (
  <div className="flex items-center gap-3">
    <ThemeToggle />

    <button
      onClick={handleLogout}
      className="
        h-9 rounded-md border border-slate-300
        px-4 text-sm font-medium text-slate-700
        transition hover:bg-slate-200
      "
    >
      Logout
    </button>
  </div>
);
  
}

export default LogoutButton;
