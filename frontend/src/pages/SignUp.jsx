import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import axios from "axios";
import { Loader2, UserPlus } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ROLES = [
  { value: "chw", label: "Community Health Worker" },
  { value: "tba", label: "Traditional Birth Attendant" },
  { value: "nurse", label: "PHC Nurse" },
  { value: "doctor", label: "Doctor" },
];

export default function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    facility_name: "",
    role: "chw",
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/signup`, {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        facility_name: form.facility_name || null,
        role: form.role,
      });
      login(data.access_token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary text-white px-4 py-6 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">Mamacord AI</h1>
        <p className="text-accent text-sm mt-1 font-medium">Create your account</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-4 mt-8 space-y-4 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Full Name</label>
            <input
              required
              type="text"
              value={form.full_name}
              onChange={set("full_name")}
              placeholder="e.g. Amina Ibrahim"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="amina@example.com"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Role</label>
            <select
              value={form.role}
              onChange={set("role")}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Facility Name <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={form.facility_name}
              onChange={set("facility_name")}
              placeholder="e.g. Kuje PHC"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="Minimum 8 characters"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
            <input
              required
              type="password"
              value={form.confirm_password}
              onChange={set("confirm_password")}
              placeholder="Re-enter your password"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {error && (
            <p className="text-danger text-sm font-medium text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <UserPlus size={18} />
            )}
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/signin" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
