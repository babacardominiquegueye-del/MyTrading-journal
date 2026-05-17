// ============================================================
// components/common/StatCard.jsx — Carte de statistique
// ============================================================
import React from "react";

export const StatCard = ({ title, value, subtitle, color = "green", icon, trend }) => {
  const colors = {
    green:  "text-accent-green border-accent-green/20 bg-accent-green/5",
    red:    "text-accent-red   border-accent-red/20   bg-accent-red/5",
    blue:   "text-accent-blue  border-accent-blue/20  bg-accent-blue/5",
    gold:   "text-accent-gold  border-accent-gold/20  bg-accent-gold/5",
    white:  "text-white        border-dark-500         bg-dark-700",
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-dark-400 text-xs font-medium uppercase tracking-wide">{title}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className={`text-2xl font-bold font-mono ${color === "white" ? "text-white" : ""}`}>
        {value}
      </p>
      {subtitle && <p className="text-dark-400 text-xs mt-1">{subtitle}</p>}
      {trend !== undefined && (
        <p className={`text-xs mt-1 font-medium ${trend >= 0 ? "text-accent-green" : "text-accent-red"}`}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
        </p>
      )}
    </div>
  );
};

// ============================================================
// components/common/Badge.jsx — Badge de statut
// ============================================================
export const Badge = ({ children, variant = "default" }) => {
  const variants = {
    win:        "bg-accent-green/10 text-accent-green border border-accent-green/20",
    loss:       "bg-accent-red/10   text-accent-red   border border-accent-red/20",
    open:       "bg-accent-blue/10  text-accent-blue  border border-accent-blue/20",
    breakeven:  "bg-accent-gold/10  text-accent-gold  border border-accent-gold/20",
    buy:        "bg-accent-green/10 text-accent-green border border-accent-green/20",
    sell:       "bg-accent-red/10   text-accent-red   border border-accent-red/20",
    admin:      "bg-purple-500/10   text-purple-400   border border-purple-500/20",
    premium_trader: "bg-accent-gold/10 text-accent-gold border border-accent-gold/20",
    strategy_seller:"bg-accent-blue/10 text-accent-blue border border-accent-blue/20",
    trader:     "bg-dark-500        text-dark-300     border border-dark-400",
    default:    "bg-dark-600        text-dark-300     border border-dark-500",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
};

// ============================================================
// components/common/Button.jsx — Bouton réutilisable
// ============================================================
export const Button = ({
  children, onClick, type = "button", variant = "primary",
  size = "md", disabled = false, loading = false, className = "",
}) => {
  const variants = {
    primary:   "bg-accent-green text-dark-900 hover:bg-accent-green/80",
    danger:    "bg-accent-red   text-white    hover:bg-accent-red/80",
    secondary: "bg-dark-600     text-white    hover:bg-dark-500 border border-dark-500",
    ghost:     "text-dark-300   hover:text-white hover:bg-dark-600",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2   text-sm",
    lg: "px-6 py-3   text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

// ============================================================
// components/common/Input.jsx — Champ de formulaire
// ============================================================
export const Input = ({
  label, name, type = "text", value, onChange,
  placeholder, error, required, className = "",
}) => (
  <div className={className}>
    {label && (
      <label htmlFor={name} className="block text-sm font-medium text-dark-300 mb-1">
        {label} {required && <span className="text-accent-red">*</span>}
      </label>
    )}
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`w-full bg-dark-700 border rounded-lg px-3 py-2 text-white text-sm placeholder-dark-400 focus:outline-none focus:ring-2 transition-colors ${
        error
          ? "border-accent-red focus:ring-accent-red/30"
          : "border-dark-500 focus:ring-accent-green/30 focus:border-accent-green"
      }`}
    />
    {error && <p className="mt-1 text-xs text-accent-red">{error}</p>}
  </div>
);

// ============================================================
// components/common/Select.jsx — Menu déroulant
// ============================================================
export const Select = ({ label, name, value, onChange, options, required, className = "" }) => (
  <div className={className}>
    {label && (
      <label htmlFor={name} className="block text-sm font-medium text-dark-300 mb-1">
        {label} {required && <span className="text-accent-red">*</span>}
      </label>
    )}
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/30 focus:border-accent-green transition-colors"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// ============================================================
// components/common/Modal.jsx — Fenêtre modale
// ============================================================
export const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-dark-800 border border-dark-600 rounded-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-dark-600">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ============================================================
// components/common/LoadingSpinner.jsx
// ============================================================
export const LoadingSpinner = ({ text = "Chargement..." }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-green" />
    <p className="text-dark-400 text-sm">{text}</p>
  </div>
);

// ============================================================
// components/common/EmptyState.jsx
// ============================================================
export const EmptyState = ({ icon = "📊", title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <span className="text-5xl mb-4">{icon}</span>
    <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
    <p className="text-dark-400 text-sm max-w-sm mb-6">{description}</p>
    {action}
  </div>
);

// ============================================================
// components/common/Alert.jsx
// ============================================================
export const Alert = ({ type = "error", message, onClose }) => {
  if (!message) return null;
  const styles = {
    error:   "bg-accent-red/10   border-accent-red/20   text-accent-red",
    success: "bg-accent-green/10 border-accent-green/20 text-accent-green",
    info:    "bg-accent-blue/10  border-accent-blue/20  text-accent-blue",
  };
  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-70 hover:opacity-100">✕</button>
      )}
    </div>
  );
};
