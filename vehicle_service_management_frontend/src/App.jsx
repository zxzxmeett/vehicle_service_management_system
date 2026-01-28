import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Admin from "./pages/Admin.jsx";
import Security from "./pages/Security.jsx";
import Reception from "./pages/Reception.jsx";
import Advisor from "./pages/Advisor.jsx";
import ProtectedRoute from "./utlis/ProtectedRoute.jsx";
import CreateUser from "./pages/createUser.jsx";  
import ReceptionDelivery from "./pages/ReceptionDelivery.jsx";

function App() {
  console.log("API URL:", import.meta.env.VITE_API_URL);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><Admin /></ProtectedRoute>} />
        <Route path="/security" element={<ProtectedRoute allowedRoles={["SECURITY"]}><Security /></ProtectedRoute>} />
        <Route path="/reception" element={<ProtectedRoute allowedRoles={["RECEPTIONIST"]}><Reception /></ProtectedRoute>} />
        <Route path="/advisor" element={<ProtectedRoute allowedRoles={["ADVISOR"]}><Advisor /></ProtectedRoute>} />
        <Route path="/admin/create-user" element={<ProtectedRoute allowedRoles={["ADMIN"]}><CreateUser /></ProtectedRoute>} />
        <Route path="/reception/delivery" element={<ReceptionDelivery />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;