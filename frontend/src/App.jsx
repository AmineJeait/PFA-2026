import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { ROLES } from "./constants";
import Layout from "./components/layout/Layout";

// pages
import LoginPage           from "./pages/LoginPage";
import Dashboard           from "./pages/Dashboard";
import EmployeeList        from "./pages/employees/EmployeeList";
import EmployeeDetail      from "./pages/employees/EmployeeDetail";
import DepartmentList      from "./pages/departments/DepartmentList";
import LeaveList           from "./pages/leaves/LeaveList";
import MyLeaves            from "./pages/leaves/MyLeaves";
import PayrollList         from "./pages/payroll/PayrollList";
import PayrollDetail       from "./pages/payroll/PayrollDetail";
import JobList             from "./pages/recruitment/JobList";
import ApplicationList     from "./pages/recruitment/ApplicationList";
import AttendanceList      from "./pages/attendance/AttendanceList";
import MyAttendance        from "./pages/attendance/MyAttendance";
import MonthlyReport       from "./pages/attendance/MonthlyReport";

const { ADMIN, RH, MANAGER, EMPLOYEE } = ROLES;

/**
 * Wraps a page and redirects to "/" if the current user's role
 * is not in the allowed list.
 */
function Guard({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, login } = useAuth();

  // not authenticated → show login
  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>

        {/* Dashboard — all roles */}
        <Route index element={<Dashboard />} />

        {/* Employees */}
        <Route
          path="employees"
          element={
            <Guard roles={[ADMIN, RH]}>
              <EmployeeList />
            </Guard>
          }
        />
        <Route
          path="employees/:id"
          element={
            <Guard roles={[ADMIN, RH, MANAGER]}>
              <EmployeeDetail />
            </Guard>
          }
        />

        {/* Departments */}
        <Route
          path="departments"
          element={
            <Guard roles={[ADMIN, RH]}>
              <DepartmentList />
            </Guard>
          }
        />

        {/* Leaves */}
        <Route
          path="leaves"
          element={
            <Guard roles={[ADMIN, RH, MANAGER]}>
              <LeaveList />
            </Guard>
          }
        />
        <Route path="leaves/my" element={<MyLeaves />} />

        {/* Payroll */}
        <Route
          path="payroll"
          element={
            <Guard roles={[ADMIN, RH]}>
              <PayrollList />
            </Guard>
          }
        />
        <Route path="payroll/:id" element={<PayrollDetail />} />

        {/* Recruitment — all roles */}
        <Route path="recruitment" element={<JobList />} />
        <Route
          path="recruitment/:id/applications"
          element={
            <Guard roles={[ADMIN, RH]}>
              <ApplicationList />
            </Guard>
          }
        />

        {/* Attendance */}
        <Route
          path="attendance"
          element={
            <Guard roles={[ADMIN, RH]}>
              <AttendanceList />
            </Guard>
          }
        />
        <Route path="attendance/my"     element={<MyAttendance />} />
        <Route
          path="attendance/report"
          element={
            <Guard roles={[ADMIN, RH]}>
              <MonthlyReport />
            </Guard>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Route>
    </Routes>
  );
}
