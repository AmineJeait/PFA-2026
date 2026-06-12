import { useState } from "react";
import { get, put } from "../api/client";
import { useApi } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";
import Button from "../components/ui/Button";

const S = {
  page:    { color: "var(--text)", maxWidth: 640 },
  card:    { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, display: "grid", gap: 18 },
  row:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  field:   { display: "flex", flexDirection: "column", gap: 6 },
  label:   { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted)" },
  value:   { fontSize: 14, color: "var(--text)" },
  input:   {
    padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)",
    background: "var(--bg)", color: "var(--text)", fontSize: 13, width: "100%",
  },
  footer:  { display: "flex", gap: 10, marginTop: 8 },
};

function ReadField({ label, value }) {
  return (
    <div style={S.field}>
      <div style={S.label}>{label}</div>
      <div style={S.value}>{value || "—"}</div>
    </div>
  );
}

export default function ProfilePage() {
  const toast = useToast();
  const profile = useApi(() => get("/api/employees/me"), []);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form, setForm] = useState({ phone: "", address: "", dateOfBirth: "", cin: "" });

  const startEdit = () => {
    const d = profile.data;
    setForm({
      phone:       d?.phone       || "",
      address:     d?.address     || "",
      dateOfBirth: d?.dateOfBirth || "",
      cin:         d?.cin         || "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await put("/api/employees/me", form);
      await profile.refetch();
      setEditing(false);
      toast.success("Profil mis à jour avec succès.");
    } catch (err) {
      toast.error(err.message || "Impossible de mettre à jour le profil.");
    } finally {
      setSaving(false);
    }
  };

  const d = profile.data;

  return (
    <div style={S.page}>
      {profile.loading ? (
        <div style={{ color: "var(--muted)" }}>Chargement…</div>
      ) : (
        <div style={S.card}>
          <div style={S.row}>
            <ReadField label="Prénom"         value={d?.firstName} />
            <ReadField label="Nom"            value={d?.lastName} />
          </div>
          <ReadField label="Email"            value={d?.email} />
          <div style={S.row}>
            <ReadField label="Date d'embauche" value={d?.hireDate} />
            <ReadField label="Contrat"         value={d?.contractType} />
          </div>
          <ReadField label="Manager"          value={d?.managerName} />

          <hr style={{ border: "none", borderTop: "1px solid var(--border)" }} />

          {editing ? (
            <>
              <div style={S.row}>
                <div style={S.field}>
                  <label style={S.label}>Téléphone</label>
                  <input style={S.input} value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div style={S.field}>
                  <label style={S.label}>CIN</label>
                  <input style={S.input} value={form.cin}
                    onChange={(e) => setForm((f) => ({ ...f, cin: e.target.value }))} />
                </div>
              </div>
              <div style={S.field}>
                <label style={S.label}>Adresse</label>
                <input style={S.input} value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <div style={S.field}>
                <label style={S.label}>Date de naissance</label>
                <input type="date" style={S.input} value={form.dateOfBirth}
                  onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))} />
              </div>
              <div style={S.footer}>
                <Button variant="primary" loading={saving} onClick={handleSave}>Enregistrer</Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
              </div>
            </>
          ) : (
            <>
              <div style={S.row}>
                <ReadField label="Téléphone"        value={d?.phone} />
                <ReadField label="CIN"              value={d?.cin} />
              </div>
              <ReadField label="Adresse"            value={d?.address} />
              <ReadField label="Date de naissance"  value={d?.dateOfBirth} />
              <div style={S.footer}>
                <Button variant="primary" onClick={startEdit}>Modifier</Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
