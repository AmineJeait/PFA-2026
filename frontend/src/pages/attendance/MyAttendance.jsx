import { useMemo, useState } from "react";
import { get, post, put } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";

const S = {
  page:     { color: "var(--text)", display: "grid", gap: 24 },
  actions:  { display: "flex", flexWrap: "wrap", gap: 10 },
  stats:    { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 },
  statCard: { padding: 18, borderRadius: 16, background: "var(--card)", border: "1px solid var(--border)" },
  statLabel:{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 },
  statValue:{ fontSize: 26, fontWeight: 700, color: "var(--text)" },
};

function formatTime(value) {
  if (!value) return "—";
  return String(value).slice(0, 5);
}

export default function MyAttendance() {
  const { user }  = useAuth();
  const toast     = useToast();
  const [actionLoading, setActionLoading] = useState(false);
  const attendance = useApi(() => get("/api/attendance/my"), [user?.role]);

  const rows  = attendance.data ?? [];
  const today = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return rows.find((item) => item.date === todayStr) ?? null;
  }, [rows]);

  const stats = useMemo(() => ({
    total:   rows.length,
    present: rows.filter((r) => r.status === "PRESENT").length,
    late:    rows.filter((r) => r.status === "RETARD").length,
    hours:   rows.reduce((s, r) => s + (Number(r.hoursWorked) || 0), 0),
  }), [rows]);

  const columns = [
    { key: "date",         label: "Date",    sortable: true },
    { key: "status",       label: "Statut",  sortable: true },
    { key: "checkIn",      label: "Arrivée", render: (r) => formatTime(r.checkIn) },
    { key: "checkOut",     label: "Départ",  render: (r) => formatTime(r.checkOut) },
    { key: "hoursWorked",  label: "Heures" },
    { key: "notes",        label: "Notes" },
  ];

  async function handleCheckIn() {
    setActionLoading(true);
    try {
      await post("/api/attendance/checkin");
      await attendance.refetch();
      toast.success("Arrivée enregistrée.");
    } catch (err) {
      toast.error(err.message || "Impossible d'enregistrer l'arrivée.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckOut() {
    setActionLoading(true);
    try {
      await put("/api/attendance/checkout");
      await attendance.refetch();
      toast.success("Départ enregistré.");
    } catch (err) {
      toast.error(err.message || "Impossible d'enregistrer le départ.");
    } finally {
      setActionLoading(false);
    }
  }

  const alreadyCheckedIn  = !!today?.checkIn;
  const alreadyCheckedOut = !!today?.checkOut;

  return (
    <div style={S.page}>
      <div style={S.actions}>
        <Button
          variant="success"
          onClick={handleCheckIn}
          loading={actionLoading}
          disabled={alreadyCheckedIn}
        >
          {alreadyCheckedIn ? `Arrivée à ${formatTime(today.checkIn)}` : "Enregistrer l'arrivée"}
        </Button>
        <Button
          variant="ghost"
          onClick={handleCheckOut}
          loading={actionLoading}
          disabled={!alreadyCheckedIn || alreadyCheckedOut}
        >
          {alreadyCheckedOut ? `Départ à ${formatTime(today.checkOut)}` : "Enregistrer le départ"}
        </Button>
      </div>

      <div style={S.stats}>
        <div style={S.statCard}>
          <div style={S.statLabel}>Total</div>
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
          <div style={S.statLabel}>Heures totales</div>
          <div style={S.statValue}>{attendance.loading ? "..." : stats.hours.toFixed(1)}</div>
        </div>
      </div>

      <div style={{ padding: 18, borderRadius: 16, background: "var(--card)", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              Statut du jour
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginTop: 6 }}>
              {attendance.loading
                ? "Chargement…"
                : today
                  ? today.status
                  : "Aucun pointage aujourd'hui"}
            </div>
          </div>
          <div style={{ color: "var(--muted)", fontSize: 13, alignSelf: "center" }}>
            {today
              ? `${formatTime(today.checkIn)} → ${formatTime(today.checkOut)}`
              : "Appuyez sur « Enregistrer l'arrivée » pour démarrer."}
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
  );
}
