export default function InputField({ label, unit, error, className = "", ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {unit && <span className="text-gray-400 font-normal ml-1">({unit})</span>}
      </label>
      <input
        className={`border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50 ${
          error ? "border-danger" : "border-gray-300"
        }`}
        {...props}
      />
      {error && <span className="text-danger text-xs">{error}</span>}
    </div>
  );
}
