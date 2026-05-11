import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import Triage from "./pages/Triage";
import Result from "./pages/Result";
import Awareness from "./pages/Awareness";
import LandingPage from "./pages/LandingPage";

function AppContent() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <>
      {!isLanding && (
        <nav className="bg-primary text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
          <NavLink to="/" className="font-bold text-lg tracking-tight hover:opacity-90">
            Mamacord <span className="text-accent">AI</span>
          </NavLink>
          <div className="flex gap-4 text-sm">
            <NavLink
              to="/triage"
              className={({ isActive }) =>
                isActive ? "text-accent font-semibold" : "text-white/80 hover:text-accent"
              }
            >
              Triage
            </NavLink>
            <NavLink
              to="/awareness"
              className={({ isActive }) =>
                isActive ? "text-accent font-semibold" : "text-white/80 hover:text-accent"
              }
            >
              Awareness
            </NavLink>
          </div>
        </nav>
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/triage" element={<Triage />} />
        <Route path="/result" element={<Result />} />
        <Route path="/awareness" element={<Awareness />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
