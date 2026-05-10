import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { get, put } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { formatMonthYear, formatDate } from "../../utils/formatDate";
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
    alignItems: "flex-end",
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
  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  error: {
    color: "var(--danger)",
    marginTop: 16,
  },
};

export default function PayrollList() {
  const navigate = useNavigate();
  const payroll = useApi(() => get("/api/payroll"), []);
  const [error, setError] = useState("");

  const handleValidate = async (id) => {
    setError("");
    try {
      await put(`/api/payroll/${id}/validate`);
      await payroll.refetch();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePay = async (id) => {
    setError("");
    try {
      await put(`/api/payroll/${id}/pay`);
      await payroll.refetch();
    } catch (err) {
      setError(err.message);
    }
  };

  const columns = [
    { key: "employeeName", label: "Employé", sortable: true },
    {
      key: "monthYear",
      label: "Période",
      render: (item) => formatMonthYear(item.month, item.year),
      sortable: true,
    },
    {
      key: "netSalary",
      label: "Net à payer",
      render: (item) => formatCurrency(item.netSalary),
      sortable: true,
    },
    { key: "status", label: "Statut", sortable: true },
    {
      key: "paidAt",
      label: "Payé le",
      render: (item) => formatDate(item.paidAt),
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {item.status === "BROUILLON" && (
            <Button variant="success" size="sm" onClick={() => handleValidate(item.id)}>
              Valider
            </Button>
          )}
          {item.status === "VALIDE" && (
            <Button variant="success" size="sm" onClick={() => handlePay(item.id)}>
              Payer
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); navigate(`/payroll/${item.id}`); }}>
            Voir
          </Button>
        </div>
      ),
      tdStyle: { width: 200 },
    },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Paies</h1>
          <p style={S.subtitle}>
            Consultez les bulletins de paie générés, validez les documents et suivez les paiements.
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        data={payroll.data || []}
        loading={payroll.loading}
        emptyMessage="Aucun bulletin de paie trouvé."
        emptyHint="Générez des bulletins depuis le back-office ou vérifiez les données employé."
      />

      {error && <div style={S.error}>{error}</div>}
    </div>
  );
}
