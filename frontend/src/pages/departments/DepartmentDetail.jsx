import { useNavigate, useParams } from "react-router-dom";
import { get } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";

const S = {
  page:     { color: "var(--text)" },
  card:     { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 22, display: "grid", gap: 14, marginBottom: 24 },
  grid:     { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 },
  label:    { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted)", marginBottom: 4 },
  value:    { fontSize: 15, fontWeight: 600, color: "var(--text)" },
};

function Field({ label, value }) {
  return (
    <div>
      <div style={S.label}>{label}</div>
      <div style={S.value}>{value || "—"}</div>
    </div>
  );
}

export default function DepartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dept = useApi(() => get(`/api/departments/${id}`), [id]);
  const members = useApi(() => get(`/api/departments/${id}/employees`), [id]);

  const columns = [
    { key: "firstName", label: "Prénom",    sortable: true },
    { key: "lastName",  label: "Nom",       sortable: true },
    { key: "email",     label: "Email" },
    { key: "status",    label: "Statut",    sortable: true },
    { key: "contractType", label: "Contrat" },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/employees/${row.id}`)}>
          Voir
        </Button>
      ),
      tdStyle: { width: 80 },
    },
  ];

  const d = dept.data;

  return (
    <div style={S.page}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Button variant="ghost" onClick={() => navigate("/departments")}>Retour</Button>
      </div>

      <div style={S.card}>
        <div style={S.grid}>
          <Field label="Nom"       value={d?.name} />
          <Field label="Manager"   value={d?.managerName} />
          <Field label="Membres"   value={members.data?.length ?? "…"} />
          <Field label="Créé le"   value={d?.createdAt?.slice(0, 10)} />
        </div>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Membres</h2>
      <Table
        columns={columns}
        data={members.data || []}
        loading={members.loading}
        emptyMessage="Aucun membre dans ce département."
        emptyHint="Assignez des employés à ce département depuis la liste des employés."
        onRowClick={(row) => navigate(`/employees/${row.id}`)}
      />
    </div>
  );
}
