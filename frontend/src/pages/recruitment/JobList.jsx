import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get, post, put, del } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import JobForm from "./JobForm";
import { formatDate } from "../../utils/formatDate";

const STATUS_LABELS = {
  EN_ATTENTE: "En attente",
  RETENU:     "Retenu",
  REJETE:     "Rejeté",
  ENTRETIEN:  "Entretien",
};

const S = {
  page:     { color: "var(--text)" },
  tabs:     { display: "flex", gap: 0, borderBottom: "2px solid var(--border)", marginBottom: 24 },
  tab:      (active) => ({
    padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
    background: "none", border: "none", color: active ? "var(--accent)" : "var(--muted)",
    borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
    marginBottom: -2,
  }),
  field:    { display: "grid", gap: 6 },
  label:    { fontSize: 12, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" },
  input:    { width: "100%", minHeight: 38, borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", padding: "10px 14px", fontSize: 13 },
  textarea: { width: "100%", minHeight: 100, borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", padding: "10px 14px", fontSize: 13, resize: "vertical" },
  badge: (status) => {
    const colors = {
      EN_ATTENTE: { bg: "rgba(245,166,35,0.12)",  color: "var(--warning)" },
      RETENU:     { bg: "rgba(34,199,122,0.12)",  color: "var(--success)" },
      REJETE:     { bg: "rgba(240,82,82,0.12)",   color: "var(--danger)"  },
      ENTRETIEN:  { bg: "rgba(56,189,248,0.12)",  color: "var(--info)"    },
    };
    const c = colors[status] || { bg: "var(--accent-dim)", color: "var(--accent)" };
    return {
      display: "inline-block", padding: "3px 10px", borderRadius: 999,
      fontSize: 11, fontWeight: 600, background: c.bg, color: c.color,
    };
  },
};

export default function JobList() {
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const toast        = useToast();
  const isHR         = useMemo(() => ["ADMIN", "RH"].includes(user?.role), [user?.role]);

  const [tab, setTab] = useState("jobs");

  const jobs     = useApi(() => get("/api/jobs"), []);
  const myApps   = useApi(() => get("/api/applications/my"), [], { skip: isHR });
  const meData   = useApi(() => get("/api/employees/me"), [], { skip: isHR });

  /* ── Job form modal ── */
  const [jobModal,    setJobModal]    = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobSaving,   setJobSaving]   = useState(false);
  const [deletingId,  setDeletingId]  = useState(null);

  const openCreate = () => { setSelectedJob(null); setJobModal(true); };
  const openEdit   = (job) => { setSelectedJob(job); setJobModal(true); };
  const closeJob   = () => { setJobModal(false); setSelectedJob(null); };

  const handleJobSubmit = async (values) => {
    setJobSaving(true);
    try {
      if (selectedJob) await put(`/api/jobs/${selectedJob.id}`, values);
      else             await post("/api/jobs", values);
      await jobs.refetch();
      closeJob();
      toast.success(selectedJob ? "Offre mise à jour." : "Offre créée.");
    } catch (err) {
      toast.error(err.message || "Impossible d'enregistrer l'offre.");
    } finally {
      setJobSaving(false);
    }
  };

  const handleDelete = async (job) => {
    if (!window.confirm(`Supprimer l'offre « ${job.title} » ?`)) return;
    setDeletingId(job.id);
    try {
      await del(`/api/jobs/${job.id}`);
      await jobs.refetch();
      toast.success("Offre supprimée.");
    } catch (err) {
      toast.error(err.message || "Impossible de supprimer l'offre.");
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Apply modal ── */
  const [applyModal,     setApplyModal]     = useState(false);
  const [applyJob,       setApplyJob]       = useState(null);
  const [applying,       setApplying]       = useState(false);
  const [candidateName,  setCandidateName]  = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");
  const [cvUrl,          setCvUrl]          = useState("");
  const [coverLetter,    setCoverLetter]    = useState("");

  const openApply = (job) => {
    setApplyJob(job);
    const emp = meData.data;
    setCandidateName(emp ? `${emp.firstName} ${emp.lastName}` : "");
    setCandidateEmail(emp?.email || user?.email || "");
    setCandidatePhone(emp?.phone || "");
    setCvUrl(""); setCoverLetter("");
    setApplyModal(true);
  };
  const closeApply = () => { setApplyModal(false); setApplyJob(null); };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateEmail.trim()) {
      toast.error("Le nom et l'email sont requis.");
      return;
    }
    setApplying(true);
    try {
      await post(`/api/jobs/${applyJob.id}/apply`, {
        candidateName:  candidateName.trim(),
        candidateEmail: candidateEmail.trim(),
        candidatePhone: candidatePhone.trim(),
        cvUrl:          cvUrl.trim(),
        coverLetter:    coverLetter.trim(),
      });
      await Promise.all([jobs.refetch(), myApps.refetch()]);
      closeApply();
      toast.success("Candidature envoyée !");
    } catch (err) {
      toast.error(err.message || "Impossible de soumettre la candidature.");
    } finally {
      setApplying(false);
    }
  };

  /* ── Already applied set ── */
  const appliedJobIds = useMemo(
    () => new Set((myApps.data || []).map((a) => a.jobOfferId)),
    [myApps.data]
  );

  /* ── Table columns ── */
  const jobColumns = [
    { key: "title",         label: "Intitulé",    sortable: true },
    { key: "departmentName",label: "Département", sortable: true },
    { key: "contractType",  label: "Contrat",     sortable: true },
    { key: "status",        label: "Statut",      sortable: true },
    { key: "closingDate",   label: "Clôture",     sortable: true, render: (r) => formatDate(r.closingDate) },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {isHR ? (
            <>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/recruitment/${item.id}/applications`); }}>
                Candidatures
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(item); }}>
                Modifier
              </Button>
              <Button variant="danger" size="sm" loading={deletingId === item.id} onClick={(e) => { e.stopPropagation(); handleDelete(item); }}>
                Supprimer
              </Button>
            </>
          ) : (
            appliedJobIds.has(item.id) ? (
              <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 600 }}>✓ Candidature envoyée</span>
            ) : (
              <Button variant="primary" size="sm" onClick={() => openApply(item)} disabled={item.status !== "OUVERT"}>
                Postuler
              </Button>
            )
          )}
        </div>
      ),
      tdStyle: { width: 260 },
    },
  ];

  const appColumns = [
    { key: "jobOfferTitle",  label: "Offre",     sortable: true },
    { key: "candidateName",  label: "Nom",       sortable: true },
    { key: "candidateEmail", label: "Email" },
    {
      key: "status",
      label: "Statut",
      render: (r) => <span style={S.badge(r.status)}>{STATUS_LABELS[r.status] || r.status}</span>,
    },
    { key: "appliedAt", label: "Soumise le", render: (r) => formatDate(r.appliedAt) },
    { key: "notes",     label: "Notes" },
  ];

  return (
    <div style={S.page}>
      {isHR && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <Button variant="primary" onClick={openCreate}>+ Nouvelle offre</Button>
        </div>
      )}

      {!isHR && (
        <div style={S.tabs}>
          <button style={S.tab(tab === "jobs")} onClick={() => setTab("jobs")}>Offres disponibles</button>
          <button style={S.tab(tab === "my")}   onClick={() => setTab("my")}>
            Mes candidatures {myApps.data?.length ? `(${myApps.data.length})` : ""}
          </button>
        </div>
      )}

      {(isHR || tab === "jobs") && (
        <Table
          columns={jobColumns}
          data={jobs.data || []}
          loading={jobs.loading}
          emptyMessage="Aucune offre d'emploi disponible."
          emptyHint={isHR ? "Créez une nouvelle offre avec le bouton ci-dessus." : "Revenez plus tard pour consulter les nouvelles opportunités."}
        />
      )}

      {!isHR && tab === "my" && (
        <Table
          columns={appColumns}
          data={myApps.data || []}
          loading={myApps.loading}
          emptyMessage="Vous n'avez encore soumis aucune candidature."
          emptyHint="Consultez les offres disponibles et cliquez sur « Postuler »."
        />
      )}

      {/* ── Job create/edit modal ── */}
      <Modal
        open={jobModal}
        onClose={closeJob}
        title={selectedJob ? "Modifier l'offre" : "Nouvelle offre d'emploi"}
        width={600}
        footer={
          <>
            <Button variant="ghost" onClick={closeJob}>Annuler</Button>
            <Button loading={jobSaving} onClick={() => document.getElementById("job-form").requestSubmit()}>
              {selectedJob ? "Mettre à jour" : "Créer"}
            </Button>
          </>
        }
      >
        <JobForm id="job-form" initialData={selectedJob} onSubmit={handleJobSubmit} onCancel={closeJob} loading={jobSaving} />
      </Modal>

      {/* ── Apply modal ── */}
      <Modal
        open={applyModal}
        onClose={closeApply}
        title={applyJob ? `Postuler : ${applyJob.title}` : "Postuler"}
        footer={
          <>
            <Button variant="ghost" onClick={closeApply}>Annuler</Button>
            <Button loading={applying} onClick={submitApplication}>Envoyer la candidature</Button>
          </>
        }
      >
        <form onSubmit={submitApplication} style={{ display: "grid", gap: 14 }}>
          <div style={S.field}>
            <label style={S.label}>Nom complet *</label>
            <input style={S.input} value={candidateName} onChange={(e) => setCandidateName(e.target.value)} placeholder="Votre nom complet" />
          </div>
          <div style={S.field}>
            <label style={S.label}>Email *</label>
            <input type="email" style={S.input} value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} placeholder="email@exemple.com" />
          </div>
          <div style={S.field}>
            <label style={S.label}>Téléphone</label>
            <input style={S.input} value={candidatePhone} onChange={(e) => setCandidatePhone(e.target.value)} placeholder="+212 6XX XXX XXX" />
          </div>
          <div style={S.field}>
            <label style={S.label}>Lien CV</label>
            <input style={S.input} value={cvUrl} onChange={(e) => setCvUrl(e.target.value)} placeholder="https://…" />
          </div>
          <div style={S.field}>
            <label style={S.label}>Lettre de motivation</label>
            <textarea style={S.textarea} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Pourquoi ce poste vous intéresse-t-il ?" />
          </div>
        </form>
      </Modal>
    </div>
  );
}
