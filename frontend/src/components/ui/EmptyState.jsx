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
          color:      "var(--muted)",
          margin:     0,
        }}
      >
        {message}
      </p>
      {hint && (
        <p style={{ fontSize: 12, color: "var(--dim)", margin: 0 }}>{hint}</p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
