import { useEffect } from "react";

const S = {
  overlay: {
    position:       "fixed",
    inset:          0,
    background:     "rgba(0,0,0,0.65)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    zIndex:         1000,
    padding:        "1rem",
  },
  card: (width) => ({
    background:   "#1e1e24",
    border:       "1px solid #2a2a38",
    borderRadius: 16,
    width:        "100%",
    maxWidth:     width,
    maxHeight:    "90vh",
    display:      "flex",
    flexDirection:"column",
    fontFamily:   "'DM Sans', sans-serif",
  }),
  header: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    padding:        "18px 24px 16px",
    borderBottom:   "1px solid #2a2a38",
    flexShrink:     0,
  },
  title: {
    fontSize:   16,
    fontWeight: 600,
    color:      "#f0effe",
    margin:     0,
  },
  closeBtn: {
    background:  "transparent",
    border:      "none",
    color:       "#555470",
    fontSize:    20,
    cursor:      "pointer",
    lineHeight:  1,
    padding:     "2px 6px",
    borderRadius:6,
    fontFamily:  "inherit",
    transition:  "color .12s",
  },
  body: {
    padding:    "20px 24px",
    overflowY:  "auto",
    flex:       1,
  },
  footer: {
    padding:      "14px 24px",
    borderTop:    "1px solid #2a2a38",
    display:      "flex",
    justifyContent:"flex-end",
    gap:          8,
    flexShrink:   0,
  },
};

/**
 * Props:
 *   open      boolean
 *   onClose   function
 *   title     string
 *   width     number | string   (default 520)
 *   footer    ReactNode         — action buttons rendered in footer
 *   children                   — modal body content
 */
export default function Modal({ open, onClose, title, width = 520, footer, children }) {
  // close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={S.overlay}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={S.card(width)} onMouseDown={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={S.header}>
          <h2 style={S.title}>{title}</h2>
          <button
            style={S.closeBtn}
            onClick={onClose}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f0effe")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#555470")}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={S.body}>{children}</div>

        {/* Footer */}
        {footer && <div style={S.footer}>{footer}</div>}
      </div>
    </div>
  );
}
