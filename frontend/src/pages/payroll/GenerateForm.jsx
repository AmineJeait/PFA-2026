import { useEffect, useState } from "react";
import { get } from "../../api/client";
import { useApi } from "../../hooks/useApi";

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
  error: { fontSize: 13, color: "var(--danger)" },
  hint:  { fontSize: 11, color: "var(--dim)", marginTop: 2 },
};

const MONTHS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

const currentYear  = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const EMPTY = {
  employeeId: "",
  month:      String(currentMonth),
  year:       String(currentYear),
  bonuses:    "",
  deductions: "",
};

export default function GenerateForm({ id, onSubmit, onCancel, loading }) {
  const employees = useApi(() => get("/api/employees"), []);
  const [form, setForm]   = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(EMPTY);
    setError("");
  }, []);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeId) {
      setError("Veuillez sélectionner un employé.");
      return;
    }
    setError("");
    try {
      await onSubmit({
        employeeId: Number(form.employeeId),
        month:      Number(form.month),
        year:       Number(form.year),
        bonuses:    form.bonuses    ? Number(form.bonuses)    : 0,
        deductions: form.deductions ? Number(form.deductions) : 0,
      });
    } catch (err) {
      setError(err.message || "Impossible de générer la fiche de paie.");
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <form id={id} style={F.grid} onSubmit={handleSubmit}>
      <div style={F.field}>
        <label style={F.label}>Employé *</label>
        <select style={F.input} value={form.employeeId} onChange={set("employeeId")}>
          <option value="">— Sélectionner un employé —</option>
          {(employees.data || []).map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>
        {employees.loading && <span style={F.hint}>Chargement…</span>}
      </div>

      <div style={F.row}>
        <div style={F.field}>
          <label style={F.label}>Mois *</label>
          <select style={F.input} value={form.month} onChange={set("month")}>
            {MONTHS.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
        <div style={F.field}>
          <label style={F.label}>Année *</label>
          <select style={F.input} value={form.year} onChange={set("year")}>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={F.row}>
        <div style={F.field}>
          <label style={F.label}>Primes / Bonus (MAD)</label>
          <input type="number" style={F.input} value={form.bonuses} onChange={set("bonuses")} min="0" placeholder="0.00" />
        </div>
        <div style={F.field}>
          <label style={F.label}>Déductions (MAD)</label>
          <input type="number" style={F.input} value={form.deductions} onChange={set("deductions")} min="0" placeholder="0.00" />
        </div>
      </div>

      <div style={{ ...F.hint, fontSize: 12, color: "var(--muted)" }}>
        Les cotisations CNSS (4.48%), AMO (2.26%) et IR (progressif) sont calculées automatiquement à partir du salaire de base de l'employé.
      </div>

      {error && <div style={F.error}>{error}</div>}
    </form>
  );
}
