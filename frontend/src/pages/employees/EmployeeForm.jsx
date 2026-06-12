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
  sep:   { borderTop: "1px solid var(--border)", margin: "4px 0" },
  hint:  { fontSize: 11, color: "var(--dim)", marginTop: 2 },
};

const EMPTY = {
  firstName: "", lastName: "", email: "", password: "",
  phone: "", cin: "", dateOfBirth: "", address: "",
  hireDate: "", status: "ACTIF", contractType: "CDI",
  baseSalary: "", managerId: "", role: "EMPLOYEE",
};

export default function EmployeeForm({ id, initialData, onSubmit, onCancel, loading }) {
  const isEdit = Boolean(initialData?.id);
  const managers = useApi(() => get("/api/employees"), []);

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        firstName:   initialData.firstName   || "",
        lastName:    initialData.lastName    || "",
        email:       initialData.email       || "",
        password:    "",
        phone:       initialData.phone       || "",
        cin:         initialData.cin         || "",
        dateOfBirth: initialData.dateOfBirth || "",
        address:     initialData.address     || "",
        hireDate:    initialData.hireDate    || "",
        status:      initialData.status      || "ACTIF",
        contractType:initialData.contractType|| "CDI",
        baseSalary:  initialData.baseSalary  || "",
        managerId:   initialData.managerId   || "",
        role:        initialData.role        || "EMPLOYEE",
      });
    } else {
      setForm(EMPTY);
    }
    setError("");
  }, [initialData]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Prénom et nom sont obligatoires.");
      return;
    }
    if (!isEdit && !form.email.trim()) {
      setError("L'email est obligatoire.");
      return;
    }
    if (!isEdit && form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setError("");

    const payload = isEdit
      ? {
          firstName:    form.firstName.trim(),
          lastName:     form.lastName.trim(),
          phone:        form.phone    || null,
          cin:          form.cin      || null,
          dateOfBirth:  form.dateOfBirth || null,
          address:      form.address  || null,
          status:       form.status,
          contractType: form.contractType || null,
          baseSalary:   form.baseSalary ? Number(form.baseSalary) : null,
          managerId:    form.managerId  ? Number(form.managerId)  : null,
        }
      : {
          firstName:    form.firstName.trim(),
          lastName:     form.lastName.trim(),
          email:        form.email.trim(),
          password:     form.password,
          phone:        form.phone    || null,
          cin:          form.cin      || null,
          dateOfBirth:  form.dateOfBirth || null,
          address:      form.address  || null,
          hireDate:     form.hireDate || null,
          status:       form.status,
          contractType: form.contractType || null,
          baseSalary:   form.baseSalary ? Number(form.baseSalary) : null,
          managerId:    form.managerId  ? Number(form.managerId)  : null,
          role:         form.role,
        };

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement.");
    }
  };

  const otherEmployees = (managers.data || []).filter(
    (e) => !initialData || e.id !== initialData.id
  );

  return (
    <form id={id} style={F.grid} onSubmit={handleSubmit}>
      {/* Name row */}
      <div style={F.row}>
        <div style={F.field}>
          <label style={F.label}>Prénom *</label>
          <input style={F.input} value={form.firstName} onChange={set("firstName")} placeholder="Prénom" />
        </div>
        <div style={F.field}>
          <label style={F.label}>Nom *</label>
          <input style={F.input} value={form.lastName} onChange={set("lastName")} placeholder="Nom de famille" />
        </div>
      </div>

      {/* Email + password — create only */}
      {!isEdit && (
        <>
          <div style={F.field}>
            <label style={F.label}>Email *</label>
            <input type="email" style={F.input} value={form.email} onChange={set("email")} placeholder="email@exemple.com" />
          </div>
          <div style={F.row}>
            <div style={F.field}>
              <label style={F.label}>Mot de passe *</label>
              <input type="password" style={F.input} value={form.password} onChange={set("password")} placeholder="Min. 6 caractères" />
            </div>
            <div style={F.field}>
              <label style={F.label}>Rôle</label>
              <select style={F.input} value={form.role} onChange={set("role")}>
                <option value="EMPLOYEE">Employé</option>
                <option value="MANAGER">Manager</option>
                <option value="RH">RH</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
        </>
      )}

      <div style={F.sep} />

      {/* Contact */}
      <div style={F.row}>
        <div style={F.field}>
          <label style={F.label}>Téléphone</label>
          <input style={F.input} value={form.phone} onChange={set("phone")} placeholder="+212 6XX XXX XXX" />
        </div>
        <div style={F.field}>
          <label style={F.label}>CIN</label>
          <input style={F.input} value={form.cin} onChange={set("cin")} placeholder="AB123456" />
        </div>
      </div>

      <div style={F.field}>
        <label style={F.label}>Adresse</label>
        <input style={F.input} value={form.address} onChange={set("address")} placeholder="Adresse complète" />
      </div>

      {/* Dates */}
      <div style={F.row}>
        <div style={F.field}>
          <label style={F.label}>Date de naissance</label>
          <input type="date" style={F.input} value={form.dateOfBirth} onChange={set("dateOfBirth")} />
        </div>
        {!isEdit && (
          <div style={F.field}>
            <label style={F.label}>Date d'embauche</label>
            <input type="date" style={F.input} value={form.hireDate} onChange={set("hireDate")} />
          </div>
        )}
        {isEdit && (
          <div style={F.field}>
            <label style={F.label}>Statut</label>
            <select style={F.input} value={form.status} onChange={set("status")}>
              <option value="ACTIF">Actif</option>
              <option value="INACTIF">Inactif</option>
              <option value="EN_CONGE">En congé</option>
              <option value="SUSPENDU">Suspendu</option>
            </select>
          </div>
        )}
      </div>

      <div style={F.sep} />

      {/* Employment */}
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
          <label style={F.label}>Salaire de base (MAD)</label>
          <input type="number" style={F.input} value={form.baseSalary} onChange={set("baseSalary")} min="0" placeholder="5000" />
        </div>
      </div>

      {!isEdit && (
        <div style={F.field}>
          <label style={F.label}>Statut</label>
          <select style={F.input} value={form.status} onChange={set("status")}>
            <option value="ACTIF">Actif</option>
            <option value="INACTIF">Inactif</option>
            <option value="EN_CONGE">En congé</option>
            <option value="SUSPENDU">Suspendu</option>
          </select>
        </div>
      )}

      <div style={F.field}>
        <label style={F.label}>Manager</label>
        <select style={F.input} value={form.managerId} onChange={set("managerId")}>
          <option value="">— Aucun manager —</option>
          {otherEmployees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>
        {managers.loading && <span style={F.hint}>Chargement des managers…</span>}
      </div>

      {error && <div style={F.error}>{error}</div>}
    </form>
  );
}
