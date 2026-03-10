import { NavLink, Outlet } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import ThemeToggle from "../components/ThemeToggle";

// Left sideBar + Outlet for nested routes

function AdminLayout() {
  const linkClass =
    "block rounded-md px-3 py-2 text-sm font-medium transition";

  const activeClass =
    "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white";

  const inactiveClass =
    "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";

  return (
    <div className="flex h-screen bg-slate-200 dark:bg-[#0a0f1c]">
      
      {/* 🟦 Sidebar */}
      <aside className="w-64 h-full bg-white dark:bg-[#121a2a] border-r border-slate-200 dark:border-slate-800 flex flex-col">
        
        {/* Top */}
        <div className="p-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Admin Panel
          </h2>
        </div>

        {/* Navigation (scrollable if needed) */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/insights"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            Vehicle Insights
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            Manage Users
          </NavLink>

          <NavLink
            to="/admin/create-user"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            Create User
          </NavLink>
        </nav>

        {/* Bottom (always visible) */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </aside>

      {/*  Main Content — ONLY this scrolls */}
      <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;