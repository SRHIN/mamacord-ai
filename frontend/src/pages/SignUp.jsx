import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import axios from "axios";
import { Loader2, UserPlus, Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwErrors, setPwErrors] = useState([]);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    facility_name: "",
    role: "chw",
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function validatePassword(pw) {
    const errs = [];
    if (pw.length < 8) errs.push("At least 8 characters");
    if (!/[A-Z]/.test(pw)) errs.push("At least one uppercase letter");
    if (!/[a-z]/.test(pw)) errs.push("At least one lowercase letter");
    if (!/[0-9]/.test(pw)) errs.push("At least one number");
    return errs;
  }

  function handlePasswordChange(e) {
    const pw = e.target.value;
    setForm((f) => ({ ...f, password: pw }));
    setPwErrors(validatePassword(pw));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const errs = validatePassword(form.password);
    if (errs.length > 0) {
      setPwErrors(errs);
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
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handlePasswordChange}
                placeholder="Minimum 8 characters"
                className="border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && pwErrors.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {["At least 8 characters", "At least one uppercase letter", "At least one lowercase letter", "At least one number"].map((rule) => {
                  const pass = !pwErrors.includes(rule);
                  return (
                    <li key={rule} className={`text-xs flex items-center gap-1 ${pass ? "text-success" : "text-gray-400"}`}>
                      <span>{pass ? "✓" : "○"}</span> {rule}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                required
                type={showConfirm ? "text" : "password"}
                value={form.confirm_password}
                onChange={set("confirm_password")}
                placeholder="Re-enter your password"
                className={`border rounded-lg px-3 py-2 pr-10 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  form.confirm_password && form.confirm_password !== form.password ? "border-danger" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.confirm_password && form.confirm_password !== form.password && (
              <span className="text-danger text-xs">Passwords do not match</span>
            )}
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
