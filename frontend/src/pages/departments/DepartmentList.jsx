import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { get, post, put, del } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import { useApi } from "../../hooks/useApi";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import DepartmentForm from "./DepartmentForm";

const S = {
  page: {
    color: "var(--text)",
  },
  controls: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 16,
    justifyContent: "flex-end",
  },
  error: {
    marginTop: 16,
    color: "var(--danger)",
  },
};

export default function DepartmentList() {
  const navigate  = useNavigate();
  const { user } = useAuth();
  const canManage = ["ADMIN", "RH"].includes(user?.role);

  const departments = useApi(() => get("/api/departments"), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const openCreate = () => {
    setSelectedDepartment(null);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (department) => {
    setSelectedDepartment(department);
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDepartment(null);
    setFormError("");
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (selectedDepartment) {
        await put(`/api/departments/${selectedDepartment.id}`, values);
      } else {
        await post("/api/departments", values);
      }
      await departments.refetch();
      closeModal();
    } catch (error) {
      setFormError(error.message || "Impossible d'enregistrer le département.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (department) => {
    if (!window.confirm(`Supprimer le département ${department.name} ?`)) return;
    setDeletingId(department.id);
    try {
      await del(`/api/departments/${department.id}`);
      await departments.refetch();
    } catch (error) {
      setFormError(error.message || "Impossible de supprimer le département.");
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    { key: "name", label: "Nom", sortable: true },
    { key: "description", label: "Description", sortable: true },
    {
      key: "actions",
      label: "Actions",
      render: (department) => (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/departments/${department.id}`); }}
          >
            Voir
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              openEdit(department);
            }}
          >
            Modifier
          </Button>
          {user?.role === "ADMIN" && (
            <Button
              variant="danger"
              size="sm"
              loading={deletingId === department.id}
              onClick={(event) => {
                event.stopPropagation();
                handleDelete(department);
              }}
            >
              Supprimer
            </Button>
          )}
        </div>
      ),
      tdStyle: { width: 220 },
    },
  ];

  return (
    <div style={S.page}>
      {canManage && (
        <div style={S.controls}>
          <Button variant="primary" onClick={openCreate}>
            Nouveau département
          </Button>
        </div>
      )}

      <Table
        columns={columns}
        data={departments.data || []}
        loading={departments.loading}
        emptyMessage={canManage ? "Aucun département trouvé." : "Aucun département disponible."}
        emptyHint={canManage ? "Créez un nouveau département pour commencer." : "Veuillez contacter un administrateur."}
        keyField="id"
      />

      {formError && <div style={S.error}>{formError}</div>}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={selectedDepartment ? "Modifier le département" : "Nouveau département"}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Annuler
            </Button>
            <Button
              type="button"
              onClick={() => document.getElementById("department-form").requestSubmit()}
              loading={saving}
            >
              {selectedDepartment ? "Mettre à jour" : "Créer"}
            </Button>
          </>
        }
      >
        <DepartmentForm
          id="department-form"
          initialData={selectedDepartment}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          loading={saving}
        />
      </Modal>
    </div>
  );
}
