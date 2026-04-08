const config = {
  RED: {
    bg: "bg-danger",
    text: "text-white",
    label: "RED — Critical Risk",
    dot: "●●●",
  },
  YELLOW: {
    bg: "bg-warning",
    text: "text-gray-900",
    label: "YELLOW — Elevated Risk",
    dot: "●●○",
  },
  GREEN: {
    bg: "bg-success",
    text: "text-white",
    label: "GREEN — Low Risk",
    dot: "●○○",
  },
};

export default function RiskBadge({ level }) {
  const c = config[level] || config.GREEN;
  return (
    <div className={`${c.bg} ${c.text} rounded-xl px-6 py-4 text-center shadow-lg`}>
      <div className="text-3xl font-bold tracking-widest">{c.dot}</div>
      <div className="text-xl font-extrabold mt-1 tracking-wide">{c.label}</div>
    </div>
  );
}
