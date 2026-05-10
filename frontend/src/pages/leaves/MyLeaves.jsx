import { useState } from "react";
import { get, del } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import { formatDateRange } from "../../utils/formatDate";

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
  error: {
    color: "var(--danger)",
    marginTop: 16,
  },
};

export default function MyLeaves() {
  const [error, setError] = useState("");
  const leaves = useApi(() => get("/api/leaves/my"), []);

  const handleCancel = async (leaveId) => {
    if (!window.confirm("Annuler cette demande de congé ?")) return;
    setError("");
    try {
      await del(`/api/leaves/${leaveId}`);
      await leaves.refetch();
    } catch (err) {
      setError(err.message);
    }
  };

  const columns = [
    { key: "type", label: "Type", sortable: true },
    {
      key: "dateRange",
      label: "Période",
      render: (item) => formatDateRange(item.startDate, item.endDate),
      sortable: false,
    },
    { key: "durationDays", label: "Durée", sortable: true },
    { key: "status", label: "Statut", sortable: true },
    { key: "comments", label: "Commentaires", sortable: false },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {item.status === "EN_ATTENTE" && (
            <Button variant="ghost" size="sm" onClick={() => handleCancel(item.id)}>
              Annuler
            </Button>
          )}
        </div>
      ),
      tdStyle: { width: 120 },
    },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Mes congés</h1>
          <p style={S.subtitle}>
            Suivez vos demandes de congé et annulez celles qui sont encore en attente.
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        data={leaves.data || []}
        loading={leaves.loading}
        emptyMessage="Aucune demande de congé enregistrée."
        emptyHint="Créez une demande de congé depuis votre espace RH si nécessaire."
      />

      {error && <div style={S.error}>{error}</div>}
    </div>
  );
}
