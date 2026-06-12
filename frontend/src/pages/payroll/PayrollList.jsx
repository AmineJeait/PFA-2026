import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { get, post, put } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import GenerateForm from "./GenerateForm";
import { formatMonthYear, formatDate } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";

const MONTHS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

const S = {
  page:     { color: "var(--text)" },
  actions:  { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 },
  field:    { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 },
  label:    { fontSize: 12, color: "var(--muted)" },
  select:   {
    padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)",
    background: "var(--bg)", color: "var(--text)", fontSize: 13, width: "100%",
  },
  result:   { display: "grid", gap: 8, marginTop: 16 },
  resultRow:{ display: "flex", justifyContent: "space-between", fontSize: 13 },
};

export default function PayrollList() {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const toast      = useToast();
  const canManage  = ["ADMIN", "RH"].includes(user?.role);

  const payroll = useApi(() => get("/api/payroll"), []);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [bulkOpen,    setBulkOpen]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [bulkSaving,  setBulkSaving]  = useState(false);
  const [bulkResult,  setBulkResult]  = useState(null);
  const now = new Date();
  const [bulkMonth, setBulkMonth] = useState(now.getMonth() + 1);
  const [bulkYear,  setBulkYear]  = useState(now.getFullYear());

  const openModal  = () => { setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); };

  const openBulk   = () => { setBulkResult(null); setBulkOpen(true); };
  const closeBulk  = () => { setBulkOpen(false); setBulkResult(null); };

  const handleGenerate = async (values) => {
    setSaving(true);
    try {
      await post("/api/payroll/generate", values);
      await payroll.refetch();
      closeModal();
      toast.success("Fiche de paie générée.");
    } catch (err) {
      toast.error(err.message || "Impossible de générer la fiche de paie.");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkGenerate = async () => {
    setBulkSaving(true);
    setBulkResult(null);
    try {
      const res = await post("/api/payroll/generate-bulk", { month: bulkMonth, year: bulkYear });
      setBulkResult(res.data);
      await payroll.refetch();
      toast.success(`Génération terminée : ${res.data?.generated || 0} bulletin(s) créé(s).`);
    } catch (err) {
      toast.error(err.message || "Erreur lors de la génération groupée.");
    } finally {
      setBulkSaving(false);
    }
  };

  const handleValidate = async (id) => {
    try {
      await put(`/api/payroll/${id}/validate`);
      await payroll.refetch();
      toast.success("Bulletin validé.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePay = async (id) => {
    try {
      await put(`/api/payroll/${id}/pay`);
      await payroll.refetch();
      toast.success("Bulletin marqué comme payé.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: "employeeName", label: "Employé",     sortable: true },
    {
      key: "monthYear",
      label: "Période",
      sortable: true,
      render: (item) => formatMonthYear(item.month, item.year),
    },
    {
      key: "netSalary",
      label: "Net à payer",
      sortable: true,
      render: (item) => formatCurrency(item.netSalary),
    },
    { key: "status", label: "Statut", sortable: true },
    {
      key: "paidAt",
      label: "Payé le",
      sortable: true,
      render: (item) => formatDate(item.paidAt),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {canManage && item.status === "BROUILLON" && (
            <Button variant="success" size="sm" onClick={(e) => { e.stopPropagation(); handleValidate(item.id); }}>Valider</Button>
          )}
          {canManage && item.status === "VALIDE" && (
            <Button variant="success" size="sm" onClick={(e) => { e.stopPropagation(); handlePay(item.id); }}>Payer</Button>
          )}
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/payroll/${item.id}`); }}>
            Voir
          </Button>
        </div>
      ),
      tdStyle: { width: 210 },
    },
  ];

  return (
    <div style={S.page}>
      {canManage && (
        <div style={S.actions}>
          <Button variant="ghost" onClick={openBulk}>Générer tout</Button>
          <Button variant="primary" onClick={openModal}>+ Générer une paie</Button>
        </div>
      )}

      <Table
        columns={columns}
        data={payroll.data || []}
        loading={payroll.loading}
        emptyMessage="Aucun bulletin de paie trouvé."
        emptyHint="Cliquez sur « Générer une paie » pour créer le premier bulletin."
        onRowClick={(row) => navigate(`/payroll/${row.id}`)}
      />

      {/* Individual generate modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Générer une fiche de paie"
        width={480}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Annuler</Button>
            <Button loading={saving} onClick={() => document.getElementById("generate-payroll-form").requestSubmit()}>
              Générer
            </Button>
          </>
        }
      >
        <GenerateForm id="generate-payroll-form" onSubmit={handleGenerate} onCancel={closeModal} loading={saving} />
      </Modal>

      {/* Bulk generate modal */}
      <Modal
        open={bulkOpen}
        onClose={closeBulk}
        title="Générer les paies en masse"
        width={400}
        footer={
          <>
            <Button variant="ghost" onClick={closeBulk}>Fermer</Button>
            {!bulkResult && (
              <Button loading={bulkSaving} onClick={handleBulkGenerate}>Générer</Button>
            )}
          </>
        }
      >
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18, lineHeight: 1.5 }}>
          Génère automatiquement les bulletins de paie pour tous les employés actifs qui n'ont pas encore de bulletin pour la période sélectionnée.
        </p>
        <div style={S.field}>
          <label style={S.label}>Mois</label>
          <select style={S.select} value={bulkMonth} onChange={(e) => setBulkMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div style={S.field}>
          <label style={S.label}>Année</label>
          <select style={S.select} value={bulkYear} onChange={(e) => setBulkYear(Number(e.target.value))}>
            {[2023, 2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {bulkResult && (
          <div style={S.result}>
            <div style={{ ...S.resultRow, color: "var(--success)", fontWeight: 600 }}>
              <span>Générés</span><span>{bulkResult.generated}</span>
            </div>
            <div style={{ ...S.resultRow, color: "var(--muted)" }}>
              <span>Déjà existants (ignorés)</span><span>{bulkResult.skipped}</span>
            </div>
            {bulkResult.failed > 0 && (
              <div style={{ ...S.resultRow, color: "var(--danger)" }}>
                <span>Erreurs</span><span>{bulkResult.failed}</span>
              </div>
            )}
            {bulkResult.errors?.map((e, i) => (
              <div key={i} style={{ fontSize: 12, color: "var(--danger)" }}>• {e}</div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
