import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Triage from "./pages/Triage";
import Result from "./pages/Result";
import Awareness from "./pages/Awareness";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="bg-primary text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <span className="font-bold text-lg tracking-tight">Mamacord AI</span>
        <div className="flex gap-4 text-sm">
          <NavLink
            to="/"
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
      <Routes>
        <Route path="/" element={<Triage />} />
        <Route path="/result" element={<Result />} />
        <Route path="/awareness" element={<Awareness />} />
      </Routes>
    </BrowserRouter>
  );
}
