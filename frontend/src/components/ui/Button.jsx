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
    base:  { background: "#6c63ff", color: "#fff",     borderColor: "#6c63ff" },
    hover: { background: "#7b73ff", borderColor: "#7b73ff" },
  },
  ghost: {
    base:  { background: "transparent", color: "#8886a0", borderColor: "#2a2a38" },
    hover: { background: "rgba(255,255,255,0.04)", color: "#c4c2dc" },
  },
  danger: {
    base:  { background: "rgba(240,82,82,0.12)", color: "#f05252", borderColor: "rgba(240,82,82,0.3)" },
    hover: { background: "rgba(240,82,82,0.2)",  borderColor: "rgba(240,82,82,0.5)" },
  },
  success: {
    base:  { background: "rgba(34,199,122,0.12)", color: "#22c77a", borderColor: "rgba(34,199,122,0.3)" },
    hover: { background: "rgba(34,199,122,0.2)",  borderColor: "rgba(34,199,122,0.5)" },
  },
};

/**
 * Props:
 *   variant   "primary" | "ghost" | "danger" | "success"  (default: "primary")
 *   size      "sm" | "md" | "lg"                          (default: "md")
 *   loading   boolean
 *   disabled  boolean
 *   onClick   function
 *   type      "button" | "submit"                         (default: "button")
 *   fullWidth boolean
 *   children
 */
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
