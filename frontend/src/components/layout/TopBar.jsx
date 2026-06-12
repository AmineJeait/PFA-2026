import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

const S = {
  bar: {
    height: 56,
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 2rem",
    background: "var(--surface)",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  left: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text)",
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 12,
    color: "var(--dim)",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  greeting: {
    fontSize: 12,
    color: "var(--muted)",
  },
  greetingName: {
    color: "var(--text-2)",
    fontWeight: 500,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "var(--success)",
    display: "inline-block",
    marginRight: 6,
  },
  themeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--card)",
    color: "var(--muted)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    transition: "all .12s",
    flexShrink: 0,
  },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

export default function TopBar({ title, subtitle }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const name = user?.email?.split("@")[0] ?? "";

  return (
    <header style={S.bar}>
      <div style={S.left}>
        <span style={S.title}>{title}</span>
        {subtitle && <span style={S.subtitle}>{subtitle}</span>}
      </div>

      <div style={S.right}>
        <span style={S.greeting}>
          <span style={S.dot} />
          {greeting()},{" "}
          <span style={S.greetingName}>{name}</span>
        </span>

        <button
          style={S.themeBtn}
          onClick={toggleTheme}
          title={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent-dim)";
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--card)";
            e.currentTarget.style.color = "var(--muted)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}
