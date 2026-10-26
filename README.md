# 🏥 MediTrack — Digital Healthcare Operating System

> **A full-stack MERN digital healthcare platform where patients book diagnostic tests, schedule doctor appointments, pay online with Razorpay, track biological samples through a real-time 5-stage pipeline, receive verified PDF lab reports, and manage clinical prescriptions.**

---

## 📋 Table of Contents
1. [Overview & Architecture](#-overview--architecture)
2. [Tech Stack](#-tech-stack)
3. [Key Features by Role](#-key-features-by-role)
4. [Project Structure](#-project-structure)
5. [Quick Start & Installation](#-quick-start--installation)
6. [Database Seeding & Reset](#-database-seeding--reset)
7. [Environment Variables](#-environment-variables)
8. [Demo Credentials & One-Click Logins](#-demo-credentials--one-click-logins)
9. [REST API Documentation](#-rest-api-documentation)
10. [End-to-End Testing & Verification Walkthrough](#-end-to-end-testing--verification-walkthrough)

---

## 🌟 Overview & Architecture

MediTrack solves the fragmentation of outpatient healthcare by unifying diagnostic lab tests, doctor consultations, tele-prescriptions, and payment receipts into a cohesive digital workflow.

```
                              ┌────────────────────────────────────────┐
                              │            MEDITRACK FRONTEND          │
                              │     React 19 + Vite + Tailwind CSS     │
                              │       Recharts + Lucide + Context      │
                              └───────────────────┬────────────────────┘
                                                  │ Axios + JWT
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │            MEDITRACK BACKEND           │
                              │       Node.js + Express.js (MVC)       │
                              │  RBAC Middleware + Multer + Razorpay   │
                              └───────────────────┬────────────────────┘
                                                  │ Mongoose ODM
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │                DATABASE                │
                              │           MongoDB (12 Models)          │
                              └────────────────────────────────────────┘
```

### The 5-Stage Diagnostic Journey
Diagnostic test bookings sequentially transition through an auditable status pipeline:
$$\text{Booked} \longrightarrow \text{Paid} \longrightarrow \text{Sample Collected} \longrightarrow \text{Processing} \longrightarrow \text{Report Ready}$$

---

## 🛠️ Tech Stack

| Tier | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, React Router v6, Axios, Recharts, React Hot Toast, Lucide React Icons |
| **Backend** | Node.js, Express.js (MVC architecture), JWT (JSON Web Tokens), bcryptjs |
| **Database** | MongoDB with Mongoose (12 schemas with validation, virtuals, and indexes) |
| **Payments** | Razorpay (Test mode with simulated checkout, SHA-256 HMAC verification, and GST tax invoice generation) |
| **File Storage** | Multer disk storage for diagnostic PDFs at `server/uploads/` (with Cloudinary cloud fallback) |
| **Notifications** | Real-time in-app alert dispatcher, Nodemailer email dispatcher stubs, and SMS gateway stubs |

---

## 👥 Key Features by Role

### 1. 🧑‍🦰 Patient Portal
- **Diagnostic Test & Package Booking:** Search tests by organ, condition, sample type, or price. Add individual tests or bundled wellness packages to a slide-over cart.
- **Home Collection vs Lab Visit:** Option for doorstep phlebotomy with address collection or physical walk-in slot selection.
- **Doctor Appointments Directory:** Filter approved specialists by department, consultation fee, and clinical experience.
- **Strict Anti-Double-Booking:** Conflict engine blocks overlapping appointment slots (`409 Conflict`).
- **Live Razorpay Checkout:** Integrated test mode payment simulator verifying cryptographic HMAC signatures.
- **Clinical Tax Invoices:** Instant view and print of official tax receipts with 18% GST breakdown, HSN/SAC codes, and patient demographics.
- **5-Stage Journey Tracker:** Visual animated stepper following sample progression: `Booked` → `Paid` → `Sample Collected` → `Processing` → `Report Ready`.
- **Digital Reports Hub:** Instant download of verified PDF lab reports with critical alert badges and pathologist findings.
- **Digital Prescriptions (Rx):** Access doctor-issued prescriptions detailing dosage, frequency, dietary instructions, and recommended diagnostic tests.
- **Reviews & Support Center:** Leave 1-5 star ratings for consulting doctors and submit support tickets for report delays or phlebotomist inquiries.

### 2. 👨‍⚕️ Doctor Portal
- **Consultation Dashboard:** Real-time metrics for today's visits, pending requests, total treated patients, and average star ratings.
- **Appointment Management:** Accept, confirm, or decline appointment requests with doctor notes.
- **Digital Prescription Writer (Rx):** Modal to record clinical diagnosis, patient vitals (BP, Heart Rate, Weight, Temperature), multi-row medications table, and recommended lab tests.
- **Strict Medical Privacy Guard:** Doctors can **only** access medical dossiers and lab reports for patients who hold a consultation with them (`Appointment.exists({ doctor, patient })`).
- **Weekly Practice Calendar:** Configure working days, consultation shift hours, slot duration intervals (15 to 60 mins), and consultation fees.

### 3. 🔬 Lab Staff Workbench
- **Diagnostic Queue:** Filter assigned bookings by collection type (Home vs Lab) and status.
- **Sample Accessioning:** Advance sample collection with phlebotomist notes and tube barcode IDs.
- **Processing Stage:** Transition samples to automated analyzers.
- **Diagnostic PDF Uploader:** Drag-and-drop verified PDF reports with pathologist clinical summaries and critical marker flags.
- **Automated Patient Alert:** Uploading a report automatically marks the booking as `Report Ready`, triggers in-app notification, and dispatches email notification stubs.

### 4. 🛡️ Admin Control Center
- **Executive Analytics:** Recharts trend curves of 7-day test booking volume and donut charts of revenue distribution.
- **Doctor Credential Approvals:** Review medical council license numbers, experience, and qualifications before approving doctors to consult or log in.
- **User Directory:** Inspect, filter, suspend, reactivate, or delete user accounts across all roles.
- **Tests & Packages CRUD:** Create, update, or remove diagnostic tests, sample types, fasting instructions, turnaround times, and bundled packages.
- **Slot Capacity Management:** Configure maximum daily booking thresholds for home phlebotomists and walk-in centers.
- **Payment & Revenue Ledger:** Inspect all Razorpay transactions, captured orders, and refund requests.
- **Complaints & Grievances Desk:** Review patient support tickets, update statuses (`In Progress`, `Resolved`), and append resolution notes.

---

## 📁 Project Structure

```
meditrack/
├── client/                              # Vite + React Frontend
│   ├── public/                          # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                  # Navbar, Sidebar
│   │   │   ├── layout/                  # DashboardLayout
│   │   │   └── payment/                 # RazorpayCheckoutModal, InvoiceModal
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # JWT session, login/logout, role state
│   │   ├── pages/
│   │   │   ├── admin/                   # AdminDashboard, UserManagement, DoctorApprovals, ...
│   │   │   ├── auth/                    # Login (with 1-click pills), Register
│   │   │   ├── doctor/                  # DoctorDashboard, DoctorAppointments, PatientRecords, ...
│   │   │   ├── lab/                     # LabDashboard, AssignedBookings, UploadReport
│   │   │   └── patient/                 # PatientDashboard, BookTest, BookAppointment, JourneyTracker, ...
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx            # Unified application routing
│   │   │   └── ProtectedRoute.jsx       # RBAC role guards
│   │   ├── services/                    # Axios API service clients
│   │   ├── App.jsx
│   │   ├── index.css                    # Tailwind CSS custom design tokens
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                              # Node.js + Express Backend
│   ├── src/
│   │   ├── config/                      # db.js, razorpay.js
│   │   ├── controllers/                 # auth, admin, booking, appointment, payment, lab, doctor, ...
│   │   ├── middleware/                  # authMiddleware, roleMiddleware, errorMiddleware, uploadMiddleware
│   │   ├── models/                      # 12 Mongoose models (User, Test, Booking, Appointment, ...)
│   │   ├── routes/                      # Express route modules
│   │   ├── utils/                       # seedData.js
│   │   └── server.js                    # Express app initialization
│   ├── uploads/                         # Statically served PDF clinical reports
│   ├── .env.example
│   ├── package.json
│   └── test_phase5.js                   # Automated end-to-end integration test
└── README.md
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** (v18.x or v20.x+)
- **MongoDB** running locally on port `27017` or a MongoDB Atlas URI

### 1. Clone & Setup Backend
```bash
cd server
npm install
cp .env.example .env
```
Ensure your `server/.env` contains:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/meditrack
JWT_SECRET=meditrack_super_secure_jwt_secret_key_2026_dev
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_meditrack12345
RAZORPAY_KEY_SECRET=dev_secret_dummy_key_2026
```

### 2. Setup Frontend
```bash
cd ../client
npm install
cp .env.example .env
```
Ensure `client/.env` contains:
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_meditrack12345
```

### 3. Run the Applications
- **Start Backend:**
  ```bash
  cd server
  npm start
  # Backend running on http://localhost:5000
  ```
- **Start Frontend:**
  ```bash
  cd client
  npm run dev
  # Frontend running on http://localhost:5173
  ```

---

## ⚡ Database Seeding & Reset

MediTrack includes a complete seeding script that wipes and populates the database with realistic healthcare data (1 Admin, 3 Doctors, 2 Lab Staff, 3 Patients, 10 Diagnostic Tests, 3 Packages, sample bookings, payments, and appointments):

```bash
cd server
npm run seed
```

---

## 🔑 Demo Credentials & One-Click Logins

The login page at `http://localhost:5173/login` features **one-click autofill badges** for immediate testing without manually typing credentials:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@meditrack.com` | `patient123` | Rahul Gupta (Active tests & appointments) |
| **Doctor** | `dr.sharma@meditrack.com` | `doctor123` | Dr. Rajesh Sharma (Senior Cardiologist) |
| **Doctor (Alt)** | `dr.nair@meditrack.com` | `doctor123` | Dr. Priya Nair (Neurologist) |
| **Doctor (Pending)** | `dr.verma@meditrack.com` | `doctor123` | Dr. Amit Verma (Pending Admin Approval) |
| **Lab Staff** | `lab@meditrack.com` | `labstaff123` | Suresh Kumar (Phlebotomy & Pathology) |
| **Admin** | `admin@meditrack.com` | `admin123` | System Administrator (Full privileges) |

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register patient or doctor (doctors require admin approval)
- `POST /api/auth/login` — Login and receive JWT access token
- `GET /api/auth/me` — Get current logged-in user and profile

### Admin Operations (`/api/admin`)
- `GET /api/admin/stats` — Overall system KPIs and Recharts 7-day volume
- `GET /api/admin/users` — List and filter all system users
- `PUT /api/admin/users/:id/block` — Suspend or reactivate user
- `DELETE /api/admin/users/:id` — Delete user account
- `GET /api/admin/doctor-approvals` — Pending doctor credential applications
- `PUT /api/admin/doctor-approvals/:id` — Approve or reject doctor registration
- `GET /api/admin/payments` — Financial ledger of all captured transactions
- `GET /api/admin/complaints` — Support grievance tickets queue
- `PUT /api/admin/complaints/:id` — Resolve grievance with admin notes

### Diagnostic Tests & Packages (`/api/tests`)
- `GET /api/tests` — Catalog of active diagnostic tests
- `POST /api/tests` — Create diagnostic test (Admin)
- `PUT /api/tests/:id` — Update test pricing or details (Admin)
- `DELETE /api/tests/:id` — Soft-delete test (Admin)
- `GET /api/tests/packages` — Health checkup wellness packages
- `POST /api/tests/packages` — Create package (Admin)

### Bookings & Diagnostic Journey (`/api/bookings`)
- `POST /api/bookings` — Book tests or packages (Home collection or lab visit)
- `GET /api/bookings/my` — Patient's diagnostic bookings
- `GET /api/bookings/:id/tracker` — Real-time 5-stage Journey Tracker data
- `PUT /api/bookings/:id/cancel` — Cancel pending booking

### Doctor Appointments (`/api/appointments`)
- `GET /api/appointments/doctors` — Directory of approved doctors
- `GET /api/appointments/doctors/:id/availability` — Available slots on selected date
- `POST /api/appointments` — Schedule appointment (**Enforces 409 Conflict check**)
- `GET /api/appointments/my` — Patient's appointments list
- `PUT /api/appointments/:id/cancel` — Cancel scheduled appointment

### Payments & Invoices (`/api/payments`)
- `POST /api/payments/create-order` — Create Razorpay order (Test mode)
- `POST /api/payments/verify` — Verify HMAC SHA-256 signature and capture payment
- `GET /api/payments/my` — Patient's payment history and invoice generator
- `GET /api/payments/:id/invoice` — Download/view printable clinical tax invoice

### Laboratory Staff (`/api/lab`)
- `GET /api/lab/stats` — Metrics on collections, processing, and reports uploaded
- `GET /api/lab/bookings` — Diagnostic queue with filters
- `PUT /api/lab/bookings/:id/status` — Transition to `Sample Collected` or `Processing`
- `POST /api/lab/reports` — Upload verified PDF report and complete booking

### Doctor Workflow (`/api/doctor`)
- `GET /api/doctor/stats` — Today's consults, treated patients, and ratings
- `GET /api/doctor/appointments` — Consultations queue
- `PUT /api/doctor/appointments/:id/status` — Confirm or decline appointment
- `POST /api/doctor/prescriptions` — Issue digital prescription (Rx)
- `GET /api/doctor/patients/:patientId` — **Privacy-guarded** patient medical dossier
- `PUT /api/doctor/availability` — Configure weekly hours, slot intervals, and fee

### Patient Reports, Feedback & Alerts
- `GET /api/reports/my` — Download patient's diagnostic reports
- `POST /api/feedback/reviews` — Rate and review completed doctor consultations
- `POST /api/feedback/complaints` — Submit support ticket
- `GET /api/feedback/prescriptions/my` — Patient's prescriptions
- `GET /api/notifications` — In-app alerts with unread counter
- `PUT /api/notifications/mark-all-read` — Clear notification badges

---

## 🧪 End-to-End Testing & Verification Walkthrough

Follow this step-by-step walkthrough to test the platform:

### 1. Test Patient Booking & Payment
1. Navigate to `http://localhost:5173/login`.
2. Click the **"Patient"** demo badge to autofill credentials, then click **Sign In**.
3. Go to **"Book Diagnostic Test"** in the sidebar.
4. Add *"Complete Blood Count (CBC)"* and *"Lipid Profile"* to your cart.
5. Choose **"Home Collection"**, select tomorrow's date, pick a slot, and click **Confirm Booking**.
6. On the **Payment History** page, click **"Pay Online"**.
7. In the Razorpay modal, click **"Simulate Successful Payment"**.
8. Notice the status transitions to **"Paid"** with green badge. Click **"View Invoice"** to inspect and print your official GST tax receipt.

### 2. Follow the Diagnostic Journey Tracker
1. In the sidebar, click **"Journey Tracker"**.
2. Select your recent booking. Observe the visual stepper: **Booked (Green)** → **Paid (Green)** → **Sample Collected (Amber)**.

### 3. Lab Staff Accessioning & PDF Report Upload
1. Log out, then log in using the **"Lab Staff"** badge (`lab@meditrack.com`).
2. On the **Lab Dashboard**, view the live metric cards and Recharts pipeline breakdown.
3. Open **"Assigned Bookings"** from the sidebar. Locate the patient's booking.
4. Click **"Collect Sample"** and submit phlebotomy notes.
5. Click **"Send to Processing"**.
6. Click **"Upload PDF Report"**, attach any `.pdf` file, provide pathologist observations, and click **Publish Report**.

### 4. Doctor Appointment & Prescription Workflow
1. Log out, then log in as **Patient**.
2. Go to **"Doctor Appointments"** → select **Dr. Rajesh Sharma** (Cardiologist) → pick a slot and confirm.
3. Log out and log in using the **"Doctor"** badge (`dr.sharma@meditrack.com`).
4. In **"Appointments"**, find the scheduled visit and click **"Confirm Slot"**.
5. Click **"Issue Digital Prescription"**:
   - Diagnosis: *"Mild cardiac palpitations, sinus rhythm normal."*
   - Add medications, dosage, and recommended diagnostic tests.
   - Click **"Issue Prescription & Complete Visit"**.
6. Go to **"Patient Records"** to verify that you can review the patient's diagnostic lab reports and medical dossier under the clinical privacy guard.

### 5. Automated Backend Integration Suite
You can also run the automated Node.js test script at any time to verify all 12 backend checkpoints:
```bash
cd server
node test_phase5.js
```
Expected output:
```
✓ Patient logged in
✓ Sample status transition to 'Sample Collected' (200)
✓ Sample status transition to 'Processing' (200)
✓ Verified PDF Diagnostic Report Uploaded (201)
✓ Patient accessed report and in-app alert (200)
✓ Doctor confirmed slot & issued prescription (201)
✓ Doctor accessed patient dossier under privacy guard (200)
✓ Review & support complaint logged (201)
--- ALL PHASE 5 INTEGRATION TESTS PASSED CLEANLY! ---
```

---

## 📄 License
This project is licensed under the MIT License — designed for educational and professional healthcare demonstration.
