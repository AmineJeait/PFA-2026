import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get, put } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import { useApi } from "../../hooks/useApi";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import EmployeeForm from "./EmployeeForm";
import { formatDate, formatDateRange, formatMonthYear } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";

const TABS = [
  { id: "profile",    label: "Profil" },
  { id: "leaves",     label: "Congés" },
  { id: "attendance", label: "Présence" },
  { id: "payroll",    label: "Paie" },
];

const S = {
  page:     { color: "var(--text)" },
  actions:  { display: "flex", gap: 10, marginBottom: 16 },
  tabBar:   {
    display: "flex", gap: 2, marginBottom: 20,
    borderBottom: "1px solid var(--border)",
  },
  tab: (active) => ({
    padding: "8px 18px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    background: "transparent",
    border: "none",
    borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
    color: active ? "var(--accent)" : "var(--muted)",
    marginBottom: -1,
    fontFamily: "'DM Sans', sans-serif",
    transition: "color .12s",
  }),
  grid:     { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 },
  card:     { padding: 22, borderRadius: 16, background: "var(--card)", border: "1px solid var(--border)", display: "grid", gap: 12 },
  cardTitle:{ fontSize: 13, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 },
  label:    { fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 },
  value:    { fontSize: 14, color: "var(--text)" },
  error:    { color: "var(--danger)", marginTop: 16 },
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
  const { user } = useAuth();
  const canManage = ["ADMIN", "RH"].includes(user?.role);

  const [tab, setTab] = useState("profile");

  const employee   = useApi(() => get(`/api/employees/${id}`), [id]);
  const allLeaves  = useApi(() => get("/api/leaves"), [id], { skip: tab !== "leaves" });
  const attendance = useApi(() => get(`/api/attendance/employee/${id}`), [id], { skip: tab !== "attendance" });
  const payroll    = useApi(() => get(`/api/payroll/employee/${id}`), [id], { skip: tab !== "payroll" });

  const empLeaves = (allLeaves.data || []).filter((l) => String(l.employeeId) === String(id));

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  const openEdit   = () => { setError(""); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setError(""); };

  const handleSubmit = async (values) => {
    setSaving(true);
    setError("");
    try {
      await put(`/api/employees/${id}`, values);
      await employee.refetch();
      closeModal();
    } catch (err) {
      setError(err.message || "Impossible de mettre à jour l'employé.");
    } finally {
      setSaving(false);
    }
  };

  const leaveColumns = [
    { key: "type",         label: "Type",    sortable: true },
    { key: "dateRange",    label: "Période", render: (r) => formatDateRange(r.startDate, r.endDate) },
    { key: "durationDays", label: "Durée",   sortable: true },
    { key: "status",       label: "Statut",  sortable: true },
    { key: "comments",     label: "Motif refus" },
  ];

  const attendanceColumns = [
    { key: "date",         label: "Date",    sortable: true },
    { key: "checkIn",      label: "Arrivée" },
    { key: "checkOut",     label: "Départ" },
    { key: "hoursWorked",  label: "Heures",  sortable: true },
    { key: "status",       label: "Statut",  sortable: true },
    { key: "notes",        label: "Notes" },
  ];

  const payrollColumns = [
    { key: "period",     label: "Période",    sortable: true, render: (r) => formatMonthYear(r.month, r.year) },
    { key: "baseSalary", label: "Base",       render: (r) => formatCurrency(r.baseSalary) },
    { key: "netSalary",  label: "Net",        sortable: true, render: (r) => formatCurrency(r.netSalary) },
    { key: "status",     label: "Statut",     sortable: true },
    { key: "paidAt",     label: "Payé le",    render: (r) => formatDate(r.paidAt) },
  ];

  const data = employee.data;

  return (
    <div style={S.page}>
      <div style={S.actions}>
        {canManage && data && (
          <Button variant="primary" onClick={openEdit}>Modifier</Button>
        )}
        <Button variant="ghost" onClick={() => navigate("/employees")}>Retour</Button>
      </div>

      {/* Tab bar */}
      <div style={S.tabBar}>
        {TABS.map((t) => (
          <button key={t.id} style={S.tab(tab === t.id)} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {employee.loading && <p style={{ color: "var(--muted)" }}>Chargement…</p>}
      {employee.error && <div style={S.error}>{employee.error}</div>}

      {/* Profile tab */}
      {tab === "profile" && data && (
        <div style={S.grid}>
          <div style={S.card}>
            <div style={S.cardTitle}>Informations personnelles</div>
            <Field label="Nom complet"       value={`${data.firstName} ${data.lastName}`} />
            <Field label="Email"             value={data.email} />
            <Field label="Téléphone"         value={data.phone} />
            <Field label="CIN"               value={data.cin} />
            <Field label="Adresse"           value={data.address} />
            <Field label="Date de naissance" value={formatDate(data.dateOfBirth)} />
          </div>
          <div style={S.card}>
            <div style={S.cardTitle}>Situation RH</div>
            <Field label="Manager"           value={data.managerName} />
            <Field label="Date d'embauche"   value={formatDate(data.hireDate)} />
            <Field label="Statut"            value={data.status} />
            <Field label="Type de contrat"   value={data.contractType} />
            <Field label="Salaire de base"   value={formatCurrency(data.baseSalary)} />
            <Field label="Créé le"           value={formatDate(data.createdAt)} />
          </div>
        </div>
      )}

      {/* Leaves tab */}
      {tab === "leaves" && (
        <Table
          columns={leaveColumns}
          data={empLeaves}
          loading={allLeaves.loading}
          emptyMessage="Aucun congé enregistré."
          emptyHint="Cet employé n'a pas encore soumis de demande de congé."
        />
      )}

      {/* Attendance tab */}
      {tab === "attendance" && (
        <Table
          columns={attendanceColumns}
          data={attendance.data || []}
          loading={attendance.loading}
          emptyMessage="Aucun pointage enregistré."
          emptyHint="Aucun enregistrement de présence pour cet employé."
        />
      )}

      {/* Payroll tab */}
      {tab === "payroll" && (
        <Table
          columns={payrollColumns}
          data={payroll.data || []}
          loading={payroll.loading}
          emptyMessage="Aucun bulletin de paie."
          emptyHint="Aucun bulletin de paie généré pour cet employé."
        />
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Modifier l'employé"
        width={660}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Annuler</Button>
            <Button
              loading={saving}
              onClick={() => document.getElementById("emp-detail-form").requestSubmit()}
            >
              Mettre à jour
            </Button>
          </>
        }
      >
        <EmployeeForm
          id="emp-detail-form"
          initialData={data}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          loading={saving}
        />
        {error && <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 8 }}>{error}</div>}
      </Modal>
    </div>
  );
}
