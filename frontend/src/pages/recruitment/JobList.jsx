import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get, post } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { formatDate } from "../../utils/formatDate";

const S = {
  page: {
    padding: 24,
    minHeight: "100vh",
    color: "var(--text)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  title: {
    fontSize: 22,
    fontWeight: 600,
    margin: 0,
  },
  subtitle: {
    color: "var(--muted)",
    maxWidth: 720,
    lineHeight: 1.6,
  },
  field: {
    display: "grid",
    gap: 10,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "var(--muted)",
  },
  input: {
    width: "100%",
    minHeight: 38,
    borderRadius: 10,
    border: "1px solid #2a2a38",
    background: "#0f0f13",
    color: "#f0effe",
    padding: "10px 14px",
    fontSize: 13,
  },
  textarea: {
    width: "100%",
    minHeight: 110,
    borderRadius: 10,
    border: "1px solid #2a2a38",
    background: "#0f0f13",
    color: "#f0effe",
    padding: "10px 14px",
    fontSize: 13,
    resize: "vertical",
  },
  error: {
    color: "var(--danger)",
    marginTop: 16,
  },
};

export default function JobList() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const jobs = useApi(() => get("/api/jobs"), []);

  const isHiringManager = useMemo(
    () => ["ADMIN", "RH"].includes(user.role),
    [user.role]
  );

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setCandidateName("");
    setCandidateEmail("");
    setCandidatePhone("");
    setCvUrl("");
    setCoverLetter("");
    setError("");
    setModalOpen(true);
  };

  const submitApplication = async (event) => {
    event.preventDefault();
    if (!candidateName.trim() || !candidateEmail.trim()) {
      setError("Le nom et l'email sont requis.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await post(`/api/jobs/${selectedJob.id}/apply`, {
        candidateName: candidateName.trim(),
        candidateEmail: candidateEmail.trim(),
        candidatePhone: candidatePhone.trim(),
        cvUrl: cvUrl.trim(),
        coverLetter: coverLetter.trim(),
      });
      setModalOpen(false);
      jobs.refetch();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "title", label: "Intitulé", sortable: true },
    { key: "departmentName", label: "Département", sortable: true },
    { key: "positionTitle", label: "Poste", sortable: true },
    { key: "contractType", label: "Contrat", sortable: true },
    { key: "status", label: "Statut", sortable: true },
    {
      key: "closingDate",
      label: "Clôture",
      render: (item) => formatDate(item.closingDate),
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {isHiringManager ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/recruitment/${item.id}/applications`);
              }}
            >
              Candidatures
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => openApplyModal(item)}>
              Postuler
            </Button>
          )}
        </div>
      ),
      tdStyle: { width: 180 },
    },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Recrutement</h1>
          <p style={S.subtitle}>
            Parcourez les offres en cours et postulez directement à partir de la plateforme.
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        data={jobs.data || []}
        loading={jobs.loading}
        emptyMessage="Aucune offre d'emploi disponible pour le moment."
        emptyHint="Revenez plus tard pour consulter les nouvelles opportunités."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedJob ? `Postuler : ${selectedJob.title}` : "Postuler"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" loading={loading} onClick={submitApplication}>
              Envoyer la candidature
            </Button>
          </>
        }
      >
        <form onSubmit={submitApplication} style={{ display: "grid", gap: 14 }}>
          <div style={S.field}>
            <label style={S.label} htmlFor="candidate-name">Nom complet</label>
            <input
              id="candidate-name"
              type="text"
              style={S.input}
              value={candidateName}
              onChange={(event) => setCandidateName(event.target.value)}
            />
          </div>
          <div style={S.field}>
            <label style={S.label} htmlFor="candidate-email">Email</label>
            <input
              id="candidate-email"
              type="email"
              style={S.input}
              value={candidateEmail}
              onChange={(event) => setCandidateEmail(event.target.value)}
            />
          </div>
          <div style={S.field}>
            <label style={S.label} htmlFor="candidate-phone">Téléphone</label>
            <input
              id="candidate-phone"
              type="text"
              style={S.input}
              value={candidatePhone}
              onChange={(event) => setCandidatePhone(event.target.value)}
            />
          </div>
          <div style={S.field}>
            <label style={S.label} htmlFor="cv-url">Lien CV</label>
            <input
              id="cv-url"
              type="url"
              style={S.input}
              value={cvUrl}
              onChange={(event) => setCvUrl(event.target.value)}
            />
          </div>
          <div style={S.field}>
            <label style={S.label} htmlFor="cover-letter">Lettre de motivation</label>
            <textarea
              id="cover-letter"
              style={S.textarea}
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
            />
          </div>
          {error && <div style={S.error}>{error}</div>}
        </form>
      </Modal>
    </div>
  );
}
