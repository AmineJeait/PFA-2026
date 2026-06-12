import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";

const S = {
  form: {
    display: "grid",
    gap: 16,
  },
  field: {
    display: "grid",
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: "var(--muted)",
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    minHeight: 38,
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    padding: "10px 14px",
    fontSize: 13,
  },
  textarea: {
    width: "100%",
    minHeight: 100,
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    padding: "10px 14px",
    fontSize: 13,
    resize: "vertical",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  error: {
    color: "var(--danger)",
    fontSize: 13,
  },
};

export default function DepartmentForm({ id, initialData = {}, onSubmit, onCancel, loading }) {
  const [name, setName] = useState(initialData.name || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(initialData.name || "");
    setDescription(initialData.description || "");
    setError("");
  }, [initialData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Le nom du département est requis.");
      return;
    }

    setError("");
    await onSubmit({
      name: name.trim(),
      description: description.trim(),
    });
  };

  return (
    <form id={id} style={S.form} onSubmit={handleSubmit}>
      <div style={S.field}>
        <label style={S.label} htmlFor="dept-name">Nom du département</label>
        <input
          id="dept-name"
          type="text"
          style={S.input}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex. Ressources Humaines"
          autoComplete="off"
        />
      </div>

      <div style={S.field}>
        <label style={S.label} htmlFor="dept-description">Description</label>
        <textarea
          id="dept-description"
          style={S.textarea}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description courte du département"
        />
      </div>

      {error && <div style={S.error}>{error}</div>}

      <div style={S.footer}>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Annuler
        </Button>
        <Button type="submit" loading={loading}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
