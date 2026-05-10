import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";

const S = {
  page: { padding: 24, minHeight: "100vh", color: "var(--text)", display: "grid", gap: 24 },
  header: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 22, fontWeight: 600, margin: 0 },
  subtitle: { color: "var(--muted)", maxWidth: 720, lineHeight: 1.6 },
  stats: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 },
  statCard: { padding: 18, borderRadius: 16, background: "var(--card)", border: "1px solid var(--border)" },
  statLabel: { fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 },
  statValue: { fontSize: 26, fontWeight: 700, color: "var(--text)" },
};

export default function AttendanceList() {
  const navigate = useNavigate();
  const attendance = useApi(() => get("/api/attendance"), []);

  const rows = attendance.data ?? [];
  const stats = useMemo(() => ({
    total: rows.length,
    present: rows.filter((item) => item.status === "PRESENT").length,
    late: rows.filter((item) => item.status === "RETARD").length,
    halfDay: rows.filter((item) => item.status === "DEMI_JOURNEE").length,
  }), [rows]);

  const columns = [
    { key: "date", label: "Date", sortable: true },
    { key: "employeeName", label: "Employé", sortable: true },
    { key: "status", label: "Statut", sortable: true },
    { key: "checkIn", label: "Arrivée" },
    { key: "checkOut", label: "Départ" },
    { key: "hoursWorked", label: "Heures", sortable: true },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Présence</h1>
          <p style={S.subtitle}>
            Suivez les enregistrements de présence pour tous les employés, consultez les retards et les heures travaillées.
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate("/attendance/report")}>Rapport mensuel</Button>
      </div>

      <div style={S.stats}>
        <div style={S.statCard}>
          <div style={S.statLabel}>Enregistrements</div>
          <div style={S.statValue}>{attendance.loading ? "..." : stats.total}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLabel}>Présent</div>
          <div style={S.statValue}>{attendance.loading ? "..." : stats.present}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLabel}>Retard</div>
          <div style={S.statValue}>{attendance.loading ? "..." : stats.late}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLabel}>Demi-journées</div>
          <div style={S.statValue}>{attendance.loading ? "..." : stats.halfDay}</div>
        </div>
      </div>

      <Table
        columns={columns}
        data={rows}
        loading={attendance.loading}
        emptyMessage="Aucune donnée de présence disponible"
        emptyHint="Rechargez la page ou ajoutez des enregistrements de présence dans le back-office."
      />
    </div>
  );
}
