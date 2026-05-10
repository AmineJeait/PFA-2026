# Gestion RH — Frontend API Reference

## Base URL
```
http://localhost:8080
```

## Authentication

All protected routes require a JWT token in the header:
```
Authorization: Bearer <token>
```

### Get a token
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "...",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "email": "user@example.com",
    "role": "RH"
  }
}
```

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "EMPLOYEE"
}
```

---

## Standard Response Format
Every endpoint returns:
```json
{
  "success": true | false,
  "message": "Human readable message",
  "data": { ... } | [ ... ] | null,
  "timestamp": "2026-01-15T10:30:00"
}
```

---

## Roles
| Role | Description |
|------|-------------|
| `ADMIN` | Full access |
| `RH` | HR manager — employees, leaves, payroll, recruitment, attendance |
| `MANAGER` | Team leads — read employees, approve leaves, view attendance |
| `EMPLOYEE` | Self-service — own profile, own leaves, own attendance |

---

## Module 1 — Employees

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/employees` | ADMIN, RH | Get all employees |
| GET | `/api/employees/{id}` | ADMIN, RH, MANAGER | Get one employee |
| GET | `/api/employees/search?query=` | ADMIN, RH | Search by name or email |
| POST | `/api/employees` | ADMIN, RH | Create employee |
| PUT | `/api/employees/{id}` | ADMIN, RH | Update employee |
| DELETE | `/api/employees/{id}` | ADMIN | Delete employee |

### Create Employee Body
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@company.com",
  "phone": "0612345678",
  "cin": "AB123456",
  "hireDate": "2026-01-15",
  "status": "ACTIF",
  "contractType": "CDI",
  "baseSalary": 8000.00,
  "departmentId": 1,
  "positionId": 2,
  "managerId": 5
}
```

### Employee Status values
`ACTIF` | `INACTIF` | `EN_CONGE` | `SUSPENDU`

### Contract Type values
`CDI` | `CDD` | `STAGE` | `FREELANCE`

---

## Module 2 — Departments & Positions

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/departments` | ALL | Get all departments |
| GET | `/api/departments/{id}` | ALL | Get one department |
| GET | `/api/departments/{id}/employees` | ADMIN, RH, MANAGER | List employees in department |
| POST | `/api/departments` | ADMIN, RH | Create department |
| PUT | `/api/departments/{id}` | ADMIN, RH | Update department |
| DELETE | `/api/departments/{id}` | ADMIN | Delete department |
| GET | `/api/positions` | ALL | Get all positions |
| POST | `/api/positions` | ADMIN, RH | Create position |
| DELETE | `/api/positions/{id}` | ADMIN | Delete position |

### Create Department Body
```json
{
  "name": "Engineering",
  "description": "Software development team",
  "headEmployeeId": 3
}
```

### Create Position Body
```json
{
  "title": "Senior Developer",
  "description": "Leads technical development",
  "departmentId": 1
}
```

### Department Response
```json
{
  "id": 1,
  "name": "Engineering",
  "description": "Software development team",
  "headEmployeeId": 3,
  "headEmployeeName": "Jane Smith",
  "employeeCount": 12
}
```

---

## Module 3 — Leaves (Congés)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/api/leaves` | ALL | Submit a leave request |
| GET | `/api/leaves` | ADMIN, RH | Get all leave requests |
| GET | `/api/leaves/my` | ALL | Get my leave requests |
| GET | `/api/leaves/{id}` | ALL | Get one leave request |
| PUT | `/api/leaves/{id}/approve` | ADMIN, RH, MANAGER | Approve leave |
| PUT | `/api/leaves/{id}/reject` | ADMIN, RH, MANAGER | Reject leave |
| DELETE | `/api/leaves/{id}` | ALL | Cancel leave (own + pending only) |

### Submit Leave Body
```json
{
  "type": "CONGE_PAYE",
  "startDate": "2026-02-01",
  "endDate": "2026-02-07",
  "reason": "Annual vacation"
}
```

### Reject Leave Body (optional)
```json
{
  "comments": "Not enough coverage during this period"
}
```

### Leave Type values
`CONGE_PAYE` | `MALADIE` | `MATERNITE` | `SANS_SOLDE` | `AUTRE`

### Leave Status values
`EN_ATTENTE` | `APPROUVE` | `REJETE`

### Leave Response
```json
{
  "id": 1,
  "employeeId": 4,
  "employeeName": "Jane Smith",
  "type": "CONGE_PAYE",
  "startDate": "2026-02-01",
  "endDate": "2026-02-07",
  "durationDays": 7,
  "reason": "Annual vacation",
  "status": "EN_ATTENTE",
  "approvedById": null,
  "approvedByName": null,
  "approvedAt": null,
  "comments": null
}
```

---

## Module 4 — Payroll (Salaires)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/api/payroll/generate` | ADMIN, RH | Generate payslip |
| GET | `/api/payroll` | ADMIN, RH | Get all payslips |
| GET | `/api/payroll/employee/{id}` | ADMIN, RH, MANAGER, EMPLOYEE | Get employee payslips |
| GET | `/api/payroll/{id}` | ADMIN, RH, MANAGER, EMPLOYEE | Get one payslip |
| PUT | `/api/payroll/{id}/validate` | ADMIN, RH | Validate payslip |
| PUT | `/api/payroll/{id}/pay` | ADMIN, RH | Mark as paid |

