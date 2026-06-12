import { useState } from "react";
import { get, post, del } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../context/ToastContext";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import LeaveForm from "./LeaveForm";
import { formatDateRange } from "../../utils/formatDate";

const TYPE_LABELS = {
  CONGE_PAYE: "Congé payé",
  MALADIE:    "Maladie",
  MATERNITE:  "Maternité",
  SANS_SOLDE: "Sans solde",
  AUTRE:      "Autre",
};

const S = {
  page:     { color: "var(--text)" },
  balanceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 12,
    marginBottom: 24,
  },
  balanceCard: {
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: 12, padding: "14px 16px",
  },
  balLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.4px", color: "var(--muted)", marginBottom: 6 },
  balRow:   { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 4 },
  balUsed:  { fontSize: 11, color: "var(--dim)" },
  balRemain:{ fontSize: 20, fontWeight: 700 },
  balBar:   { marginTop: 8, height: 4, borderRadius: 4, background: "var(--border)", overflow: "hidden" },
};

export default function MyLeaves() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const leaves  = useApi(() => get("/api/leaves/my"), []);
  const balance = useApi(() => get("/api/leaves/balance"), []);

  const openModal  = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      await post("/api/leaves", values);
      await Promise.all([leaves.refetch(), balance.refetch()]);
      closeModal();
      toast.success("Demande de congé soumise.");
    } catch (err) {
      toast.error(err.message || "Impossible de soumettre la demande.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (leaveId) => {
    if (!window.confirm("Annuler cette demande de congé ?")) return;
    try {
      await del(`/api/leaves/${leaveId}`);
      await Promise.all([leaves.refetch(), balance.refetch()]);
      toast.success("Demande annulée.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: "type",  label: "Type",   sortable: true },
    {
      key: "dateRange",
      label: "Période",
      render: (item) => formatDateRange(item.startDate, item.endDate),
    },
    { key: "durationDays", label: "Durée", sortable: true },
    { key: "status",       label: "Statut", sortable: true },
    { key: "comments",     label: "Commentaires" },
    {
      key: "actions",
      label: "Actions",
      render: (item) =>
        item.status === "EN_ATTENTE" ? (
          <Button variant="ghost" size="sm" onClick={() => handleCancel(item.id)}>
            Annuler
          </Button>
        ) : null,
      tdStyle: { width: 120 },
    },
  ];

  const balanceList = balance.data || [];

  return (
    <div style={S.page}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Button variant="primary" onClick={openModal}>+ Nouvelle demande</Button>
      </div>

      {balanceList.length > 0 && (
        <div style={S.balanceGrid}>
          {balanceList.filter((b) => b.allowedDays > 0).map((b) => {
            const pct = b.allowedDays > 0 ? Math.min(100, Math.round((b.usedDays / b.allowedDays) * 100)) : 0;
            const color = pct >= 90 ? "var(--danger)" : pct >= 60 ? "var(--warning)" : "var(--success)";
            return (
              <div key={b.type} style={S.balanceCard}>
                <div style={S.balLabel}>{TYPE_LABELS[b.type] || b.type}</div>
                <div style={S.balRow}>
                  <span style={{ ...S.balRemain, color }}>{b.remainingDays}j</span>
                  <span style={S.balUsed}>{b.usedDays}/{b.allowedDays}</span>
                </div>
                <div style={S.balBar}>
                  <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Table
        columns={columns}
        data={leaves.data || []}
        loading={leaves.loading}
        emptyMessage="Aucune demande de congé enregistrée."
        emptyHint="Cliquez sur « Nouvelle demande » pour soumettre votre premier congé."
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Nouvelle demande de congé"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Annuler</Button>
            <Button
              loading={saving}
              onClick={() => document.getElementById("leave-form-my").requestSubmit()}
            >
              Soumettre
            </Button>
          </>
        }
      >
        <LeaveForm
          id="leave-form-my"
          onSubmit={handleSubmit}
          onCancel={closeModal}
          loading={saving}
        />
      </Modal>
    </div>
  );
}
