/**
 * Props:
 *   message  string   — main message      (default "Aucun résultat")
 *   hint     string   — secondary hint    (optional)
 *   action   node     — a Button to render below (optional)
 */
export default function EmptyState({
  message = "Aucun résultat",
  hint,
  action,
}) {
  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "3rem 2rem",
        gap:            8,
        textAlign:      "center",
      }}
    >
      <span style={{ fontSize: 32, opacity: 0.2, lineHeight: 1 }}>◫</span>
      <p
        style={{
          fontSize:   14,
          fontWeight: 500,
          color:      "#8886a0",
          margin:     0,
        }}
      >
        {message}
      </p>
      {hint && (
        <p style={{ fontSize: 12, color: "#555470", margin: 0 }}>{hint}</p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