### Generate Payroll Body
```json
{
  "employeeId": 4,
  "month": 1,
  "year": 2026,
  "bonuses": 500.00,
  "deductions": 0.00
}
```

### Payroll Status values
`BROUILLON` → `VALIDE` → `PAYE`

### Payroll Response
```json
{
  "id": 1,
  "employeeId": 4,
  "employeeName": "Jane Smith",
  "month": 1,
  "year": 2026,
  "baseSalary": 8000.00,
  "bonuses": 500.00,
  "deductions": 0.00,
  "cnss": 268.80,
  "amo": 180.80,
  "ir": 354.17,
  "netSalary": 7696.23,
  "status": "BROUILLON",
  "paidAt": null
}
```

### Moroccan Tax Logic (for display)
| Contribution | Rate | Cap |
|---|---|---|
| CNSS | 4.48% | Base capped at 6 000 MAD |
| AMO | 2.26% | No cap |
| IR | Progressive | Applied on (base - CNSS - AMO) |

---

## Module 5 — Recruitment

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/api/jobs` | ADMIN, RH | Create job offer |
| GET | `/api/jobs` | ALL | List open job offers |
| GET | `/api/jobs/{id}` | ALL | Get one job offer |
| PUT | `/api/jobs/{id}` | ADMIN, RH | Update job offer |
| DELETE | `/api/jobs/{id}` | ADMIN | Delete job offer |
| POST | `/api/jobs/{id}/apply` | ALL | Submit application |
| GET | `/api/jobs/{id}/applications` | ADMIN, RH | List applications for offer |
| PUT | `/api/applications/{id}/status` | ADMIN, RH | Update application status |

### Create Job Offer Body
```json
{
  "title": "Backend Developer",
  "description": "Looking for a Spring Boot expert",
  "departmentId": 1,
  "positionId": 2,
  "requiredSkills": "Java, Spring Boot, PostgreSQL",
  "contractType": "CDI",
  "closingDate": "2026-03-01"
}
```

### Submit Application Body
```json
{
  "candidateName": "Alice Martin",
  "candidateEmail": "alice@gmail.com",
  "candidatePhone": "0612345678",
  "cvUrl": "https://drive.google.com/...",
  "coverLetter": "I am very interested in..."
}
```

### Update Application Status Body
```json
{
  "status": "ENTRETIEN",
  "notes": "Scheduled interview for Feb 10"
}
```

### Job Status values
`OUVERT` | `FERME` | `ANNULE`

### Application Status values
`RECU` → `EN_COURS` → `ENTRETIEN` → `ACCEPTE` | `REFUSE`

---

## Module 6 — Attendance (Présence)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/api/attendance/checkin` | ALL | Check in |
| PUT | `/api/attendance/checkout` | ALL | Check out |
| GET | `/api/attendance` | ADMIN, RH | Get all records |
| GET | `/api/attendance/my` | ALL | Get my records |
| GET | `/api/attendance/employee/{id}` | ADMIN, RH, MANAGER | Get employee records |
| GET | `/api/attendance/report?month=&year=` | ADMIN, RH | Monthly report |

### Check In Body (optional)
```json
{
  "notes": "Working from home"
}
```

### Check Out Body (optional)
```json
{
  "notes": "Left early for appointment"
}
```

### Attendance Status values
`PRESENT` | `ABSENT` | `RETARD` | `DEMI_JOURNEE`

> **Auto-logic:**
> - Check-in after **09:00** → status set to `RETARD`
> - Check-out with less than **5 hours** worked → status set to `DEMI_JOURNEE`

### Attendance Response
```json
{
  "id": 1,
  "employeeId": 4,
  "employeeName": "Jane Smith",
  "date": "2026-01-15",
  "checkIn": "08:45:00",
  "checkOut": "17:30:00",
  "hoursWorked": 8.75,
  "status": "PRESENT",
  "notes": null
}
```

### Monthly Report Response
```json
{
  "employeeId": 4,
  "employeeName": "Jane Smith",
  "month": 1,
  "year": 2026,
  "totalDays": 22,
  "presentDays": 20,
  "absentDays": 1,
  "lateDays": 1,
  "halfDays": 0,
  "totalHoursWorked": 174.5
}
```

---

## Error Responses

All errors follow the same format:
```json
{
  "success": false,
  "message": "Department with name 'Engineering' already exists",
  "data": null,
  "timestamp": "2026-01-15T10:30:00"
}
```

### Common HTTP status codes
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Validation error |
| 401 | Missing or invalid token |
| 403 | Forbidden (wrong role) |
| 404 | Resource not found |
| 500 | Server error |

---

## Frontend Tips

- Store the JWT token in memory or `sessionStorage` — attach it to every request
- All dates use `ISO 8601` format: `YYYY-MM-DD`
- All times use `HH:mm:ss` format
- Check-in / check-out require no body — just send an empty `{}` or omit the body
- The `/api/leaves/my` and `/api/attendance/my` endpoints identify the user from the token — no need to pass an employee ID