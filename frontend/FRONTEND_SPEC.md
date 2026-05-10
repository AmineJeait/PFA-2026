# Gestion RH — Frontend Specification

## Overview

Build a React (Vite) single-page application for an HR management system. The backend is a Spring Boot REST API running at `http://localhost:8080`. All endpoints are documented in the API reference below. The app has 4 roles: `ADMIN`, `RH`, `MANAGER`, `EMPLOYEE` — UI visibility and API access must respect these roles throughout.

A `LoginPage.jsx` already exists and is complete. Do not rewrite it.

---

## Tech Stack

- **React 18** with Vite
- **React Router v6** for routing
- **No UI library** — custom components only
- **No state management library** — React Context + hooks only
- **Fonts**: `DM Sans` from Google Fonts (weights 400, 500, 600)
- **Mono font**: `JetBrains Mono` (used for salary figures, IDs)

---

## Design System

### Color tokens (define as CSS variables in `index.css`)

```css
:root {
  --bg:          #0f0f13;
  --surface:     #18181e;
  --card:        #1e1e24;
  --border:      #2a2a38;
  --accent:      #6c63ff;
  --accent-hover:#7b73ff;
  --accent-dim:  rgba(108,99,255,0.15);
  --text:        #f0effe;
  --muted:       #8886a0;
  --dim:         #555470;
  --success:     #22c77a;
  --warning:     #f5a623;
  --danger:      #f05252;
  --info:        #38bdf8;
}
```

### Status → color mapping

| Status value | Color var |
|---|---|
| ACTIF, APPROUVE, PAYE, PRESENT, ACCEPTE, OUVERT | `--success` |
| EN_ATTENTE, BROUILLON, RETARD, EN_COURS | `--warning` |
| INACTIF, FERME, DEMI_JOURNEE, RECU, VALIDE | `--muted` |
| SUSPENDU, REJETE, DANGER, ABSENT, REFUSE, ANNULE | `--danger` |
| ENTRETIEN, EN_CONGE | `--info` |

### Typography

- Body: 14px / 400
- Labels: 11px / 500 / uppercase / letter-spacing 0.4px
- Headings h1: 22px / 600, h2: 18px / 600, h3: 16px / 500
- Mono values (salaries, IDs): `JetBrains Mono`

### Component rules

- Border radius: 8px (inputs, badges), 12px (cards), 16px (modals)
- All borders: `1px solid var(--border)`
- Inputs: `background: var(--bg)`, height 38px, padding `10px 14px`
- Buttons: see `Button.jsx` below
- No external icon library — use plain Unicode or inline SVG for icons
- No gradients, no box shadows (except `0 0 0 3px var(--accent-dim)` for input focus rings)

---

## Folder Structure

```
src/
├── main.jsx
├── App.jsx
├── index.css
│
├── api/
│   └── client.js
│
├── context/
│   └── AuthContext.jsx
│
├── hooks/
│   ├── useAuth.js
│   └── useApi.js
│
├── components/
│   ├── layout/
│   │   ├── Layout.jsx
│   │   ├── Sidebar.jsx
│   │   └── TopBar.jsx
│   └── ui/
│       ├── Badge.jsx
│       ├── Button.jsx
│       ├── Modal.jsx
│       ├── Table.jsx
│       ├── Spinner.jsx
│       └── EmptyState.jsx
│
└── pages/
    ├── LoginPage.jsx          ← already done, do not touch
    ├── Dashboard.jsx
    ├── employees/
    │   ├── EmployeeList.jsx
    │   ├── EmployeeForm.jsx
    │   └── EmployeeDetail.jsx
    ├── departments/
    │   ├── DepartmentList.jsx
    │   └── DepartmentForm.jsx
    ├── leaves/
    │   ├── LeaveList.jsx
    │   ├── MyLeaves.jsx
    │   └── LeaveForm.jsx
    ├── payroll/
    │   ├── PayrollList.jsx
    │   ├── PayrollDetail.jsx
    │   └── GenerateForm.jsx
    ├── recruitment/
    │   ├── JobList.jsx
    │   ├── JobForm.jsx
    │   └── ApplicationList.jsx
    └── attendance/
        ├── AttendanceList.jsx
        ├── MyAttendance.jsx
        └── MonthlyReport.jsx
```

---

## File-by-file Specification

---

### `src/index.css`

