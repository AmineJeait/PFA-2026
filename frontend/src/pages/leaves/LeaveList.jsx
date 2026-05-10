import { useState } from "react";
import { get, put, del } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
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

export default function LeaveList() {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const leaves = useApi(() => get("/api/leaves"), []);

  const handleApprove = async (leaveId) => {
    setError("");
    try {
      await put(`/api/leaves/${leaveId}/approve`);
      await leaves.refetch();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (leaveId) => {
    const comments = window.prompt("Motif du refus (optionnel)", "");
    if (comments === null) return;
    setError("");
    try {
      await put(`/api/leaves/${leaveId}/reject`, { comments });
      await leaves.refetch();
    } catch (err) {
      setError(err.message);
    }
  };

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

  const canManage = ["ADMIN", "RH", "MANAGER"].includes(user.role);

  const columns = [
    { key: "employeeName", label: "Employé", sortable: true },
    { key: "type", label: "Type", sortable: true },
    {
      key: "dateRange",
      label: "Période",
      render: (item) => formatDateRange(item.startDate, item.endDate),
      sortable: false,
    },
    { key: "durationDays", label: "Durée", sortable: true },
    { key: "status", label: "Statut", sortable: true },
    { key: "approvedByName", label: "Approuvé par", sortable: true },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {canManage && item.status === "EN_ATTENTE" && (
            <>
              <Button variant="success" size="sm" onClick={() => handleApprove(item.id)}>
                Approuver
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleReject(item.id)}>
                Refuser
              </Button>
            </>
          )}
          {item.status === "EN_ATTENTE" && (
            <Button variant="ghost" size="sm" onClick={() => handleCancel(item.id)}>
              Annuler
            </Button>
          )}
        </div>
      ),
      tdStyle: { width: 220 },
    },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Demandes de congés</h1>
          <p style={S.subtitle}>
            Gérez toutes les demandes de congés depuis l'administration. Approuvez, refusez ou annulez les demandes en attente.
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        data={leaves.data || []}
        loading={leaves.loading}
        emptyMessage="Aucune demande de congé trouvée."
        emptyHint="Les collaborateurs peuvent soumettre une demande depuis leur espace personnel."
      />

      {error && <div style={S.error}>{error}</div>}
    </div>
  );
}
