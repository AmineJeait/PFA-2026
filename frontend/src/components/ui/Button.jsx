import { useState } from "react";
import Spinner from "./Spinner";

const BASE = {
  display:        "inline-flex",
  alignItems:     "center",
  justifyContent: "center",
  gap:            7,
  border:         "1px solid transparent",
  borderRadius:   8,
  fontFamily:     "'DM Sans', sans-serif",
  fontWeight:     500,
  cursor:         "pointer",
  transition:     "all .12s",
  whiteSpace:     "nowrap",
  userSelect:     "none",
};

const SIZE = {
  sm: { fontSize: 12, padding: "5px 12px",  height: 30 },
  md: { fontSize: 13, padding: "7px 16px",  height: 36 },
  lg: { fontSize: 14, padding: "9px 20px",  height: 40 },
};

const VARIANT = {
  primary: {
    base:  { background: "var(--accent)",       color: "#fff",               borderColor: "var(--accent)" },
    hover: { background: "var(--accent-hover)",  borderColor: "var(--accent-hover)" },
  },
  ghost: {
    base:  { background: "transparent",         color: "var(--muted)",       borderColor: "var(--border)" },
    hover: { background: "var(--accent-dim)",   color: "var(--text-2)",      borderColor: "var(--border)" },
  },
  danger: {
    base:  { background: "rgba(240,82,82,0.12)", color: "var(--danger)",     borderColor: "rgba(240,82,82,0.3)" },
    hover: { background: "rgba(240,82,82,0.2)",  borderColor: "rgba(240,82,82,0.5)" },
  },
  success: {
    base:  { background: "rgba(34,199,122,0.12)", color: "var(--success)",   borderColor: "rgba(34,199,122,0.3)" },
    hover: { background: "rgba(34,199,122,0.2)",  borderColor: "rgba(34,199,122,0.5)" },
  },
};

export default function Button({
  variant  = "primary",
  size     = "md",
  loading  = false,
  disabled = false,
  onClick,
  type     = "button",
  fullWidth = false,
  style: customStyle = {},
  children,
  ...rest
}) {
  const [hovered, setHovered] = useState(false);

  const v = VARIANT[variant] || VARIANT.primary;
  const s = SIZE[size]       || SIZE.md;

  const isDisabled = disabled || loading;

  const style = {
    ...BASE,
    ...s,
    ...v.base,
    ...(hovered && !isDisabled ? v.hover : {}),
    ...(isDisabled ? { opacity: 0.5, cursor: "not-allowed" } : {}),
    ...(fullWidth  ? { width: "100%" } : {}),
    ...customStyle,
  };

  return (
    <button
      type={type}
      style={style}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...rest}
    >
      {loading && <Spinner size={14} color="currentColor" />}
      {children}
    </button>
  );
}
