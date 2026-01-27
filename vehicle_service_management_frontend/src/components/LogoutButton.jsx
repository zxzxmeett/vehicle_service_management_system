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
    <div className="flex-row">
      <ThemeToggle />
      <button className="btn logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default LogoutButton;
