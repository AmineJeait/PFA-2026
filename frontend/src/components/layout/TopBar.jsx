import { useAuth } from "../../hooks/useAuth";

const S = {
  bar: {
    height: 56,
    borderBottom: "1px solid #2a2a38",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 2rem",
    background: "#18181e",
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
    color: "#f0effe",
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 12,
    color: "#555470",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  greeting: {
    fontSize: 12,
    color: "#8886a0",
  },
  greetingName: {
    color: "#c4c2dc",
    fontWeight: 500,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#22c77a",
    display: "inline-block",
    marginRight: 6,
  },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

/**
 * Props:
 *   title    {string}  — page name, e.g. "Employés"
 *   subtitle {string}  — optional breadcrumb or description
 */
export default function TopBar({ title, subtitle }) {
  const { user } = useAuth();

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
      </div>
    </header>
  );
}
