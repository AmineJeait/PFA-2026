import { useEffect, useState } from "react";

const F = {
  grid:  { display: "grid", gap: 14 },
  row:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  field: { display: "grid", gap: 6 },
  label: { fontSize: 12, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" },
  input: {
    width: "100%", minHeight: 38, borderRadius: 10,
    border: "1px solid var(--border)", background: "var(--bg)",
    color: "var(--text)", padding: "10px 14px", fontSize: 13,
  },
  textarea: {
    width: "100%", minHeight: 90, borderRadius: 10,
    border: "1px solid var(--border)", background: "var(--bg)",
    color: "var(--text)", padding: "10px 14px", fontSize: 13, resize: "vertical",
  },
  error: { fontSize: 13, color: "var(--danger)" },
  hint:  { fontSize: 11, color: "var(--dim)", marginTop: 2 },
};

const LEAVE_TYPES = [
  { value: "CONGE_PAYE",  label: "Congé payé" },
  { value: "MALADIE",     label: "Maladie" },
  { value: "MATERNITE",   label: "Maternité" },
  { value: "SANS_SOLDE",  label: "Sans solde" },
  { value: "AUTRE",       label: "Autre" },
];

const EMPTY = { type: "CONGE_PAYE", startDate: "", endDate: "", reason: "" };

export default function LeaveForm({ id, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(EMPTY);
    setError("");
  }, []);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) {
      setError("Les dates de début et de fin sont obligatoires.");
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("La date de fin doit être après la date de début.");
      return;
    }
    setError("");
    try {
      await onSubmit({
        type:      form.type,
        startDate: form.startDate,
        endDate:   form.endDate,
        reason:    form.reason || null,
      });
    } catch (err) {
      setError(err.message || "Impossible de soumettre la demande.");
    }
  };

  const duration =
    form.startDate && form.endDate
      ? Math.max(
          0,
          Math.round(
            (new Date(form.endDate) - new Date(form.startDate)) / 86400000
          ) + 1
        )
      : null;

  return (
    <form id={id} style={F.grid} onSubmit={handleSubmit}>
      <div style={F.field}>
        <label style={F.label}>Type de congé *</label>
        <select style={F.input} value={form.type} onChange={set("type")}>
          {LEAVE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div style={F.row}>
        <div style={F.field}>
          <label style={F.label}>Date de début *</label>
          <input type="date" style={F.input} value={form.startDate} onChange={set("startDate")} />
        </div>
        <div style={F.field}>
          <label style={F.label}>Date de fin *</label>
          <input type="date" style={F.input} value={form.endDate} onChange={set("endDate")} min={form.startDate} />
        </div>
      </div>

      {duration !== null && (
        <div style={{ ...F.hint, color: "var(--accent)", fontWeight: 600 }}>
          Durée : {duration} jour{duration > 1 ? "s" : ""}
        </div>
      )}

      <div style={F.field}>
        <label style={F.label}>Motif (optionnel)</label>
        <textarea
          style={F.textarea}
          value={form.reason}
          onChange={set("reason")}
          placeholder="Décrivez brièvement la raison de votre demande…"
        />
      </div>

      {error && <div style={F.error}>{error}</div>}
    </form>
  );
}
