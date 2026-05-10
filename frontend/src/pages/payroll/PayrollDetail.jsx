import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get, put } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/ui/Button";
import { formatDate, formatMonthYear } from "../../utils/formatDate";
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
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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
  footer: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 24,
  },
  error: {
    color: "var(--danger)",
    marginTop: 16,
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

export default function PayrollDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const payroll = useApi(() => get(`/api/payroll/${id}`), [id]);

  const handleValidate = async () => {
    setError("");
    try {
      await put(`/api/payroll/${id}/validate`);
      await payroll.refetch();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePay = async () => {
    setError("");
    try {
      await put(`/api/payroll/${id}/pay`);
      await payroll.refetch();
    } catch (err) {
      setError(err.message);
    }
  };

  const data = payroll.data;
  const canManage = ["ADMIN", "RH"].includes(user.role);

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Bulletin de paie</h1>
          <p style={S.subtitle}>
            Détail du bulletin sélectionné avec les éléments de rémunération et le statut de paiement.
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate("/payroll")}>Retour</Button>
      </div>

      <div style={S.grid}>
        <div style={S.card}>
          <Field label="Employé" value={data?.employeeName} />
          <Field label="Période" value={data ? formatMonthYear(data.month, data.year) : "..."} />
          <Field label="Statut" value={data?.status} />
          <Field label="Date de paiement" value={formatDate(data?.paidAt)} />
        </div>

        <div style={S.card}>
          <Field label="Salaire de base" value={formatCurrency(data?.baseSalary)} />
          <Field label="Primes" value={formatCurrency(data?.bonuses)} />
          <Field label="Déductions" value={formatCurrency(data?.deductions)} />
          <Field label="CNSS" value={formatCurrency(data?.cnss)} />
          <Field label="AMO" value={formatCurrency(data?.amo)} />
          <Field label="IR" value={formatCurrency(data?.ir)} />
          <Field label="Net à payer" value={formatCurrency(data?.netSalary)} />
        </div>
      </div>

      {canManage && (
        <div style={S.footer}>
          {data?.status === "BROUILLON" && (
            <Button variant="success" onClick={handleValidate}>
              Valider le bulletin
            </Button>
          )}
          {data?.status === "VALIDE" && (
            <Button variant="primary" onClick={handlePay}>
              Marquer comme payé
            </Button>
          )}
        </div>
      )}

      {error && <div style={S.error}>{error}</div>}
    </div>
  );
}
