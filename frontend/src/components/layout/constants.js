export const ROLES = {
  ADMIN:    "ADMIN",
  RH:       "RH",
  MANAGER:  "MANAGER",
  EMPLOYEE: "EMPLOYEE",
};

// which roles can see each nav item
const A = ROLES.ADMIN;
const R = ROLES.RH;
const M = ROLES.MANAGER;
const E = ROLES.EMPLOYEE;

export const NAV_ITEMS = [
  {
    label: "Tableau de bord",
    path: "/",
    icon: "⊞",
    roles: [A, R, M, E],
  },
  {
    label: "Employés",
    path: "/employees",
    icon: "◫",
    roles: [A, R],
  },
  {
    label: "Départements",
    path: "/departments",
    icon: "⬡",
    roles: [A, R],
  },
  {
    label: "Statistiques",
    path: "/stats",
    icon: "◈",
    roles: [A, R],
  },
  {
    type: "divider",
    label: "MON ESPACE",
    roles: [A, R, M, E],
  },
  {
    label: "Mon profil",
    path: "/profile",
    icon: "◉",
    roles: [A, R, M, E],
  },
  {
    label: "Mes congés",
    path: "/leaves/my",
    icon: "◷",
    roles: [A, R, M, E],
  },
  {
    label: "Ma présence",
    path: "/attendance/my",
    icon: "◎",
    roles: [A, R, M, E],
  },
  {
    type: "divider",
    label: "GESTION",
    roles: [A, R, M],
  },
  {
    label: "Congés",
    path: "/leaves",
    icon: "◫",
    roles: [A, R, M],
  },
  {
    label: "Salaires",
    path: "/payroll",
    icon: "◈",
    roles: [A, R],
  },
  {
    label: "Recrutement",
    path: "/recruitment",
    icon: "◉",
    roles: [A, R, M, E],
  },
  {
    label: "Présence",
    path: "/attendance",
    icon: "◐",
    roles: [A, R],
  },
  {
    label: "Rapport mensuel",
    path: "/attendance/report",
    icon: "◧",
    roles: [A, R],
  },
];

export const ROLE_LABELS = {
  [A]: "Administrateur",
  [R]: "RH",
  [M]: "Manager",
  [E]: "Employé",
};

export const ROLE_COLORS = {
  [A]: { bg: "rgba(240,82,82,0.12)",   text: "#f05252" },
  [R]: { bg: "rgba(108,99,255,0.15)",  text: "#8b83ff" },
  [M]: { bg: "rgba(56,189,248,0.12)",  text: "#38bdf8" },
  [E]: { bg: "rgba(34,199,122,0.12)",  text: "#22c77a" },
};
