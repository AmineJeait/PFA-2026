import { useEffect, useId } from "react";

/**
 * Props:
 *   size   number  — diameter in px (default 24)
 *   color  string  — stroke color    (default "#6c63ff")
 */
export default function Spinner({ size = 24, color = "#6c63ff" }) {
  const id = useId().replace(/:/g, "");
  const animName = `spin_${id}`;

  // inject keyframes once per unique id
  useEffect(() => {
    const tag = document.createElement("style");
    tag.dataset.spinner = animName;
    tag.textContent = `@keyframes ${animName} { to { transform: rotate(360deg); } }`;
    document.head.appendChild(tag);
    return () => tag.remove();
  }, [animName]);

  const thickness = Math.max(2, Math.round(size / 10));

  return (
    <span
      style={{
        display:      "inline-block",
        width:        size,
        height:       size,
        borderRadius: "50%",
        border:       `${thickness}px solid ${color}30`,
        borderTopColor: color,
        animation:    `${animName} .7s linear infinite`,
        flexShrink:   0,
      }}
      role="status"
      aria-label="Chargement…"
    />
  );
}