- Import DM Sans and JetBrains Mono from Google Fonts
- Define all CSS variables listed above
- Global reset: `* { box-sizing: border-box; margin: 0; padding: 0 }`
- Set `body` background to `var(--bg)`, color to `var(--text)`, font to DM Sans
- Style scrollbars: thin, `var(--border)` track, `var(--dim)` thumb

---

### `src/main.jsx`

Standard Vite entry point. Wrap `<App />` in `<AuthProvider>` and `<BrowserRouter>`.

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)
```

---

### `src/api/client.js`

Single fetch wrapper used by every page. Never import this in UI components — only in pages and hooks.

**Exports:**

```js
// Main request function
async function api(method, path, body?)
// Reads token from sessionStorage key "rh_token"
// Sets Authorization: Bearer <token> header
// Throws Error(json.message) if json.success === false
// Returns json.data

// Convenience shorthands
export const get    = (path)        => api("GET",    path)
export const post   = (path, body)  => api("POST",   path, body)
export const put    = (path, body)  => api("PUT",    path, body)
export const del    = (path)        => api("DELETE", path)
```

Base URL is `http://localhost:8080`. Define it as a constant at the top of the file.

---

### `src/context/AuthContext.jsx`

Provides global auth state. On mount, reads `rh_token`, `rh_role`, `rh_email` from `sessionStorage` to rehydrate state (so a page refresh doesn't log the user out).

**Context value shape:**
```js
{
  user: { token, email, role } | null,
  login(data),   // saves to sessionStorage + sets state
  logout(),      // clears sessionStorage + sets user to null
}
```

Export both `AuthContext` and `AuthProvider`.

---

### `src/hooks/useAuth.js`

```js
export function useAuth() {
  return useContext(AuthContext);
}
```

---

### `src/hooks/useApi.js`

Generic data-fetching hook. Accepts a fetch function and an optional deps array.

```js
// Usage example:
const { data, loading, error, refetch } = useApi(() => get("/api/employees"), []);
```

- Runs on mount and whenever deps change
- Returns `{ data, loading, error, refetch }`
- `data` is initialized to `null`, populated with the resolved value
- `error` is the caught Error object or null
- `refetch` re-runs the fetch manually (e.g. after a create/delete)

---

### `src/App.jsx`

Handles routing. If no user in context → render `<LoginPage />`. Otherwise render the protected layout with routes.

**Route map:**

| Path | Component | Roles |
|---|---|---|
| `/` | `Dashboard` | ALL |
| `/employees` | `EmployeeList` | ADMIN, RH |
| `/employees/:id` | `EmployeeDetail` | ADMIN, RH, MANAGER |
| `/departments` | `DepartmentList` | ADMIN, RH |
| `/leaves` | `LeaveList` | ADMIN, RH, MANAGER |
| `/leaves/my` | `MyLeaves` | ALL |
| `/payroll` | `PayrollList` | ADMIN, RH |
| `/payroll/:id` | `PayrollDetail` | ADMIN, RH, MANAGER, EMPLOYEE |
| `/recruitment` | `JobList` | ALL |
| `/recruitment/:id/applications` | `ApplicationList` | ADMIN, RH |
| `/attendance` | `AttendanceList` | ADMIN, RH |
| `/attendance/my` | `MyAttendance` | ALL |
| `/attendance/report` | `MonthlyReport` | ADMIN, RH |

If a user navigates to a route their role doesn't allow, redirect to `/`.

---

### `src/components/layout/Layout.jsx`

Outer shell. Renders `<Sidebar />` on the left (fixed, 220px wide) and a main content area on the right.

```
┌─────────────────────────────────────────┐
│  Sidebar (220px) │  TopBar              │
│                  ├──────────────────────│
│                  │  <Outlet />          │
│                  │  (page content)      │
└─────────────────────────────────────────┘
```

Main content area: `padding: 2rem`, `overflow-y: auto`, `height: 100vh`.

---

### `src/components/layout/Sidebar.jsx`

**Logo** at top: purple square icon with "R" + "Gestion RH" text.

**Nav links** — show/hide based on role from `useAuth()`:

| Label | Path | Min role |
|---|---|---|
| Tableau de bord | `/` | ALL |
| Employés | `/employees` | RH, ADMIN |
| Départements | `/departments` | RH, ADMIN |
| Congés | `/leaves` | RH, ADMIN, MANAGER |
| Mes congés | `/leaves/my` | ALL |
| Salaires | `/payroll` | RH, ADMIN |
| Recrutement | `/recruitment` | ALL |
| Présence | `/attendance` | RH, ADMIN |
| Ma présence | `/attendance/my` | ALL |

Active link style: `background: var(--accent-dim)`, `color: var(--accent)`, left border `3px solid var(--accent)`.

**Bottom section**: user email + role badge + "Déconnexion" button that calls `logout()` from `useAuth()`.

---

### `src/components/layout/TopBar.jsx`

Props: `title` (string), `subtitle` (optional string).

Renders the page title on the left. On the right: a greeting with the logged-in user's email. Fixed at the top of the content area, `border-bottom: 1px solid var(--border)`, height 56px.

---

### `src/components/ui/Badge.jsx`

Renders a colored status pill.

```jsx
<Badge status="ACTIF" />       // → green pill "ACTIF"
<Badge status="EN_ATTENTE" />  // → orange pill "EN ATTENTE"
```

Props: `status` (string). Looks up color from the status→color map. Displays the status string with underscores replaced by spaces. Style: `font-size: 11px`, `font-weight: 500`, `padding: 3px 10px`, `border-radius: 20px`, background at 15% opacity of the status color, text at full color.

---

### `src/components/ui/Button.jsx`

Props: `variant` (`primary` | `ghost` | `danger`), `size` (`sm` | `md`), `loading`, `onClick`, `children`, `disabled`.

| Variant | Style |
|---|---|
| primary | `background: var(--accent)`, white text |
| ghost | transparent bg, `border: 1px solid var(--border)`, muted text |
| danger | `background: rgba(240,82,82,0.15)`, `color: var(--danger)`, `border: 1px solid rgba(240,82,82,0.3)` |

When `loading` is true: show a small inline spinner and disable the button.

---

### `src/components/ui/Modal.jsx`

Props: `open`, `onClose`, `title`, `children`, `width` (default `520px`).

- Renders a full-screen overlay `rgba(0,0,0,0.6)` with the modal card centered
- Close on overlay click or Escape key
- Header: title + ✕ close button
- Footer slot: pass action buttons as `children` at the bottom
- **Important**: use `position: fixed` + `z-index: 1000` for the overlay — this is a real app, not an iframe widget, so fixed positioning works fine here

---

### `src/components/ui/Table.jsx`

Props: `columns`, `data`, `loading`, `onRowClick`.

`columns` shape:
```js
[{ key: "name", label: "Nom", render: (row) => <span>{row.name}</span> }]
```

- `render` is optional — if omitted, renders `row[key]` as plain text
- Shows `<Spinner />` when `loading` is true
- Shows `<EmptyState />` when `data` is empty
- Row hover: `background: var(--surface)`
- `onRowClick` is optional — if provided, rows are clickable (cursor pointer)
- Header: `font-size: 11px`, uppercase, `color: var(--muted)`

---

### `src/components/ui/Spinner.jsx`

A simple CSS-animated circle. Props: `size` (default 24px), `color` (default `var(--accent)`). No dependencies.

---

### `src/components/ui/EmptyState.jsx`

Props: `message` (default "Aucun résultat"), `icon` (optional). Centered, muted text, generous padding.

---

## Pages

---

### `Dashboard.jsx`

Fetches in parallel on mount:
- `GET /api/employees` → count
- `GET /api/leaves` → count pending (`EN_ATTENTE`)
- `GET /api/attendance/report?month=<current>&year=<current>` → present days avg
- `GET /api/jobs` → count open (`OUVERT`)

Displays 4 KPI cards in a 2×2 grid:
- Total employés
- Congés en attente
- Taux de présence ce mois
- Offres d'emploi ouvertes

Below the KPIs: a recent leaves table (`GET /api/leaves`, first 5 results) with columns: Employé, Type, Dates, Statut.

Only show KPI cards and data the current role has access to (e.g. EMPLOYEE only sees their own data, so skip the admin KPIs and show a welcome message instead).

---

### `employees/EmployeeList.jsx`

- Fetches `GET /api/employees` on mount
- Search bar at the top — calls `GET /api/employees/search?query=` on input (debounce 300ms)
- Table columns: Nom, Email, Département, Poste, Statut, Contrat
- "Nouvel employé" button (RH/ADMIN only) → opens `EmployeeForm` modal
- Row click → navigate to `/employees/:id`
- Delete button per row (ADMIN only) → confirm then `DELETE /api/employees/:id`, refetch

---

### `employees/EmployeeForm.jsx`

Modal form for create and edit.

Props: `employee` (null for create, object for edit), `onClose`, `onSaved`.

Fields (all required unless noted):
- Prénom, Nom, Email, Téléphone, CIN
- Date d'embauche (date input)
- Statut (select: ACTIF, INACTIF, EN_CONGE, SUSPENDU)
- Type de contrat (select: CDI, CDD, STAGE, FREELANCE)
- Salaire de base (number)
- Département (select — fetched from `GET /api/departments`)
- Poste (select — fetched from `GET /api/positions`)
- Manager (select, optional — fetched from `GET /api/employees`)

On submit: `POST /api/employees` or `PUT /api/employees/:id`. Call `onSaved()` on success.

---

### `employees/EmployeeDetail.jsx`

Fetches `GET /api/employees/:id`. Displays a profile card with all fields. Two tabs below: **Congés** (fetches leave list filtered to this employee) and **Salaires** (fetches `GET /api/payroll/employee/:id`). Edit button opens `EmployeeForm` in edit mode.

---

### `departments/DepartmentList.jsx`

- Fetches `GET /api/departments`
- Card grid (3 columns): each card shows department name, head name, employee count
- "Nouveau département" button (RH/ADMIN) → opens `DepartmentForm`
- Click on card → expand inline to show employee list (`GET /api/departments/:id/employees`)

---

### `departments/DepartmentForm.jsx`

Modal form. Fields: Nom, Description, Responsable (select from employees). POST or PUT on submit.

---

### `leaves/LeaveList.jsx`

For RH/ADMIN/MANAGER. Fetches `GET /api/leaves`.

Table columns: Employé, Type, Du, Au, Durée, Statut, Actions.

Actions per row (only if status is `EN_ATTENTE`):
- ✓ Approuver → `PUT /api/leaves/:id/approve`
- ✗ Rejeter → `PUT /api/leaves/:id/reject` (optional comment modal)

Filter bar: by status (ALL / EN_ATTENTE / APPROUVE / REJETE), by type.

---

### `leaves/MyLeaves.jsx`

For all roles. Fetches `GET /api/leaves/my`.

Same table as above but without the Employé column. "Nouvelle demande" button → opens `LeaveForm`. Cancel button per row (only if `EN_ATTENTE`) → `DELETE /api/leaves/:id`.

---

### `leaves/LeaveForm.jsx`

Modal form. Fields:
- Type (select: CONGE_PAYE, MALADIE, MATERNITE, SANS_SOLDE, AUTRE)
- Date de début, Date de fin (date inputs — end must be ≥ start, validate client-side)
- Motif (textarea, optional)

`POST /api/leaves` on submit.

---

### `payroll/PayrollList.jsx`

Fetches `GET /api/payroll`. Table columns: Employé, Mois/Année, Salaire de base, Brut, Net, Statut, Actions.

Actions:
- Valider → `PUT /api/payroll/:id/validate` (only if BROUILLON, RH/ADMIN)
- Marquer payé → `PUT /api/payroll/:id/pay` (only if VALIDE, RH/ADMIN)
- View → navigate to `/payroll/:id`

"Générer une fiche" button → opens `GenerateForm`.

---

### `payroll/PayrollDetail.jsx`

Fetches `GET /api/payroll/:id`. Displays a payslip card with:
- Employee name + month/year
- Salary breakdown table: Salaire de base, Primes, Déductions, CNSS (4.48%), AMO (2.26%), IR (progressive), **Salaire net**
- Status badge + paid date if applicable
- Print button (`window.print()`)

---

### `payroll/GenerateForm.jsx`

Modal form. Fields:
- Employé (select)
- Mois (1–12), Année
- Primes (number, default 0)
- Déductions (number, default 0)

`POST /api/payroll/generate` on submit.

---

### `recruitment/JobList.jsx`

Fetches `GET /api/jobs`. Card grid. Each card: title, department, contract type, closing date, status badge, applicant count (from applications list if available).

"Nouvelle offre" button (RH/ADMIN) → opens `JobForm`. Click card → navigate to `/recruitment/:id/applications`.

---

### `recruitment/JobForm.jsx`

Modal form. Fields: Titre, Description, Département, Poste, Compétences requises (textarea), Type de contrat, Date de clôture. POST or PUT.

---

### `recruitment/ApplicationList.jsx`

Route: `/recruitment/:id/applications`. Fetches `GET /api/jobs/:id/applications`.

Table: Candidat, Email, Téléphone, CV (link), Statut, Actions.

Actions: update status via `PUT /api/applications/:id/status`. Status flow: RECU → EN_COURS → ENTRETIEN → ACCEPTE or REFUSE. Show only valid next transitions as buttons.

---

### `attendance/AttendanceList.jsx`

Fetches `GET /api/attendance`. Table: Employé, Date, Arrivée, Départ, Heures, Statut. Filter by date range and status. Link to monthly report.

---

### `attendance/MyAttendance.jsx`

Fetches `GET /api/attendance/my`.

Top section: large check-in / check-out button. Logic:
- If no check-in today → show "Pointer l'arrivée" button → `POST /api/attendance/checkin`
- If checked in but not out → show current time elapsed + "Pointer le départ" button → `PUT /api/attendance/checkout`
- If both done → show today's summary (hours worked, status)

Below: personal history table.

---

### `attendance/MonthlyReport.jsx`

Month/year selector (defaults to current month). Fetches `GET /api/attendance/report?month=&year=`.

Displays: total days, present, absent, late, half-days, total hours. Use a simple horizontal bar chart (pure CSS, no library) to visualize present vs absent vs late breakdown.

---

## Global Rules

1. **Every API call must handle loading and error states.** Use `<Spinner />` while loading, show an inline error message on failure.
2. **Never hardcode role checks as strings in JSX.** Define a `ROLES` constant object: `export const ROLES = { ADMIN: "ADMIN", RH: "RH", ... }` and import it.
3. **All dates displayed** must be formatted as `DD/MM/YYYY` (French format). Use a small `formatDate(isoString)` utility function.
4. **All salary amounts** must be formatted with `Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" })`.
5. **Forms must validate client-side** before hitting the API. Show field-level errors (red border + message below the input).
6. **After any create/update/delete**, call `refetch()` to refresh the list — do not mutate local state manually.
7. **Token expiry**: if any API call returns HTTP 401, call `logout()` from `useAuth()` which will redirect to login.
8. **No page should crash** if the API is unreachable — show a user-friendly error card instead.

---

## API Reference

Base URL: `http://localhost:8080`

All responses follow:
```json
{ "success": true, "message": "...", "data": {}, "timestamp": "..." }
```

Authentication header: `Authorization: Bearer <token>`

### Auth
| Method | Path | Body |
|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` |
| POST | `/api/auth/register` | `{ firstName, lastName, email, password, role }` |

### Employees
| Method | Path | Roles |
|---|---|---|
| GET | `/api/employees` | ADMIN, RH |
| GET | `/api/employees/:id` | ADMIN, RH, MANAGER |
| GET | `/api/employees/search?query=` | ADMIN, RH |
| POST | `/api/employees` | ADMIN, RH |
| PUT | `/api/employees/:id` | ADMIN, RH |
| DELETE | `/api/employees/:id` | ADMIN |

### Departments
| Method | Path | Roles |
|---|---|---|
| GET | `/api/departments` | ALL |
| GET | `/api/departments/:id/employees` | ADMIN, RH, MANAGER |
| POST | `/api/departments` | ADMIN, RH |
| PUT | `/api/departments/:id` | ADMIN, RH |
| DELETE | `/api/departments/:id` | ADMIN |

### Positions
| Method | Path | Roles |
|---|---|---|
| GET | `/api/positions` | ALL |
| POST | `/api/positions` | ADMIN, RH |

### Leaves
| Method | Path | Roles |
|---|---|---|
| POST | `/api/leaves` | ALL |
| GET | `/api/leaves` | ADMIN, RH, MANAGER |
| GET | `/api/leaves/my` | ALL |
| PUT | `/api/leaves/:id/approve` | ADMIN, RH, MANAGER |
| PUT | `/api/leaves/:id/reject` | ADMIN, RH, MANAGER |
| DELETE | `/api/leaves/:id` | ALL (own + pending) |

### Payroll
| Method | Path | Roles |
|---|---|---|
| POST | `/api/payroll/generate` | ADMIN, RH |
| GET | `/api/payroll` | ADMIN, RH |
| GET | `/api/payroll/employee/:id` | ALL |
| GET | `/api/payroll/:id` | ALL |
| PUT | `/api/payroll/:id/validate` | ADMIN, RH |
| PUT | `/api/payroll/:id/pay` | ADMIN, RH |

### Recruitment
| Method | Path | Roles |
|---|---|---|
| POST | `/api/jobs` | ADMIN, RH |
| GET | `/api/jobs` | ALL |
| PUT | `/api/jobs/:id` | ADMIN, RH |
| DELETE | `/api/jobs/:id` | ADMIN |
| POST | `/api/jobs/:id/apply` | ALL |
| GET | `/api/jobs/:id/applications` | ADMIN, RH |
| PUT | `/api/applications/:id/status` | ADMIN, RH |

### Attendance
| Method | Path | Roles |
|---|---|---|
| POST | `/api/attendance/checkin` | ALL |
| PUT | `/api/attendance/checkout` | ALL |
| GET | `/api/attendance` | ADMIN, RH |
| GET | `/api/attendance/my` | ALL |
| GET | `/api/attendance/employee/:id` | ADMIN, RH, MANAGER |
| GET | `/api/attendance/report?month=&year=` | ADMIN, RH |

---

## Utility Reference

All utilities live in `src/utils/`. Import only what you need per file.

### `formatDate.js`

```js
import { formatDate, formatDateRange, formatTime, formatMonthYear } from "../../utils/formatDate";

formatDate("2026-02-01")                       // "01/02/2026"
formatDate(null)                               // "—"
formatDateRange("2026-02-01", "2026-02-07")    // "01/02/2026 → 07/02/2026"
formatTime("08:45:00")                         // "08:45"
formatMonthYear(1, 2026)                       // "Janvier 2026"
```

### `formatCurrency.js`

```js
import { formatCurrency, formatAmount, formatPercent } from "../../utils/formatCurrency";

formatCurrency(8000)      // "8 000,00 MAD"
formatCurrency(null)      // "—"
formatAmount(1234.5)      // "1 234,50"
formatPercent(4.48)       // "4,48 %"
```

### `debounce.js`

```js
// plain function — use outside React
import { debounce } from "../../utils/debounce";
const search = debounce((q) => fetchResults(q), 300);

// hook version — use inside components (stable ref, no timer reset on re-render)
import { useDebouncedCallback } from "../../utils/debounce";
const handleSearch = useDebouncedCallback((q) => {
  get(`/api/employees/search?query=${q}`).then(setData);
}, 300);
```

---

## Deliverable Checklist

### Foundation
- [ ] `src/index.css` with CSS variables and global reset
- [ ] `src/main.jsx`
- [x] `src/api/client.js`
- [x] `src/context/AuthContext.jsx`
- [x] `src/hooks/useAuth.js`
- [x] `src/hooks/useApi.js`
- [x] `src/constants.js`
- [x] `src/App.jsx` with all routes

### Layout
- [x] `src/components/layout/Layout.jsx`
- [x] `src/components/layout/Sidebar.jsx`
- [x] `src/components/layout/TopBar.jsx`

### UI Components
- [x] `src/components/ui/Badge.jsx`
- [x] `src/components/ui/Button.jsx`
- [x] `src/components/ui/Modal.jsx`
- [x] `src/components/ui/Table.jsx`
- [x] `src/components/ui/Spinner.jsx`
- [x] `src/components/ui/EmptyState.jsx`

### Utilities
- [x] `src/utils/formatDate.js`
- [x] `src/utils/formatCurrency.js`
- [x] `src/utils/debounce.js`

### Pages
- [ ] `src/pages/Dashboard.jsx`
- [ ] `src/pages/employees/EmployeeList.jsx`
- [ ] `src/pages/employees/EmployeeForm.jsx`
- [ ] `src/pages/employees/EmployeeDetail.jsx`
- [ ] `src/pages/departments/DepartmentList.jsx`
- [ ] `src/pages/departments/DepartmentForm.jsx`
- [ ] `src/pages/leaves/LeaveList.jsx`
- [ ] `src/pages/leaves/MyLeaves.jsx`
- [ ] `src/pages/leaves/LeaveForm.jsx`
- [ ] `src/pages/payroll/PayrollList.jsx`
- [ ] `src/pages/payroll/PayrollDetail.jsx`
- [ ] `src/pages/payroll/GenerateForm.jsx`
- [ ] `src/pages/recruitment/JobList.jsx`
- [ ] `src/pages/recruitment/JobForm.jsx`
- [ ] `src/pages/recruitment/ApplicationList.jsx`
- [ ] `src/pages/attendance/AttendanceList.jsx`
- [ ] `src/pages/attendance/MyAttendance.jsx`
- [ ] `src/pages/attendance/MonthlyReport.jsx`
