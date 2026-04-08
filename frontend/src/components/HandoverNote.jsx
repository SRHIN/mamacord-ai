import { useState } from "react";
import { Copy, CheckCheck } from "lucide-react";

export default function HandoverNote({ note }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = note;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="mt-6 border-2 border-danger rounded-xl overflow-hidden">
      <div className="bg-danger text-white px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-sm tracking-wider">MAMACORD AI REFERRAL SUMMARY</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg font-semibold"
        >
          {copied ? (
            <>
              <CheckCheck size={14} /> Copied
            </>
          ) : (
            <>
              <Copy size={14} /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="font-mono text-xs leading-relaxed p-4 bg-white whitespace-pre-wrap break-words overflow-x-auto text-gray-800">
        {note}
      </pre>
    </div>
  );
}
