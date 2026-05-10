import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { NAV_ITEMS, ROLE_LABELS, ROLE_COLORS } from "../../components/layout/constants";

const S = {
  sidebar: {
    width: 220,
    minWidth: 220,
    height: "100vh",
    background: "#18181e",
    borderRight: "1px solid #2a2a38",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    overflow: "hidden",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "20px 16px 16px",
    borderBottom: "1px solid #2a2a38",
    flexShrink: 0,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    background: "#6c63ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
    fontFamily: "'DM Sans', sans-serif",
  },
  logoText: {
    fontSize: 14,
    fontWeight: 600,
    color: "#f0effe",
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: 11,
    color: "#555470",
    marginTop: 1,
  },
  nav: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 0",
  },
  divider: {
    padding: "16px 16px 4px",
    fontSize: 10,
    fontWeight: 600,
    color: "#555470",
    letterSpacing: "0.6px",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 500,
    color: "#8886a0",
    textDecoration: "none",
    borderLeft: "3px solid transparent",
    transition: "all .12s",
    cursor: "pointer",
    userSelect: "none",
  },
  linkActive: {
    background: "rgba(108,99,255,0.12)",
    color: "#8b83ff",
    borderLeft: "3px solid #6c63ff",
  },
  linkHover: {
    background: "rgba(255,255,255,0.04)",
    color: "#c4c2dc",
  },
  icon: {
    fontSize: 15,
    width: 18,
    textAlign: "center",
    flexShrink: 0,
    opacity: 0.8,
  },
  bottom: {
    borderTop: "1px solid #2a2a38",
    padding: "12px 16px",
    flexShrink: 0,
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    marginBottom: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "rgba(108,99,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 600,
    color: "#8b83ff",
    flexShrink: 0,
  },
  userInfo: {
    overflow: "hidden",
    flex: 1,
    minWidth: 0,
  },
  userEmail: {
    fontSize: 12,
    color: "#c4c2dc",
    fontWeight: 500,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  roleBadge: (role) => ({
    display: "inline-block",
    marginTop: 2,
    fontSize: 10,
    fontWeight: 600,
    padding: "1px 7px",
    borderRadius: 20,
    background: ROLE_COLORS[role]?.bg || "rgba(136,134,160,0.15)",
    color: ROLE_COLORS[role]?.text || "#8886a0",
  }),
  logoutBtn: {
    width: "100%",
    padding: "7px 12px",
    background: "transparent",
    border: "1px solid #2a2a38",
    borderRadius: 8,
    color: "#8886a0",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all .12s",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: 7,
  },
};

function NavItem({ item }) {
  const [hovered, setHovered] = useState(false);

  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      style={({ isActive }) => ({
        ...S.link,
        ...(isActive ? S.linkActive : hovered ? S.linkHover : {}),
      })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={S.icon}>{item.icon}</span>
      {item.label}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role;

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "??";

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <aside style={S.sidebar}>
      {/* Logo */}
      <div style={S.logo}>
        <div style={S.logoIcon}>R</div>
        <div>
          <div style={S.logoText}>Gestion RH</div>
          <div style={S.logoSub}>Portail collaborateur</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={S.nav}>
        {visibleItems.map((item, i) =>
          item.type === "divider" ? (
            <div key={i} style={S.divider}>{item.label}</div>
          ) : (
            <NavItem key={item.path} item={item} />
          )
        )}
      </nav>

      {/* User + Logout */}
      <div style={S.bottom}>
        <div style={S.userRow}>
          <div style={S.avatar}>{initials}</div>
          <div style={S.userInfo}>
            <div style={S.userEmail}>{user?.email}</div>
            <span style={S.roleBadge(role)}>
              {ROLE_LABELS[role] || role}
            </span>
          </div>
        </div>
        <button
          style={S.logoutBtn}
          onClick={logout}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(240,82,82,0.08)";
            e.currentTarget.style.borderColor = "rgba(240,82,82,0.3)";
            e.currentTarget.style.color = "#f05252";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "#2a2a38";
            e.currentTarget.style.color = "#8886a0";
          }}
        >
          <span style={{ fontSize: 13 }}>⎋</span>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

