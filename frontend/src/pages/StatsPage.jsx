import { useMemo } from "react";
import { get } from "../api/client";
import { useApi } from "../hooks/useApi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const S = {
  page:    { color: "var(--text)", display: "grid", gap: 28 },
  grid:    { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20 },
  card:    { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 22 },
  cardTitle: { fontSize: 14, fontWeight: 600, marginBottom: 20, color: "var(--text)" },
  statRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 },
  stat:    { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" },
  statLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted)", marginBottom: 6 },
  statValue: { fontSize: 26, fontWeight: 700, color: "var(--text)" },
};

const COLORS = ["#6c63ff", "#22c77a", "#f5a623", "#f05252", "#38bdf8", "#a78bfa"];

const STATUS_FR = {
  PRESENT:      "Présent",
  ABSENT:       "Absent",
  RETARD:       "Retard",
  DEMI_JOURNEE: "Demi-journée",
};

const LEAVE_FR = {
  CONGE_PAYE: "Congé payé",
  MALADIE:    "Maladie",
  MATERNITE:  "Maternité",
  SANS_SOLDE: "Sans solde",
  AUTRE:      "Autre",
};

function count(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || "Inconnu";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

export default function StatsPage() {
  const employees  = useApi(() => get("/api/employees"), []);
  const attendance = useApi(() => get("/api/attendance"), []);
  const leaves     = useApi(() => get("/api/leaves"), []);
  const departments = useApi(() => get("/api/departments"), []);

  const empList  = employees.data  || [];
  const attList  = attendance.data || [];
  const leavList = leaves.data     || [];
  const deptList = departments.data || [];

  const headcountData = useMemo(() => {
    const byDept = count(empList, "departmentName");
    const noDept = empList.filter((e) => !e.departmentName).length;
    const result = Object.entries(byDept).map(([name, value]) => ({ name, value }));
    if (noDept > 0) result.push({ name: "Sans département", value: noDept });
    return result;
  }, [empList]);

  const contractData = useMemo(() => {
    const c = count(empList, "contractType");
    return Object.entries(c).map(([name, value]) => ({ name: name || "Non défini", value }));
  }, [empList]);

  const attendanceData = useMemo(() => {
    const c = count(attList, "status");
    return Object.entries(c).map(([status, value]) => ({
      name: STATUS_FR[status] || status,
      value,
    }));
  }, [attList]);

  const leaveTypeData = useMemo(() => {
    const c = count(leavList, "type");
    return Object.entries(c).map(([type, value]) => ({
      name: LEAVE_FR[type] || type,
      value,
    }));
  }, [leavList]);

  const leaveStatusData = useMemo(() => {
    const c = count(leavList, "status");
    return Object.entries(c).map(([status, value]) => ({ name: status, value }));
  }, [leavList]);

  const activeCount  = empList.filter((e) => e.status === "ACTIF").length;
  const pendingLeave = leavList.filter((l) => l.status === "EN_ATTENTE").length;
  const presentToday = attList.filter((a) => a.status === "PRESENT").length;

  return (
    <div style={S.page}>
      <div style={S.statRow}>
        <div style={S.stat}>
          <div style={S.statLabel}>Employés actifs</div>
          <div style={S.statValue}>{employees.loading ? "…" : activeCount}</div>
        </div>
        <div style={S.stat}>
          <div style={S.statLabel}>Départements</div>
          <div style={S.statValue}>{departments.loading ? "…" : deptList.length}</div>
        </div>
        <div style={S.stat}>
          <div style={S.statLabel}>Congés en attente</div>
          <div style={{ ...S.statValue, color: "var(--warning)" }}>{leaves.loading ? "…" : pendingLeave}</div>
        </div>
        <div style={S.stat}>
          <div style={S.statLabel}>Présences (total)</div>
          <div style={{ ...S.statValue, color: "var(--success)" }}>{attendance.loading ? "…" : presentToday}</div>
        </div>
      </div>

      <div style={S.grid}>
        <div style={S.card}>
          <div style={S.cardTitle}>Effectif par département</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={headcountData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Employés" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Types de contrats</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={contractData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {contractData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Statuts de présence</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={attendanceData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="value" fill="var(--success)" radius={[4, 4, 0, 0]} name="Enregistrements" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Types de congés demandés</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={leaveTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {leaveTypeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
