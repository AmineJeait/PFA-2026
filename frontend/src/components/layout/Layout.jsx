import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./SideBar";
import TopBar from "./TopBar";

// maps pathname → { title, subtitle }
const PAGE_META = {
  "/":                      { title: "Tableau de bord",   subtitle: "Vue d'ensemble" },
  "/employees":             { title: "Employés",          subtitle: "Gestion des collaborateurs" },
  "/departments":           { title: "Départements",      subtitle: "Structure organisationnelle" },
  "/leaves":                { title: "Congés",            subtitle: "Demandes et approbations" },
  "/leaves/my":             { title: "Mes congés",        subtitle: "Historique et nouvelles demandes" },
  "/payroll":               { title: "Salaires",          subtitle: "Fiches de paie" },
  "/recruitment":           { title: "Recrutement",       subtitle: "Offres et candidatures" },
  "/attendance":            { title: "Présence",          subtitle: "Pointages et absences" },
  "/attendance/my":         { title: "Ma présence",       subtitle: "Mon pointage du jour" },
  "/attendance/report":     { title: "Rapport mensuel",   subtitle: "Statistiques de présence" },
};

function getMeta(pathname) {
  // exact match first
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  // partial match for dynamic routes like /employees/42 or /payroll/7
  const base = "/" + pathname.split("/")[1];
  if (PAGE_META[base]) return { ...PAGE_META[base], subtitle: "Détail" };
  return { title: "Gestion RH", subtitle: "" };
}

const S = {
  shell: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    background: "#0f0f13",
    fontFamily: "'DM Sans', sans-serif",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "2rem",
  },
};

export default function Layout() {
  const { pathname } = useLocation();
  const meta = getMeta(pathname);

  return (
    <div style={S.shell}>
      <Sidebar />

      <div style={S.main}>
        <TopBar title={meta.title} subtitle={meta.subtitle} />

        <main style={S.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
