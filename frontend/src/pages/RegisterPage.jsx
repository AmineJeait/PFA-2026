import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { post } from "../api/client";
import Button from "../components/ui/Button";

const ROLES = [
  { value: "EMPLOYEE", label: "Employé" },
  { value: "MANAGER",  label: "Manager" },
  { value: "RH",       label: "RH" },
];

const S = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "var(--bg)",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 18,
    padding: "32px",
  },
  title: {
    fontSize: 22,
    fontWeight: 600,
    marginBottom: 10,
    color: "var(--text)",
  },
  subtitle: {
    fontSize: 14,
    color: "var(--dim)",
    marginBottom: 28,
    lineHeight: 1.6,
  },
  form: {
    display: "grid",
    gap: 18,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  field: {
    display: "grid",
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    color: "var(--dim)",
  },
  input: {
    width: "100%",
    height: 38,
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    padding: "10px 14px",
    fontSize: 14,
  },
  select: {
    width: "100%",
    height: 38,
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    padding: "10px 14px",
    fontSize: 14,
  },
  error: {
    color: "var(--danger)",
    fontSize: 13,
    marginTop: -8,
    marginBottom: 8,
  },
};

export default function RegisterPage({ onLogin }) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setLoading(true);
    try {
      const data = await post("/api/auth/register", {
        firstName,
        lastName,
        email,
        password,
        role,
      });
      onLogin({ token: data.accessToken, email: data.email, role: data.role });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Impossible de créer le compte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h1 style={S.title}>Créer un compte</h1>
        <p style={S.subtitle}>
          Inscrivez-vous pour accéder au portail RH et gérer vos demandes de congés, votre présence et plus encore.
        </p>

        <form style={S.form} onSubmit={handleSubmit}>
          <div style={S.row}>
            <div style={S.field}>
              <label style={S.label} htmlFor="firstName">Prénom</label>
              <input
                id="firstName"
                type="text"
                style={S.input}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>
            <div style={S.field}>
              <label style={S.label} htmlFor="lastName">Nom</label>
              <input
                id="lastName"
                type="text"
                style={S.input}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
          </div>

          <div style={S.field}>
            <label style={S.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              style={S.input}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
            />
          </div>

          <div style={S.field}>
            <label style={S.label} htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              style={S.input}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div style={S.field}>
            <label style={S.label} htmlFor="role">Rôle</label>
            <select
              id="role"
              style={S.select}
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              {ROLES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {error && <div style={S.error}>{error}</div>}

          <Button type="submit" fullWidth loading={loading}>
            Créer le compte
          </Button>
        </form>
      </div>
    </div>
  );
}
