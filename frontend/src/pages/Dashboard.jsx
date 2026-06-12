import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";
import Button from "../components/ui/Button";
import { NAV_ITEMS, ROLE_LABELS } from "../components/layout/constants";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#6c63ff", "#22c77a", "#f5a623", "#f05252", "#38bdf8"];

const LEAVE_FR = {
  CONGE_PAYE: "Congé payé",
  MALADIE:    "Maladie",
  MATERNITE:  "Maternité",
  SANS_SOLDE: "Sans solde",
  AUTRE:      "Autre",
};

const S = {
  page:      { display: "grid", gap: "24px" },
  hero: {
    display: "grid", gap: "18px", padding: "28px",
    borderRadius: 16, background: "var(--card)", border: "1px solid var(--border)",
  },
  heroTitle:   { fontSize: 22, fontWeight: 600, color: "var(--text)" },
  heroSubtitle:{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65 },
  badge: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "6px 12px", borderRadius: 999, background: "rgba(108,99,255,0.12)",
    color: "var(--accent)", fontSize: 12, fontWeight: 600,
    letterSpacing: "0.4px", textTransform: "uppercase",
  },
  grid:      { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" },
  card:      { padding: "22px", borderRadius: 16, background: "var(--card)", border: "1px solid var(--border)", display: "grid", gap: 16 },
  cardTitle: { fontSize: 15, fontWeight: 600, color: "var(--text)" },
  cardText:  { fontSize: 13, color: "var(--dim)", lineHeight: 1.7 },
  stats:     { display: "grid", gap: 12 },
  statItem: {
    padding: "18px", borderRadius: 12,
    background: "rgba(108,99,255,0.08)", color: "var(--text)",
    display: "grid", gap: 6,
  },
  statLabel: { fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.4px" },
  statValue: { fontSize: 28, fontWeight: 700, color: "var(--text)" },
  actions:   { display: "grid", gap: 10 },
  error:     { fontSize: 13, color: "var(--danger)" },
  chartCard: {
    padding: "22px", borderRadius: 16,
    background: "var(--card)", border: "1px solid var(--border)",
    gridColumn: "span 2",
  },
  chartsGrid:{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 18 },
};

function countItems(value) {
  return Array.isArray(value) ? value.length : 0;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;
  const name = user?.email?.split("@")[0] ?? "Utilisateur";

  const myLeaves      = useApi(() => get("/api/leaves/my"), [role]);
  const myAttendance  = useApi(() => get("/api/attendance/my"), [role]);
  const recruitment   = useApi(() => get("/api/jobs"), [role]);

  const canViewEmployees = role === "ADMIN" || role === "RH";
  const employees = useApi(() => get("/api/employees"), [role], { skip: !canViewEmployees });

  const canViewPayroll = role === "ADMIN" || role === "RH";
  const payroll = useApi(() => get("/api/payroll"), [role], { skip: !canViewPayroll });

  const canViewLeaves = role === "ADMIN" || role === "RH";
  const allLeaves = useApi(() => get("/api/leaves"), [role], { skip: !canViewLeaves });

  const visibleShortcuts = useMemo(
    () => NAV_ITEMS.filter((item) => item.path && item.roles.includes(role)).slice(0, 6),
    [role]
  );

  const stats = [
    { label: "Mes congés",      value: countItems(myLeaves.data),     loading: myLeaves.loading,     path: "/leaves/my" },
    { label: "Ma présence",     value: countItems(myAttendance.data),  loading: myAttendance.loading,  path: "/attendance/my" },
    { label: "Offres disponibles", value: countItems(recruitment.data), loading: recruitment.loading, path: "/recruitment" },
  ];
  if (canViewEmployees) stats.push({ label: "Employés", value: countItems(employees.data), loading: employees.loading, path: "/employees" });
  if (canViewPayroll)   stats.push({ label: "Bulletins", value: countItems(payroll.data),  loading: payroll.loading,   path: "/payroll" });

  // ── Charts data ──
  const leaveTypePieData = useMemo(() => {
    const leaves = allLeaves.data || [];
    const acc = {};
    leaves.forEach((l) => { acc[l.type] = (acc[l.type] || 0) + 1; });
    return Object.entries(acc).map(([type, value]) => ({ name: LEAVE_FR[type] || type, value }));
  }, [allLeaves.data]);

  const attendanceBarData = useMemo(() => {
    const att = myAttendance.data || [];
    const months = {};
    att.forEach((a) => {
      const m = a.date ? a.date.slice(0, 7) : "?";
      if (!months[m]) months[m] = { month: m, présences: 0 };
      if (a.status === "PRESENT") months[m].présences++;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [myAttendance.data]);

  return (
    <div style={S.page}>
      <section style={S.hero}>
        <div><div style={S.badge}>{ROLE_LABELS[role] || role}</div></div>
        <h1 style={S.heroTitle}>Bienvenue, {name}</h1>
        <p style={S.heroSubtitle}>
          Retrouvez votre activité récente, vos raccourcis et la synthèse de vos données RH.
        </p>
      </section>

      <section style={S.grid}>
        <div style={S.card}>
          <div style={S.cardTitle}>Statistiques rapides</div>
          <div style={S.stats}>
            {stats.map((item) => (
              <div key={item.label} style={S.statItem}>
                <span style={S.statLabel}>{item.label}</span>
                <span style={S.statValue}>{item.loading ? "..." : item.value}</span>
                <Button variant="ghost" size="sm" onClick={() => navigate(item.path)}>Voir</Button>
              </div>
            ))}
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Raccourcis</div>
          <div style={S.actions}>
            {visibleShortcuts.map((item) => (
              <Button key={item.path} variant="primary" size="sm" fullWidth onClick={() => navigate(item.path)}>
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {(canViewLeaves || attendanceBarData.length > 0) && (
        <section style={S.chartsGrid}>
          {attendanceBarData.length > 0 && (
            <div style={S.card}>
              <div style={S.cardTitle}>Mes présences (6 derniers mois)</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={attendanceBarData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Bar dataKey="présences" fill="var(--success)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {canViewLeaves && leaveTypePieData.length > 0 && (
            <div style={S.card}>
              <div style={S.cardTitle}>Répartition des congés</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={leaveTypePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}>
                    {leaveTypePieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
