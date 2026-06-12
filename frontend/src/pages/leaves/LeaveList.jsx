import { useState } from "react";
import { get, post, put, del } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import LeaveForm from "./LeaveForm";
import { formatDateRange } from "../../utils/formatDate";

const S = {
  page:     { color: "var(--text)" },
  error:    { color: "var(--danger)", marginTop: 16 },
};

export default function LeaveList() {
  const { user } = useAuth();
  const [error,     setError]     = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const leaves = useApi(() => get("/api/leaves"), []);

  const canManage = ["ADMIN", "RH", "MANAGER"].includes(user.role);

  const openModal  = () => { setError(""); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setError(""); };

  const handleNewLeave = async (values) => {
    setSaving(true);
    setError("");
    try {
      await post("/api/leaves", values);
      await leaves.refetch();
      closeModal();
    } catch (err) {
      setError(err.message || "Impossible de soumettre la demande.");
    } finally {
      setSaving(false);
    }
  };

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

  const columns = [
    { key: "employeeName", label: "Employé",  sortable: true },
    { key: "type",         label: "Type",      sortable: true },
    {
      key: "dateRange",
      label: "Période",
      render: (item) => formatDateRange(item.startDate, item.endDate),
    },
    { key: "durationDays",  label: "Durée",         sortable: true },
    { key: "status",        label: "Statut",        sortable: true },
    { key: "approvedByName",label: "Approuvé par",  sortable: true },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {canManage && item.status === "EN_ATTENTE" && (
            <>
              <Button variant="success" size="sm" onClick={() => handleApprove(item.id)}>Approuver</Button>
              <Button variant="danger"  size="sm" onClick={() => handleReject(item.id)}>Refuser</Button>
            </>
          )}
          {item.status === "EN_ATTENTE" && (
            <Button variant="ghost" size="sm" onClick={() => handleCancel(item.id)}>Annuler</Button>
          )}
        </div>
      ),
      tdStyle: { width: 240 },
    },
  ];

  return (
    <div style={S.page}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Button variant="primary" onClick={openModal}>+ Nouvelle demande</Button>
      </div>

      <Table
        columns={columns}
        data={leaves.data || []}
        loading={leaves.loading}
        emptyMessage="Aucune demande de congé trouvée."
        emptyHint="Les collaborateurs peuvent soumettre une demande depuis leur espace."
      />

      {error && <div style={S.error}>{error}</div>}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Nouvelle demande de congé"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Annuler</Button>
            <Button
              loading={saving}
              onClick={() => document.getElementById("leave-form-list").requestSubmit()}
            >
              Soumettre
            </Button>
          </>
        }
      >
        <LeaveForm
          id="leave-form-list"
          onSubmit={handleNewLeave}
          onCancel={closeModal}
          loading={saving}
        />
        {error && <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 8 }}>{error}</div>}
      </Modal>
    </div>
  );
}
