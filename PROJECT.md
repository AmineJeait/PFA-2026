# PFA-2026 — Système de Gestion des Ressources Humaines

Application web full-stack de gestion RH développée dans le cadre du Projet de Fin d'Année 2026.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Backend | Java 17 · Spring Boot 3 · Spring Security · Maven |
| Base de données | PostgreSQL (`gestion_rh`) |
| Authentification | JWT (access 24h · refresh 7j) |
| Frontend | React 18 · Vite · React Router v6 |
| Graphiques | Recharts |
| Export PDF | jsPDF + html2canvas |

---

## Architecture

```
PFA-2026/
├── backend/                          Spring Boot API (port 8080)
│   └── src/main/java/.../
│       ├── config/                   SecurityConfig, DatabaseSeeder
│       ├── exception/                GlobalExceptionHandler
│       ├── security/                 JwtAuthFilter, JwtService
│       └── modules/
│           ├── auth/                 Authentification & JWT
│           ├── employee/             Gestion des employés
│           ├── department/           Départements & postes
│           ├── leave/                Demandes de congés
│           ├── payroll/              Fiches de paie
│           ├── recruitment/          Offres d'emploi & candidatures
│           └── attendance/           Pointage & présences
└── frontend/                         React SPA (port 5173)
    └── src/
        ├── pages/                    Vues par module
        ├── components/               Layout, UI (Button, Table, Modal…)
        ├── hooks/                    useAuth, useApi, useTheme
        ├── context/                  AuthContext, ToastContext, ThemeContext
        └── api/                      client HTTP (fetch + JWT header)
```

---

## Modèle de données

### User
| Champ | Type |
|---|---|
| id | Long (auto) |
| email | String (unique) |
| password | String (bcrypt) |
| role | `ADMIN` \| `RH` \| `MANAGER` \| `EMPLOYEE` |

### Employee
| Champ | Type |
|---|---|
| id | Long |
| firstName, lastName | String |
| email, phone | String |
| dateOfBirth, hireDate | LocalDate |
| address, cin | String |
| status | `ACTIF` \| `INACTIF` \| `EN_CONGE` \| `SUSPENDU` |
| contractType | `CDI` \| `CDD` \| `STAGE` \| `FREELANCE` |
| baseSalary | BigDecimal |
| user | @OneToOne → User |
| manager | @ManyToOne → Employee |
| department | @ManyToOne → Department |
| position | @ManyToOne → Position |

### LeaveRequest
| Champ | Type |
|---|---|
| type | `CONGE_PAYE` \| `MALADIE` \| `MATERNITE` \| `SANS_SOLDE` \| `AUTRE` |
| startDate, endDate | LocalDate |
| reason | String |
| status | `EN_ATTENTE` \| `APPROUVE` \| `REJETE` |
| approvedBy | @ManyToOne → Employee |
| comments | String |

### Payroll
| Champ | Type | Note |
|---|---|---|
| employee | @ManyToOne | unique (employee, month, year) |
| month, year | int | |
| baseSalary, bonuses, deductions | BigDecimal | |
| cnss | BigDecimal | 4.48 % plafonné à 6 000 |
| amo | BigDecimal | 2.26 % |
| ir | BigDecimal | barème progressif |
| netSalary | BigDecimal | calculé automatiquement |
| status | `BROUILLON` \| `VALIDE` \| `PAYE` | |

### JobOffer / Application
Offres d'emploi liées aux candidatures (candidateName, email, phone, cvUrl, coverLetter, statut `EN_ATTENTE` → `RETENU` / `REJETE` / `ENTRETIEN`).

### Attendance
Pointage journalier par employé (checkIn, checkOut, statut `PRESENT` / `ABSENT` / `RETARD` / `DEMI_JOURNEE`).

---

## Rôles et permissions

