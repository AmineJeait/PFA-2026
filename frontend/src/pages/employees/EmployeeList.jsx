import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { get, post, put, del } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import { useApi } from "../../hooks/useApi";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import EmployeeForm from "./EmployeeForm";
import { formatDate } from "../../utils/formatDate";

const S = {
  page: { color: "var(--text)" },
  toolbar: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  search: {
    flex: "1 1 260px", minHeight: 36, borderRadius: 10, padding: "6px 14px",
    border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13,
  },
  error: { color: "var(--danger)", marginTop: 16 },
};

export default function EmployeeList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const canManage = ["ADMIN", "RH"].includes(user?.role);

  const employees = useApi(() => get("/api/employees"), []);
  const [search, setSearch]         = useState("");
  const [modalOpen, setModalOpen]   = useState(false);
  const [selected, setSelected]     = useState(null);
  const [saving, setSaving]         = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError]           = useState("");

  const openCreate = () => { setSelected(null); setError(""); setModalOpen(true); };
  const openEdit   = (emp) => { setSelected(emp); setError(""); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setSelected(null); setError(""); };

  const handleSubmit = async (values) => {
    setSaving(true);
    setError("");
    try {
      if (selected) {
        await put(`/api/employees/${selected.id}`, values);
      } else {
        await post("/api/employees", values);
      }
      await employees.refetch();
      closeModal();
    } catch (err) {
      setError(err.message || "Impossible d'enregistrer l'employé.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (emp) => {
    if (!window.confirm(`Supprimer ${emp.firstName} ${emp.lastName} ?`)) return;
    setDeletingId(emp.id);
    setError("");
    try {
      await del(`/api/employees/${emp.id}`);
      await employees.refetch();
    } catch (err) {
      setError(err.message || "Impossible de supprimer l'employé.");
    } finally {
      setDeletingId(null);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = (employees.data || []).filter((e) =>
    !q ||
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
    (e.email || "").toLowerCase().includes(q)
  );

  const columns = [
    {
      key: "fullName",
      label: "Nom",
      sortable: true,
      render: (item) => `${item.firstName} ${item.lastName}`,
    },
    { key: "email",       label: "Email",     sortable: true },
    { key: "phone",       label: "Téléphone", sortable: true },
    { key: "contractType",label: "Contrat",   sortable: true },
    {
      key: "hireDate",
      label: "Embauche",
      sortable: true,
      render: (item) => formatDate(item.hireDate),
    },
    { key: "status", label: "Statut", sortable: true },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/employees/${item.id}`); }}>
            Voir
          </Button>
          {canManage && (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(item); }}>
              Modifier
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="danger"
              size="sm"
              loading={deletingId === item.id}
              onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
            >
              Supprimer
            </Button>
          )}
        </div>
      ),
      tdStyle: { width: 240 },
    },
  ];

  return (
    <div style={S.page}>
      {canManage && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <Button variant="primary" onClick={openCreate}>+ Nouvel employé</Button>
        </div>
      )}

      <div style={S.toolbar}>
        <input
          style={S.search}
          placeholder="Rechercher par nom ou email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        data={filtered}
        loading={employees.loading}
        emptyMessage="Aucun employé trouvé."
        emptyHint="Ajoutez un premier collaborateur avec le bouton ci-dessus."
        onRowClick={(row) => navigate(`/employees/${row.id}`)}
      />

      {error && <div style={S.error}>{error}</div>}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={selected ? "Modifier l'employé" : "Nouvel employé"}
        width={660}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Annuler</Button>
            <Button
              loading={saving}
              onClick={() => document.getElementById("employee-form").requestSubmit()}
            >
              {selected ? "Mettre à jour" : "Créer"}
            </Button>
          </>
        }
      >
        <EmployeeForm
          id="employee-form"
          initialData={selected}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          loading={saving}
        />
        {error && <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 8 }}>{error}</div>}
      </Modal>
    </div>
  );
}
