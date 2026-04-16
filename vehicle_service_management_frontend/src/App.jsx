import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Admin from "./pages/Admin.jsx";
import Security from "./pages/Security.jsx";
import Reception from "./pages/Reception.jsx";
import Advisor from "./pages/Advisor.jsx";
import ProtectedRoute from "./utlis/ProtectedRoute.jsx";
import CreateUser from "./pages/createUser.jsx";  
import ReceptionDelivery from "./pages/ReceptionDelivery.jsx";
import AdminLayout from "./pages/AdminLayout.jsx";
import VehicleInsights from "./pages/AdminInsights.jsx";
import ManageUsers from "./pages/ManageUser.jsx";

function App() {
  //console.log("API URL:", import.meta.env.VITE_API_URL);

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Admin />} />
        <Route path="create-user" element={<CreateUser />} />
        <Route path="insights" element={<VehicleInsights />} />
        <Route path="users" element={<ManageUsers />} />
        </Route>

        <Route path="/security" element={<ProtectedRoute allowedRoles={["SECURITY"]}><Security /></ProtectedRoute>} />
        <Route path="/reception" element={<ProtectedRoute allowedRoles={["RECEPTIONIST"]}><Reception /></ProtectedRoute>} />
        <Route path="/reception/delivery" allowedRoles={["RECEPTIONIST"]} element={<ReceptionDelivery />} />
        <Route path="/advisor" element={<ProtectedRoute allowedRoles={["ADVISOR"]}><Advisor /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;