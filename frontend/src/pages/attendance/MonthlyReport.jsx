import { useState } from "react";
import { get } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";

const MONTHS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

const now = new Date();

const S = {
  page:     { color: "var(--text)", display: "grid", gap: 24 },
  controls: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  select:   {
    minHeight: 36, borderRadius: 10, padding: "6px 12px", fontSize: 13,
    border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)",
  },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 },
  statCard:  { padding: "16px 20px", borderRadius: 14, background: "var(--card)", border: "1px solid var(--border)" },
  statLabel: { fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 },
  statValue: { fontSize: 26, fontWeight: 700, color: "var(--text)" },
  error:     { color: "var(--danger)" },
};

export default function MonthlyReport() {
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [query, setQuery] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });

  const report = useApi(
    () => get(`/api/attendance/report?month=${query.month}&year=${query.year}`),
    [query.month, query.year]
  );

  const rows = report.data || [];

  const totals = rows.reduce(
    (acc, r) => ({
      present: acc.present + Number(r.presentDays),
      absent:  acc.absent  + Number(r.absentDays),
      late:    acc.late    + Number(r.lateDays),
      half:    acc.half    + Number(r.halfDays),
      hours:   acc.hours   + Number(r.totalHoursWorked),
    }),
    { present: 0, absent: 0, late: 0, half: 0, hours: 0 }
  );

  const handleSearch = () => setQuery({ month: Number(month), year: Number(year) });

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const columns = [
    { key: "employeeName",    label: "Employé",      sortable: true },
    { key: "totalDays",       label: "Jours total",  sortable: true },
    {
      key: "presentDays",
      label: "Présents",
      sortable: true,
      render: (r) => <span style={{ color: "var(--success)", fontWeight: 600 }}>{r.presentDays}</span>,
    },
    {
      key: "absentDays",
      label: "Absents",
      sortable: true,
      render: (r) => <span style={{ color: r.absentDays > 0 ? "var(--danger)" : "var(--muted)" }}>{r.absentDays}</span>,
    },
    {
      key: "lateDays",
      label: "Retards",
      sortable: true,
      render: (r) => <span style={{ color: r.lateDays > 0 ? "var(--warning)" : "var(--muted)" }}>{r.lateDays}</span>,
    },
    { key: "halfDays",        label: "Demi-journées", sortable: true },
    {
      key: "totalHoursWorked",
      label: "Heures totales",
      sortable: true,
      render: (r) => `${Number(r.totalHoursWorked).toFixed(1)} h`,
    },
  ];

  return (
    <div style={S.page}>
      <div style={S.controls}>
        <select style={S.select} value={month} onChange={(e) => setMonth(e.target.value)}>
          {MONTHS.map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
        <select style={S.select} value={year} onChange={(e) => setYear(e.target.value)}>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <Button variant="primary" onClick={handleSearch} loading={report.loading}>
          Afficher
        </Button>
      </div>

      {/* Summary cards */}
      {rows.length > 0 && (
        <div style={S.statsGrid}>
          <div style={S.statCard}>
            <div style={S.statLabel}>Employés</div>
            <div style={S.statValue}>{rows.length}</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statLabel}>Total présents</div>
            <div style={{ ...S.statValue, color: "var(--success)" }}>{totals.present}</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statLabel}>Total absents</div>
            <div style={{ ...S.statValue, color: "var(--danger)" }}>{totals.absent}</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statLabel}>Total retards</div>
            <div style={{ ...S.statValue, color: "var(--warning)" }}>{totals.late}</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statLabel}>Heures totales</div>
            <div style={S.statValue}>{totals.hours.toFixed(0)} h</div>
          </div>
        </div>
      )}

      <Table
        columns={columns}
        data={rows}
        loading={report.loading}
        emptyMessage="Aucun pointage pour cette période."
        emptyHint="Sélectionnez un autre mois ou vérifiez que des employés ont pointé."
      />

      {report.error && <div style={S.error}>{report.error}</div>}
    </div>
  );
}
