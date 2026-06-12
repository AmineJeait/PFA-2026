import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get, put } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import { formatDate, formatMonthYear } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";

const S = {
  page: { color: "var(--text)" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 18,
  },
  card: {
    padding: 22, borderRadius: 16,
    background: "var(--card)", border: "1px solid var(--border)",
    display: "grid", gap: 12,
  },
  label: {
    fontSize: 12, color: "var(--muted)",
    textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6,
  },
  value:  { fontSize: 14, color: "var(--text)" },
  footer: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 },
};

function Field({ label, value }) {
  return (
    <div>
      <div style={S.label}>{label}</div>
      <div style={S.value}>{value || "—"}</div>
    </div>
  );
}

export default function PayrollDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const toast      = useToast();
  const printRef   = useRef(null);
  const [exporting, setExporting] = useState(false);
  const payroll    = useApi(() => get(`/api/payroll/${id}`), [id]);

  const handleValidate = async () => {
    try {
      await put(`/api/payroll/${id}/validate`);
      await payroll.refetch();
      toast.success("Bulletin validé.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePay = async () => {
    try {
      await put(`/api/payroll/${id}/pay`);
      await payroll.refetch();
      toast.success("Bulletin marqué comme payé.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW  = pdf.internal.pageSize.getWidth();
      const pageH  = pdf.internal.pageSize.getHeight();
      const ratio  = canvas.width / canvas.height;
      const imgH   = pageW / ratio;
      pdf.addImage(imgData, "PNG", 0, 0, pageW, Math.min(imgH, pageH));
      pdf.save(`bulletin-${data?.employeeName}-${data?.month}-${data?.year}.pdf`);
      toast.success("PDF exporté.");
    } catch (err) {
      toast.error("Erreur lors de l'export PDF.");
    } finally {
      setExporting(false);
    }
  };

  const data = payroll.data;
  const canManage = ["ADMIN", "RH"].includes(user?.role);

  return (
    <div style={S.page}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24, justifyContent: "flex-end" }}>
        <Button variant="ghost" loading={exporting} onClick={handleExportPDF}>Télécharger PDF</Button>
        <Button variant="ghost" onClick={() => navigate("/payroll")}>Retour</Button>
      </div>

      <div ref={printRef} style={{ background: "var(--bg)", padding: 4 }}>
        <div style={S.grid}>
          <div style={S.card}>
            <Field label="Employé"         value={data?.employeeName} />
            <Field label="Période"         value={data ? formatMonthYear(data.month, data.year) : "..."} />
            <Field label="Statut"          value={data?.status} />
            <Field label="Date de paiement" value={formatDate(data?.paidAt)} />
          </div>

          <div style={S.card}>
            <Field label="Salaire de base" value={formatCurrency(data?.baseSalary)} />
            <Field label="Primes"          value={formatCurrency(data?.bonuses)} />
            <Field label="Déductions"      value={formatCurrency(data?.deductions)} />
            <Field label="CNSS"            value={formatCurrency(data?.cnss)} />
            <Field label="AMO"             value={formatCurrency(data?.amo)} />
            <Field label="IR"              value={formatCurrency(data?.ir)} />
            <Field label="Net à payer"     value={formatCurrency(data?.netSalary)} />
          </div>
        </div>
      </div>

      {canManage && (
        <div style={S.footer}>
          {data?.status === "BROUILLON" && (
            <Button variant="success" onClick={handleValidate}>Valider le bulletin</Button>
          )}
          {data?.status === "VALIDE" && (
            <Button variant="primary" onClick={handlePay}>Marquer comme payé</Button>
          )}
        </div>
      )}
    </div>
  );
}
