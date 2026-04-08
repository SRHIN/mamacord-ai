import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2, HeartPulse, FlaskConical, Scan, User, Camera, X } from "lucide-react";
import InputField from "../components/InputField";
import { useAuth } from "../AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const PROTEIN_OPTIONS = ["Negative", "Trace", "1+", "2+", "3+"];
const GLUCOSE_OPTIONS = ["Negative", "Trace", "Positive"];
const PLACENTA_OPTIONS = ["Normal", "Low-lying", "Praevia"];
const PRESENTATION_OPTIONS = ["Cephalic", "Breech", "Transverse"];
const LIQUOR_OPTIONS = ["Normal", "Reduced", "Oligohydramnios", "Increased"];

export default function Triage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ussOpen, setUssOpen] = useState(false);
  const [fbcOpen, setFbcOpen] = useState(false);
  const [ussImage, setUssImage] = useState(null); // base64 string
  const [ussImageName, setUssImageName] = useState("");
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    patient_id: "",
    age: "",
    gestational_age: "",
    gravida: "",
    para: "",
    systolic_bp: "",
    diastolic_bp: "",
    temperature: "",
    heart_rate: "",
    pcv: "",
    urine_protein: "Negative",
    urine_glucose: "Negative",
    wbc: "",
    neutrophils: "",
    platelets: "",
    placental_location: "Normal",
    fetal_presentation: "Cephalic",
    liquor_volume: "Normal",
    fhr: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setSelect = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUssImageName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      // strip data:image/...;base64, prefix
      const b64 = ev.target.result.split(",")[1];
      setUssImage(b64);
    };
    reader.readAsDataURL(file);
  }

  function validate() {
    const required = ["age", "gestational_age", "systolic_bp", "diastolic_bp", "temperature", "heart_rate", "pcv"];
    const errors = {};
    for (const k of required) {
      if (form[k] === "" || form[k] === null) {
        errors[k] = "Required";
      }
    }
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setError("");
    setLoading(true);

    try {
      const payload = {
        patient_id: form.patient_id || null,
        age: parseInt(form.age),
        gestational_age: parseInt(form.gestational_age),
        gravida: form.gravida ? parseInt(form.gravida) : null,
        para: form.para ? parseInt(form.para) : null,
        systolic_bp: parseFloat(form.systolic_bp),
        diastolic_bp: parseFloat(form.diastolic_bp),
        temperature: parseFloat(form.temperature),
        heart_rate: parseFloat(form.heart_rate),
        pcv: parseFloat(form.pcv),
        urine_protein: form.urine_protein,
        urine_glucose: form.urine_glucose,
        ...(fbcOpen && {
          wbc: form.wbc ? parseFloat(form.wbc) : null,
          neutrophils: form.neutrophils ? parseFloat(form.neutrophils) : null,
          platelets: form.platelets ? parseInt(form.platelets) : null,
        }),
        ...(ussOpen && {
          placental_location: form.placental_location,
          fetal_presentation: form.fetal_presentation,
          liquor_volume: form.liquor_volume,
          fhr: form.fhr ? parseFloat(form.fhr) : null,
          uss_image_base64: ussImage || null,
        }),
      };

      const { data } = await axios.post(`${API}/api/triage`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/result", { state: { result: data, input: payload } });
    } catch (err) {
      setError(err.response?.data?.detail || "Server error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  const SelectField = ({ label, unit, name, options }) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {unit && <span className="text-gray-400 font-normal ml-1">({unit})</span>}
      </label>
      <select
        value={form[name]}
        onChange={setSelect(name)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-6 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">Mamacord AI</h1>
        <p className="text-accent text-sm mt-1 font-medium">Maternal Triage · Powered by AI</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 mt-6 space-y-6">

        {/* Section 1: Patient Details */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-primary" />
            <h2 className="font-bold text-primary text-base">Patient Details</h2>
          </div>
          <div className="flex flex-col gap-3">
            <InputField
              label="Patient ID"
              type="text"
              placeholder="e.g. MCH-2024-001 (optional)"
              value={form.patient_id}
              onChange={set("patient_id")}
            />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Age"
                unit="years"
                type="number"
                min="10"
                max="60"
                value={form.age}
                onChange={set("age")}
                error={fieldErrors.age}
              />
              <InputField
                label="Gestational Age"
                unit="weeks"
                type="number"
                min="1"
                max="45"
                value={form.gestational_age}
                onChange={set("gestational_age")}
                error={fieldErrors.gestational_age}
              />
              <InputField
                label="Gravida"
                unit="no. of pregnancies"
                type="number"
                min="1"
                value={form.gravida}
                onChange={set("gravida")}
              />
              <InputField
                label="Para"
                unit="no. of live births"
                type="number"
                min="0"
                value={form.para}
                onChange={set("para")}
              />
            </div>
          </div>
        </section>

        {/* Section 2: Critical Vitals */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <HeartPulse size={18} className="text-primary" />
            <h2 className="font-bold text-primary text-base">Critical Vitals</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Systolic Blood Pressure"
              unit="mmHg"
              type="number"
              min="60"
              max="250"
              value={form.systolic_bp}
              onChange={set("systolic_bp")}
              error={fieldErrors.systolic_bp}
            />
            <InputField
              label="Diastolic Blood Pressure"
              unit="mmHg"
              type="number"
              min="40"
              max="160"
              value={form.diastolic_bp}
              onChange={set("diastolic_bp")}
              error={fieldErrors.diastolic_bp}
            />
            <InputField
              label="Temperature"
              unit="°C"
              type="number"
              min="34"
              max="42"
              step="0.1"
              value={form.temperature}
              onChange={set("temperature")}
              error={fieldErrors.temperature}
            />
            <InputField
              label="Maternal Heart Rate"
              unit="bpm"
              type="number"
              min="40"
              max="200"
              value={form.heart_rate}
              onChange={set("heart_rate")}
              error={fieldErrors.heart_rate}
            />
          </div>
        </section>

        {/* Section 3: Point-of-Care Labs */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical size={18} className="text-primary" />
            <h2 className="font-bold text-primary text-base">Point-of-Care Tests</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Packed Cell Volume (PCV)"
              unit="%"
              type="number"
              min="5"
              max="60"
              step="0.1"
              placeholder="e.g. 33"
              value={form.pcv}
              onChange={set("pcv")}
              error={fieldErrors.pcv}
            />
            <div className="flex items-end pb-1">
              {form.pcv !== "" && (
                <p className="text-xs text-gray-500 leading-tight">
                  Est. Hb:<br />
                  <span className="font-bold text-gray-700">{(parseFloat(form.pcv) / 3).toFixed(1)} g/dL</span>
                </p>
              )}
            </div>
            <SelectField label="Urine Protein" name="urine_protein" options={PROTEIN_OPTIONS} />
            <SelectField label="Urine Glucose" name="urine_glucose" options={GLUCOSE_OPTIONS} />
          </div>
        </section>

        {/* Section 4: FBC (optional) */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <button
            type="button"
            onClick={() => setFbcOpen((o) => !o)}
            className="flex items-center gap-2 w-full text-left"
          >
            <FlaskConical size={18} className="text-primary" />
            <h2 className="font-bold text-primary text-base flex-1">Full Blood Count (FBC)</h2>
            <span className="text-xs text-gray-400 font-medium">{fbcOpen ? "Hide ▲" : "Add ▼"}</span>
          </button>
          <p className="text-xs text-gray-400 mt-1 ml-6">Optional — for sepsis &amp; HELLP screening</p>

          {fbcOpen && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <InputField
                label="White Blood Cells"
                unit="x10³/μL"
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={form.wbc}
                onChange={set("wbc")}
              />
              <InputField
                label="Neutrophils"
                unit="%"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.neutrophils}
                onChange={set("neutrophils")}
              />
              <InputField
                label="Platelets"
                unit="x10³/μL"
                type="number"
                min="0"
                max="900"
                value={form.platelets}
                onChange={set("platelets")}
              />
            </div>
          )}
        </section>

        {/* Section 5: USS Findings (optional) */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <button
            type="button"
            onClick={() => setUssOpen((o) => !o)}
            className="flex items-center gap-2 w-full text-left"
          >
            <Scan size={18} className="text-primary" />
            <h2 className="font-bold text-primary text-base flex-1">USS Findings</h2>
            <span className="text-xs text-gray-400 font-medium">{ussOpen ? "Hide ▲" : "Add ▼"}</span>
          </button>

          {ussOpen && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Placental Location" name="placental_location" options={PLACENTA_OPTIONS} />
                <SelectField label="Fetal Presentation" name="fetal_presentation" options={PRESENTATION_OPTIONS} />
                <SelectField label="Liquor Volume" name="liquor_volume" options={LIQUOR_OPTIONS} />
                <InputField
                  label="Fetal Heart Rate"
                  unit="bpm"
                  type="number"
                  min="80"
                  max="200"
                  value={form.fhr}
                  onChange={set("fhr")}
                />
              </div>

              {/* USS Image Upload */}
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Upload Obstetric USS Image (optional)</p>
                {ussImage ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-success rounded-lg px-3 py-2">
                    <Scan size={15} className="text-success shrink-0" />
                    <span className="text-xs text-success font-medium truncate flex-1">{ussImageName}</span>
                    <button
                      type="button"
                      onClick={() => { setUssImage(null); setUssImageName(""); fileInputRef.current.value = ""; }}
                      className="text-gray-400 hover:text-danger"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-primary hover:text-primary"
                  >
                    <Camera size={17} />
                    Snap or upload USS image for AI analysis
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </section>

        {error && (
          <div className="bg-red-50 border border-danger text-danger text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-md disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" /> Analysing...
            </>
          ) : (
            "Run Triage Assessment"
          )}
        </button>
      </form>
    </div>
  );
}
