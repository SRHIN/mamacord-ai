import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { LogOut, Loader2 } from "lucide-react";
import Triage from "./pages/Triage";
import Result from "./pages/Result";
import Awareness from "./pages/Awareness";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import LandingPage from "./pages/LandingPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

function AppContent() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isLanding = location.pathname === '/';

  return (
    <>
      {!isLanding && (
        <nav className="bg-primary text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
          <NavLink to="/" className="font-bold text-lg tracking-tight hover:opacity-90">
            Mamacord <span className="text-accent">AI</span>
          </NavLink>
          <div className="flex items-center gap-4 text-sm">
            {user && (
              <>
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
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-white/70 hover:text-accent text-xs"
                  title="Sign out"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </>
            )}
          </div>
        </nav>
      )}
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />

        {/* Protected */}
        <Route path="/triage" element={<ProtectedRoute><Triage /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
        <Route path="/awareness" element={<ProtectedRoute><Awareness /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