| Action | ADMIN | RH | MANAGER | EMPLOYEE |
|---|:---:|:---:|:---:|:---:|
| Voir liste employés | ✅ | ✅ | ✅ | ❌ |
| Créer / modifier employé | ✅ | ✅ | ❌ | ❌ |
| Supprimer employé | ✅ | ❌ | ❌ | ❌ |
| Voir son profil (`/me`) | ❌* | ✅ | ✅ | ✅ |
| Gérer départements | ✅ | ✅ | ❌ | ❌ |
| Supprimer département | ✅ | ❌ | ❌ | ❌ |
| Voir toutes les demandes congé | ✅ | ✅ | ✅ | ❌ |
| Approuver / rejeter congé | ✅ | ✅ | ✅ | ❌ |
| Soumettre / voir ses congés | ✅ | ✅ | ✅ | ✅ |
| Générer / voir fiches de paie | ✅ | ✅ | ❌ | ❌ |
| Créer / modifier offres d'emploi | ✅ | ✅ | ❌ | ❌ |
| Supprimer offre d'emploi | ✅ | ✅ | ❌ | ❌ |
| Postuler à une offre | ❌ | ❌ | ✅ | ✅ |
| Voir son pointage | ✅ | ✅ | ✅ | ✅ |
| Voir tous les pointages | ✅ | ✅ | ❌ | ❌ |
| Statistiques | ✅ | ✅ | ❌ | ❌ |

*L'admin n'a pas de fiche employé — retourne 404 proprement.

---

## API REST

Base URL : `http://localhost:8080/api`  
Toutes les requêtes (sauf `/auth/*`) nécessitent : `Authorization: Bearer <token>`

### Auth
```
POST   /auth/login          { email, password }  → { accessToken, refreshToken, role }
POST   /auth/register       { email, password, role }
```

### Employees
```
GET    /employees            Liste (ADMIN, RH)
POST   /employees            Créer (ADMIN, RH)
GET    /employees/:id        Détail (ADMIN, RH, MANAGER)
PUT    /employees/:id        Modifier (ADMIN, RH)
DELETE /employees/:id        Supprimer (ADMIN)
GET    /employees/me         Mon profil (tous)
PUT    /employees/me         Mettre à jour mon profil (tous)
GET    /employees/search?query=  Recherche (ADMIN, RH)
```

### Departments
```
GET    /departments          Liste (tous)
POST   /departments          Créer (ADMIN, RH)
GET    /departments/:id      Détail (tous)
PUT    /departments/:id      Modifier (ADMIN, RH)
DELETE /departments/:id      Supprimer (ADMIN)
```

### Leaves
```
GET    /leaves               Toutes les demandes (ADMIN, RH, MANAGER)
POST   /leaves               Nouvelle demande (tous)
GET    /leaves/:id           Détail (tous)
PUT    /leaves/:id/approve   Approuver (ADMIN, RH, MANAGER)
PUT    /leaves/:id/reject    Rejeter (ADMIN, RH, MANAGER)
DELETE /leaves/:id           Annuler (tous)
GET    /leaves/my            Mes demandes (tous)
GET    /leaves/balance       Solde de congés (tous)
```

### Payroll
```
GET    /payroll              Liste (ADMIN, RH)
POST   /payroll/generate     Générer une fiche (ADMIN, RH)
POST   /payroll/generate-bulk  Génération en masse (ADMIN, RH)
GET    /payroll/:id          Détail (ADMIN, RH)
PUT    /payroll/:id/validate Valider (ADMIN, RH)
PUT    /payroll/:id/pay      Marquer comme payé (ADMIN, RH)
GET    /payroll/employee/:id Fiches d'un employé (tous)
```

### Recruitment
```
GET    /jobs                 Liste des offres (tous)
POST   /jobs                 Créer une offre (ADMIN, RH)
GET    /jobs/:id             Détail offre (tous)
PUT    /jobs/:id             Modifier offre (ADMIN, RH)
DELETE /jobs/:id             Supprimer offre (ADMIN, RH)
POST   /jobs/:id/apply       Postuler (MANAGER, EMPLOYEE)
GET    /jobs/:id/applications  Candidatures d'une offre (ADMIN, RH)
GET    /applications/my      Mes candidatures (tous)
PUT    /applications/:id/status  Changer statut candidature (ADMIN, RH)
```

### Attendance
```
GET    /attendance           Tous les pointages (ADMIN, RH)
GET    /attendance/my        Mon pointage (tous)
POST   /attendance/check-in  Enregistrer l'arrivée (tous)
POST   /attendance/check-out Enregistrer le départ (tous)
```

---

## Réponse standard

Toutes les réponses suivent l'enveloppe `ApiResponse<T>` :

```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "timestamp": "2026-06-12T21:00:00"
}
```

