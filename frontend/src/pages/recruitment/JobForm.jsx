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
  textarea: {
    width: "100%", minHeight: 80, borderRadius: 10,
    border: "1px solid var(--border)", background: "var(--bg)",
    color: "var(--text)", padding: "10px 14px", fontSize: 13, resize: "vertical",
  },
  error: { fontSize: 13, color: "var(--danger)" },
  hint:  { fontSize: 11, color: "var(--dim)", marginTop: 2 },
};

const EMPTY = {
  title: "", description: "", departmentId: "", positionId: "",
  requiredSkills: "", contractType: "CDI", closingDate: "", status: "OUVERT",
};

export default function JobForm({ id, initialData, onSubmit, onCancel, loading }) {
  const isEdit = Boolean(initialData?.id);

  const departments = useApi(() => get("/api/departments"), []);
  const positions   = useApi(() => get("/api/positions"),   []);

  const [form,  setForm]  = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        title:          initialData.title          || "",
        description:    initialData.description    || "",
        departmentId:   initialData.departmentId   || "",
        positionId:     initialData.positionId     || "",
        requiredSkills: initialData.requiredSkills || "",
        contractType:   initialData.contractType   || "CDI",
        closingDate:    initialData.closingDate    || "",
        status:         initialData.status         || "OUVERT",
      });
    } else {
      setForm(EMPTY);
    }
    setError("");
  }, [initialData]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const filteredPositions = form.departmentId
    ? (positions.data || []).filter(
        (p) => String(p.departmentId) === String(form.departmentId)
      )
    : (positions.data || []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("L'intitulé du poste est obligatoire.");
      return;
    }
    setError("");
    try {
      await onSubmit({
        title:          form.title.trim(),
        description:    form.description    || null,
        departmentId:   form.departmentId   ? Number(form.departmentId)  : null,
        positionId:     form.positionId     ? Number(form.positionId)    : null,
        requiredSkills: form.requiredSkills || null,
        contractType:   form.contractType   || null,
        closingDate:    form.closingDate    || null,
        ...(isEdit ? { status: form.status } : {}),
      });
    } catch (err) {
      setError(err.message || "Impossible d'enregistrer l'offre.");
    }
  };

  return (
    <form id={id} style={F.grid} onSubmit={handleSubmit}>
      <div style={F.field}>
        <label style={F.label}>Intitulé du poste *</label>
        <input style={F.input} value={form.title} onChange={set("title")} placeholder="Ex. Développeur Full-Stack" />
      </div>

      <div style={F.field}>
        <label style={F.label}>Description</label>
        <textarea style={F.textarea} value={form.description} onChange={set("description")} placeholder="Description du poste et des responsabilités…" />
      </div>

      <div style={F.row}>
        <div style={F.field}>
          <label style={F.label}>Département</label>
          <select
            style={F.input}
            value={form.departmentId}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, departmentId: e.target.value, positionId: "" }));
            }}
          >
            <option value="">— Tous les départements —</option>
            {(departments.data || []).map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div style={F.field}>
          <label style={F.label}>Poste</label>
          <select style={F.input} value={form.positionId} onChange={set("positionId")}>
            <option value="">— Sélectionner un poste —</option>
            {filteredPositions.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={F.row}>
        <div style={F.field}>
          <label style={F.label}>Type de contrat</label>
          <select style={F.input} value={form.contractType} onChange={set("contractType")}>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="STAGE">Stage</option>
            <option value="FREELANCE">Freelance</option>
          </select>
        </div>
        <div style={F.field}>
          <label style={F.label}>Date de clôture</label>
          <input type="date" style={F.input} value={form.closingDate} onChange={set("closingDate")} />
        </div>
      </div>

      <div style={F.field}>
        <label style={F.label}>Compétences requises</label>
        <textarea style={{ ...F.textarea, minHeight: 60 }} value={form.requiredSkills} onChange={set("requiredSkills")} placeholder="Ex. React, Java, SQL…" />
      </div>

      {isEdit && (
        <div style={F.field}>
          <label style={F.label}>Statut</label>
          <select style={F.input} value={form.status} onChange={set("status")}>
            <option value="OUVERT">Ouvert</option>
            <option value="FERME">Fermé</option>
            <option value="ANNULE">Annulé</option>
          </select>
        </div>
      )}

      {error && <div style={F.error}>{error}</div>}
    </form>
  );
}
