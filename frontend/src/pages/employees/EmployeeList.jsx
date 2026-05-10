import { useNavigate } from "react-router-dom";
import { get } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import { formatDate } from "../../utils/formatDate";

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
};

export default function EmployeeList() {
  const navigate = useNavigate();
  const employees = useApi(() => get("/api/employees"), []);

  const columns = [
    {
      key: "fullName",
      label: "Nom",
      render: (item) => `${item.firstName} ${item.lastName}`,
      sortable: true,
    },
    { key: "email", label: "Email", sortable: true },
    { key: "phone", label: "Téléphone", sortable: true },
    {
      key: "managerName",
      label: "Manager",
      sortable: true,
      render: (item) => item.managerName || "—",
    },
    {
      key: "hireDate",
      label: "Embauche",
      render: (item) => formatDate(item.hireDate),
      sortable: true,
    },
    { key: "status", label: "Statut", sortable: true },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/employees/${item.id}`);
          }}
        >
          Voir
        </Button>
      ),
      tdStyle: { width: 120 },
    },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Employés</h1>
          <p style={S.subtitle}>
            Parcourez les collaborateurs, suivez leurs informations et consultez les fiches individuelles.
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        data={employees.data || []}
        loading={employees.loading}
        emptyMessage="Aucun employé trouvé pour le moment."
        emptyHint="Vérifiez que les collaborateurs ont bien été ajoutés dans le back-office."
        onRowClick={(row) => navigate(`/employees/${row.id}`)}
      />
    </div>
  );
}
