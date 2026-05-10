import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";
import Button from "../components/ui/Button";
import { NAV_ITEMS, ROLE_LABELS } from "../components/layout/constants";

const S = {
  page: {
    display: "grid",
    gap: "24px",
  },
  hero: {
    display: "grid",
    gap: "18px",
    padding: "28px",
    borderRadius: 16,
    background: "var(--card)",
    border: "1px solid var(--border)",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 600,
    color: "var(--text)",
  },
  heroSubtitle: {
    fontSize: 14,
    color: "var(--muted)",
    lineHeight: 1.65,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(108,99,255,0.12)",
    color: "#8b83ff",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },
  card: {
    padding: "22px",
    borderRadius: 16,
    background: "var(--card)",
    border: "1px solid var(--border)",
    display: "grid",
    gap: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text)",
  },
  cardText: {
    fontSize: 13,
    color: "var(--dim)",
    lineHeight: 1.7,
  },
  stats: {
    display: "grid",
    gap: 12,
  },
  statItem: {
    padding: "18px",
    borderRadius: 12,
    background: "rgba(108,99,255,0.08)",
    color: "var(--text)",
    display: "grid",
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    color: "var(--text)",
  },
  actions: {
    display: "grid",
    gap: 10,
  },
  actionButton: {
    justifySelf: "start",
    width: "100%",
    maxWidth: 260,
  },
  error: {
    fontSize: 13,
    color: "var(--danger)",
  },
};

function countItems(value) {
  return Array.isArray(value) ? value.length : 0;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;
  const name = user?.email?.split("@")[0] ?? "Utilisateur";

  const myLeaves = useApi(() => get("/api/leaves/my"), [role]);
  const myAttendance = useApi(() => get("/api/attendance/my"), [role]);
  const recruitment = useApi(() => get("/api/jobs"), [role]);

  const canViewEmployees = role === "ADMIN" || role === "RH";
  const employees = useApi(
    () => get("/api/employees"),
    [role],
    { skip: !canViewEmployees }
  );

  const canViewPayroll = role === "ADMIN" || role === "RH";
  const payroll = useApi(
    () => get("/api/payroll"),
    [role],
    { skip: !canViewPayroll }
  );

  const visibleShortcuts = useMemo(
    () => NAV_ITEMS.filter((item) => item.path && item.roles.includes(role)).slice(0, 6),
    [role]
  );

  const stats = [
    {
      label: "Mes congés",
      value: countItems(myLeaves.data),
      loading: myLeaves.loading,
      error: myLeaves.error,
      path: "/leaves/my",
    },
    {
      label: "Ma présence",
      value: countItems(myAttendance.data),
      loading: myAttendance.loading,
      error: myAttendance.error,
      path: "/attendance/my",
    },
    {
      label: "Offres disponibles",
      value: countItems(recruitment.data),
      loading: recruitment.loading,
      error: recruitment.error,
      path: "/recruitment",
    },
  ];

  if (canViewEmployees) {
    stats.push({
      label: "Employés",
      value: countItems(employees.data),
      loading: employees.loading,
      error: employees.error,
      path: "/employees",
    });
  }

  if (canViewPayroll) {
    stats.push({
      label: "Bulletins",
      value: countItems(payroll.data),
      loading: payroll.loading,
      error: payroll.error,
      path: "/payroll",
    });
  }

  return (
    <div style={S.page}>
      <section style={S.hero}>
        <div>
          <div style={S.badge}>{ROLE_LABELS[role] || role}</div>
        </div>
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
                <span style={S.statValue}>
                  {item.loading ? "..." : item.value}
                </span>
                {item.error && <span style={S.error}>{item.error}</span>}
                <Button
                  variant="ghost"
                  size="sm"
                  style={S.actionButton}
                  onClick={() => navigate(item.path)}
                >
                  Voir
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Raccourcis</div>
          <div style={S.actions}>
            {visibleShortcuts.map((item) => (
              <Button
                key={item.path}
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
