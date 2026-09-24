import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/login/login";
import MemberDashboard from "./pages/MemberDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/member-dashboard" element={<MemberDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