Codes d'erreur :
- `400` — données invalides
- `401` — non authentifié
- `403` — accès refusé (rôle insuffisant)
- `404` — ressource introuvable
- `409` — conflit (ex : doublon de fiche de paie)

---

## Guide d'installation

### Prérequis logiciels

| Outil | Version minimale | Vérification |
|---|---|---|
| Java JDK | 17 | `java -version` |
| Maven | 3.8 | `mvn -version` |
| Node.js | 18 | `node -v` |
| npm | 9 | `npm -v` |
| PostgreSQL | 14 | `psql --version` |

---

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd PFA-2026
```

---

### 2. Base de données PostgreSQL

Créer la base et l'utilisateur :

```sql
-- Se connecter en tant que superuser (ex: psql -U postgres)
CREATE DATABASE gestion_rh;
CREATE USER gmao_user WITH PASSWORD 'user';
GRANT ALL PRIVILEGES ON DATABASE gestion_rh TO gmao_user;
```

> La structure des tables est créée automatiquement par Hibernate (`ddl-auto=update`) au premier démarrage. Les données de test (4 comptes utilisateurs, employés, départements) sont injectées par `DatabaseSeeder` à chaque démarrage si la base est vide.

---

### 3. Configuration backend (optionnel)

Le fichier `backend/src/main/resources/application.properties` contient les valeurs par défaut. Modifier si nécessaire :

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/gestion_rh
spring.datasource.username=gmao_user
spring.datasource.password=user

app.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
app.jwt.expiration-ms=86400000        # 24 heures
app.jwt.refresh-expiration-ms=604800000  # 7 jours
```

---

### 4. Démarrer le backend

```bash
cd backend
mvn spring-boot:run
```

Le serveur démarre sur **http://localhost:8080**.  
Attendre le message : `Started Pfa2026Application in X seconds`

Pour compiler sans démarrer (vérification) :

```bash
mvn compile
```

Pour générer un JAR autonome :

```bash
mvn package -DskipTests
java -jar target/PFA-2026-0.0.1-SNAPSHOT.jar
```

---

### 5. Démarrer le frontend

Dans un second terminal :

```bash
cd frontend
npm install        # installe les dépendances (recharts, jspdf, html2canvas, react-router-dom…)
npm run dev        # mode développement avec hot-reload
```

L'application est disponible sur **http://localhost:5173**.

Pour un build de production :

```bash
npm run build      # génère frontend/dist/
npm run preview    # prévisualiser le build
```

---

### 6. Comptes de test (créés automatiquement)

| Email | Mot de passe | Rôle |
|---|---|---|
| admin@example.com | Admin123! | ADMIN |
| hr@example.com | Hr123456! | RH |
| manager@example.com | Manager123! | MANAGER |
| employee@example.com | Employee123! | EMPLOYEE |

> L'admin n'a pas de fiche employé — c'est un compte système pur.

---

### Résolution des problèmes courants

**Port déjà utilisé (8080)**
```bash
# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

**Erreur de connexion PostgreSQL**
```bash
# Vérifier que PostgreSQL tourne
sudo systemctl status postgresql
# Vérifier les credentials
psql -U gmao_user -d gestion_rh -c "\l"
```

**`npm install` échoue**
```bash
# Vider le cache et réinstaller
rm -rf node_modules package-lock.json
npm install
```

**Le frontend ne contacte pas le backend (CORS)**  
Vérifier que le backend tourne sur le port 8080. Le CORS est configuré pour `http://localhost:*`.

---

## Fonctionnalités clés

- **Tableau de bord** : statistiques synthétiques (effectifs, congés en attente, présences)
- **Statistiques** : graphiques Recharts — effectif par département, types de contrats, statuts de présence, types de congés
- **Gestion des employés** : CRUD complet avec hiérarchie manager, département, poste
- **Congés** : workflow demande → approbation/rejet avec solde de jours par type
- **Paie** : calcul automatique CNSS (4,48 %), AMO (2,26 %), IR (barème progressif), génération individuelle ou en masse, export PDF de la fiche
- **Recrutement** : offres d'emploi avec candidature en ligne, suivi des statuts
- **Pointage** : enregistrement arrivée/départ, rapport mensuel par employé
- **Thème** : mode clair / sombre via CSS variables
- **Export PDF** : fiche de paie générée côté client (html2canvas → jsPDF)
