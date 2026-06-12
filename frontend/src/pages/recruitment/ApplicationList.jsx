import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get, put } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import { formatDate } from "../../utils/formatDate";

const S = {
  page: {
    color: "var(--text)",
  },
  error: {
    color: "var(--danger)",
    marginTop: 16,
  },
};

const STATUS_TRANSITIONS = {
  RECU: ["EN_COURS", "REFUSE"],
  EN_COURS: ["ENTRETIEN", "REFUSE"],
  ENTRETIEN: ["ACCEPTE", "REFUSE"],
};

export default function ApplicationList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const applications = useApi(() => get(`/api/jobs/${id}/applications`), [id]);

  const handleUpdateStatus = async (applicationId, nextStatus) => {
    if (!window.confirm(`Confirmer le passage au statut ${nextStatus} ?`)) return;
    setError("");
    try {
      await put(`/api/applications/${applicationId}/status`, { status: nextStatus });
      await applications.refetch();
    } catch (err) {
      setError(err.message);
    }
  };

  const columns = [
    { key: "candidateName", label: "Candidat", sortable: true },
    { key: "candidateEmail", label: "Email", sortable: true },
    { key: "candidatePhone", label: "Téléphone", sortable: true },
    { key: "status", label: "Statut", sortable: true },
    { key: "appliedAt", label: "Date", render: (item) => formatDate(item.appliedAt), sortable: true },
    {
      key: "cvUrl",
      label: "CV",
      render: (item) => (
        item.cvUrl ? (
          <a href={item.cvUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
            Voir
          </a>
        ) : "—"
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {STATUS_TRANSITIONS[item.status]?.map((nextStatus) => (
            <Button
              key={nextStatus}
              variant="ghost"
              size="sm"
              onClick={() => handleUpdateStatus(item.id, nextStatus)}
            >
              {nextStatus}
            </Button>
          ))}
        </div>
      ),
      tdStyle: { width: 220 },
    },
  ];

  return (
    <div style={S.page}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Button variant="ghost" onClick={() => navigate("/recruitment")}>Retour</Button>
      </div>

      <Table
        columns={columns}
        data={applications.data || []}
        loading={applications.loading}
        emptyMessage="Aucune candidature pour cette offre."
        emptyHint="Les candidats peuvent postuler depuis la page de recrutement."
      />

      {error && <div style={S.error}>{error}</div>}
    </div>
  );
}
