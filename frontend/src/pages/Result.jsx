import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, AlertTriangle, Plus } from "lucide-react";
import RiskBadge from "../components/RiskBadge";
import HandoverNote from "../components/HandoverNote";

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [rationaleOpen, setRationaleOpen] = useState(false);

  if (!state?.result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <AlertTriangle size={40} className="text-warning" />
        <p className="text-gray-600 text-center">No triage result found. Please run an assessment first.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold"
        >
          New Assessment
        </button>
      </div>
    );
  }

  const { result } = state;
  const isRed = result.risk_level === "RED";

  const actionBg = {
    RED: "bg-red-50 border-danger text-danger",
    YELLOW: "bg-yellow-50 border-warning text-yellow-800",
    GREEN: "bg-green-50 border-success text-green-800",
  }[result.risk_level] || "bg-gray-50 border-gray-300 text-gray-800";

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="bg-primary text-white px-4 py-4 text-center">
        <h1 className="text-lg font-extrabold tracking-tight">Triage Result</h1>
        <p className="text-accent text-xs mt-0.5">Mamacord AI · WHO-Grounded</p>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-5 space-y-4">
        {/* Risk Badge */}
        <RiskBadge level={result.risk_level} />

        {/* Primary Concern */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Primary Concern</p>
          <p className="font-bold text-gray-900 text-base leading-snug">{result.primary_concern}</p>
        </div>

        {/* Flags */}
        {result.flags?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Clinical Flags</p>
            <ul className="space-y-2">
              {result.flags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                  <span className={`mt-0.5 font-bold ${isRed ? "text-danger" : "text-warning"}`}>▶</span>
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Action */}
        {result.recommended_action && (
          <div className={`border-2 rounded-2xl p-4 ${actionBg}`}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Recommended Action</p>
            <p className="font-bold text-sm leading-snug">{result.recommended_action}</p>
          </div>
        )}

        {/* Rationale (collapsible) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setRationaleOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700"
          >
            Clinical Rationale
            {rationaleOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {rationaleOpen && (
            <div className="px-4 pb-4 text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-3">
              {result.rationale}
            </div>
          )}
        </div>

        {/* Citations */}
        {result.citations?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Guideline Sources</p>
            <ul className="space-y-1">
              {result.citations.map((c, i) => (
                <li key={i} className="text-xs text-gray-500 italic">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Handover Note (RED only) */}
        {isRed && result.handover_note && (
          <HandoverNote note={result.handover_note} />
        )}

        {/* Actions */}
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center justify-center gap-2 border-2 border-primary text-primary font-bold py-4 rounded-2xl text-base"
        >
          <Plus size={18} /> New Assessment
        </button>
      </div>
    </div>
  );
}
