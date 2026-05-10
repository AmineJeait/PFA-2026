import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { post } from "../api/client";
import Button from "../components/ui/Button";

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
    maxWidth: 420,
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
  error: {
    color: "var(--danger)",
    fontSize: 13,
    marginTop: -8,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: "var(--muted)",
    marginTop: 8,
    lineHeight: 1.5,
  },
};

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Veuillez saisir votre email et votre mot de passe.");
      return;
    }

    setLoading(true);
    try {
      const data = await post("/api/auth/login", { email, password });
      onLogin({ token: data.accessToken, email: data.email, role: data.role });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Impossible de se connecter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h1 style={S.title}>Connexion</h1>
        <p style={S.subtitle}>Accédez à votre espace RH sécurisé et gérez les congés, la présence et les recrutements.</p>

        <form style={S.form} onSubmit={handleSubmit}>
          <div style={S.field}>
            <label style={S.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              style={S.input}
              placeholder="votre.email@example.com"
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
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <div style={S.error}>{error}</div>}

          <Button type="submit" fullWidth loading={loading}>
            Se connecter
          </Button>
        </form>

        <p style={S.hint}>
          Pas de compte ? <Link to="/register" style={{ color: "var(--accent)", textDecoration: "underline" }}>Créez un compte</Link>
        </p>
      </div>
    </div>
  );
}
