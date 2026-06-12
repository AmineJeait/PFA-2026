import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const add = useCallback((message, type = "info") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => add(msg, "success"),
    error:   (msg) => add(msg, "error"),
    info:    (msg) => add(msg, "info"),
  };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <ToastList toasts={toasts} onRemove={remove} />
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const TYPE_COLORS = {
  success: { bg: "var(--success)", icon: "✓" },
  error:   { bg: "var(--danger)",  icon: "✕" },
  info:    { bg: "var(--accent)",  icon: "i" },
};

function ToastList({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      display: "flex", flexDirection: "column", gap: 10,
      zIndex: 9999, pointerEvents: "none",
    }}>
      {toasts.map((t) => {
        const { bg, icon } = TYPE_COLORS[t.type] || TYPE_COLORS.info;
        return (
          <div
            key={t.id}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 18px", borderRadius: 12,
              background: "var(--card)", border: "1px solid var(--border)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
              pointerEvents: "auto", minWidth: 260, maxWidth: 380,
              animation: "slideInRight 0.2s ease",
            }}
            onClick={() => onRemove(t.id)}
          >
            <span style={{
              width: 24, height: 24, borderRadius: "50%",
              background: bg, color: "#fff", fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {icon}
            </span>
            <span style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.4 }}>
              {t.message}
            </span>
          </div>
        );
      })}
    </div>
  );
}
