import { useMemo, useState } from "react";
import { get, post, put } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";

const S = {
  page: { padding: 24, minHeight: "100vh", color: "var(--text)", display: "grid", gap: 24 },
  header: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 22, fontWeight: 600, margin: 0 },
  subtitle: { color: "var(--muted)", maxWidth: 720, lineHeight: 1.6 },
  actions: { display: "flex", flexWrap: "wrap", gap: 10 },
  stats: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 },
  statCard: { padding: 18, borderRadius: 16, background: "var(--card)", border: "1px solid var(--border)" },
  statLabel: { fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 },
  statValue: { fontSize: 26, fontWeight: 700, color: "var(--text)" },
};

function formatTime(value) {
  if (!value) return "—";
  return String(value).slice(0, 5);
}

export default function MyAttendance() {
  const { user } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);
  const attendance = useApi(() => get("/api/attendance/my"), [user?.role]);

  const rows = attendance.data ?? [];
  const today = useMemo(() => {
    if (!rows.length) return null;
    return rows.find((item) => item.date === new Date().toISOString().slice(0, 10));
  }, [rows]);

  const stats = useMemo(() => ({
    total: rows.length,
    present: rows.filter((item) => item.status === "PRESENT").length,
    late: rows.filter((item) => item.status === "RETARD").length,
    hours: rows.reduce((sum, item) => sum + (Number(item.hoursWorked) || 0), 0),
  }), [rows]);

  const columns = [
    { key: "date", label: "Date", sortable: true },
    { key: "status", label: "Statut", sortable: true },
    { key: "checkIn", label: "Arrivée" },
    { key: "checkOut", label: "Départ" },
    { key: "hoursWorked", label: "Heures" },
    { key: "notes", label: "Notes" },
  ];

  async function handleCheckIn() {
    setActionLoading(true);
    try {
      await post("/api/attendance/checkin");
      attendance.refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckOut() {
    setActionLoading(true);
    try {
      await put("/api/attendance/checkout");
      attendance.refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Ma présence</h1>
          <p style={S.subtitle}>
            Consultez vos enregistrements de présence et gérez votre pointage journalier.
          </p>
        </div>
        <div style={S.actions}>
          <Button variant="success" onClick={handleCheckIn} loading={actionLoading}>
            Enregistrer l'arrivée
          </Button>
          <Button variant="ghost" onClick={handleCheckOut} loading={actionLoading}>
            Enregistrer le départ
          </Button>
        </div>
      </div>

      <div style={S.stats}>
        <div style={S.statCard}>
          <div style={S.statLabel}>Total</div>
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
          <div style={S.statLabel}>Heures totales</div>
          <div style={S.statValue}>{attendance.loading ? "..." : stats.hours.toFixed(1)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ padding: 18, borderRadius: 16, background: "var(--card)", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                Statut du jour
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginTop: 6 }}>
                {attendance.loading ? "Chargement…" : today ? today.status : "Aucun pointage aujourd'hui"}
              </div>
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              {today ? `${formatTime(today.checkIn)} → ${formatTime(today.checkOut)}` : "Appuyez sur un bouton pour démarrer votre journée."}
            </div>
          </div>
        </div>

        <Table
          columns={columns}
          data={rows}
          loading={attendance.loading}
          emptyMessage="Aucun enregistrement de présence trouvé"
          emptyHint="Votre historique de pointage s'affichera ici après le premier check-in."
        />
      </div>
    </div>
  );
}
