import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Admin from "./pages/Admin.jsx";
import Security from "./pages/Security.jsx";
import Reception from "./pages/Reception.jsx";
import Advisor from "./pages/Advisor.jsx";

function App() {
  console.log("API URL:", import.meta.env.VITE_API_URL);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/security" element={<Security />} />
        <Route path="/reception" element={<Reception />} />
        <Route path="/advisor" element={<Advisor />} />
        <Route path="/" element={<h1>App Running</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;