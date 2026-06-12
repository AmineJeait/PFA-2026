import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";

const STATUS_OPTIONS = ["Tous", "PRESENT", "ABSENT", "RETARD", "DEMI_JOURNEE"];

const S = {
  page: { color: "var(--text)", display: "grid", gap: 24 },
  toolbar: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  search: {
    flex: "1 1 220px", minHeight: 36, borderRadius: 10, padding: "6px 14px",
    border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13,
  },
  select: {
    minHeight: 36, borderRadius: 10, padding: "6px 12px", fontSize: 13,
    border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)",
  },
  stats: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 },
  statCard: { padding: 18, borderRadius: 16, background: "var(--card)", border: "1px solid var(--border)" },
  statLabel: { fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 },
  statValue: { fontSize: 26, fontWeight: 700, color: "var(--text)" },
};

export default function AttendanceList() {
  const navigate = useNavigate();
  const attendance = useApi(() => get("/api/attendance"), []);

  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("Tous");

  const rows = attendance.data ?? [];

  const stats = useMemo(() => ({
    total:   rows.length,
    present: rows.filter((r) => r.status === "PRESENT").length,
    late:    rows.filter((r) => r.status === "RETARD").length,
    halfDay: rows.filter((r) => r.status === "DEMI_JOURNEE").length,
  }), [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchName   = !q || (r.employeeName || "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "Tous" || r.status === statusFilter;
      return matchName && matchStatus;
    });
  }, [rows, search, statusFilter]);

  const columns = [
    { key: "date",         label: "Date",     sortable: true },
    { key: "employeeName", label: "Employé",  sortable: true },
    { key: "status",       label: "Statut",   sortable: true },
    { key: "checkIn",      label: "Arrivée" },
    { key: "checkOut",     label: "Départ" },
    { key: "hoursWorked",  label: "Heures",   sortable: true },
    { key: "notes",        label: "Notes" },
  ];

  return (
    <div style={S.page}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <Button variant="ghost" onClick={() => navigate("/attendance/report")}>Rapport mensuel</Button>
      </div>

      <div style={S.stats}>
        <div style={S.statCard}>
          <div style={S.statLabel}>Enregistrements</div>
          <div style={S.statValue}>{attendance.loading ? "..." : stats.total}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLabel}>Présent</div>
          <div style={{ ...S.statValue, color: "var(--success)" }}>{attendance.loading ? "..." : stats.present}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLabel}>Retard</div>
          <div style={{ ...S.statValue, color: "var(--warning)" }}>{attendance.loading ? "..." : stats.late}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLabel}>Demi-journées</div>
          <div style={{ ...S.statValue, color: "var(--info)" }}>{attendance.loading ? "..." : stats.halfDay}</div>
        </div>
      </div>

      <div style={S.toolbar}>
        <input
          style={S.search}
          placeholder="Rechercher par nom d'employé…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={S.select}
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === "Tous" ? "Tous les statuts" : s}</option>
          ))}
        </select>
      </div>

      <Table
        columns={columns}
        data={filtered}
        loading={attendance.loading}
        emptyMessage="Aucune donnée de présence disponible"
        emptyHint="Modifiez les filtres ou rechargez la page."
      />
    </div>
  );
}
