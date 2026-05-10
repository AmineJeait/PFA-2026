import { useNavigate, useParams } from "react-router-dom";
import { get } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import Button from "../../components/ui/Button";
import { formatDate } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";

const S = {
  page: {
    padding: 24,
    minHeight: "100vh",
    color: "var(--text)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  title: {
    fontSize: 22,
    fontWeight: 600,
    margin: 0,
  },
  subtitle: {
    color: "var(--muted)",
    maxWidth: 720,
    lineHeight: 1.6,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 18,
  },
  card: {
    padding: 22,
    borderRadius: 16,
    background: "var(--card)",
    border: "1px solid var(--border)",
    display: "grid",
    gap: 12,
  },
  label: {
    fontSize: 12,
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: 6,
  },
  value: {
    fontSize: 14,
    color: "var(--text)",
  },
};

function Field({ label, value }) {
  return (
    <div>
      <div style={S.label}>{label}</div>
      <div style={S.value}>{value || "—"}</div>
    </div>
  );
}

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const employee = useApi(() => get(`/api/employees/${id}`), [id]);

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Fiche employé</h1>
          <p style={S.subtitle}>
            Détails complets du collaborateur sélectionné, avec ses informations de contact et sa situation RH.
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate("/employees")}>Retour</Button>
      </div>

      <div style={S.grid}>
        <div style={S.card}>
          <Field label="Nom" value={employee.data ? `${employee.data.firstName} ${employee.data.lastName}` : "..."} />
          <Field label="Email" value={employee.data?.email} />
          <Field label="Téléphone" value={employee.data?.phone} />
          <Field label="Manager" value={employee.data?.managerName} />
          <Field label="Date d'embauche" value={formatDate(employee.data?.hireDate)} />
          <Field label="Statut" value={employee.data?.status} />
        </div>

        <div style={S.card}>
          <Field label="Type de contrat" value={employee.data?.contractType} />
          <Field label="Salaire de base" value={formatCurrency(employee.data?.baseSalary)} />
          <Field label="Cin" value={employee.data?.cin} />
          <Field label="Date de naissance" value={formatDate(employee.data?.dateOfBirth)} />
          <Field label="Adresse" value={employee.data?.address} />
          <Field label="Créé le" value={formatDate(employee.data?.createdAt)} />
        </div>
      </div>

      {employee.error && <div style={{ color: "var(--danger)", marginTop: 16 }}>{employee.error}</div>}
    </div>
  );
}
