# Tirupati Balaji Tours & Travels – Fleet & Trip Management Platform

A modern, full-stack Travel & Fleet Trip Management Platform designed and engineered for **Tirupati Balaji Tours & Travels**.

---

## 🌟 Architecture Overview

The platform features **four separate application portals** accessible directly via designated clean routes:

| Portal | Route | Description |
| :--- | :--- | :--- |
| **Public Website** | `/` | Responsive customer-facing travel portal showcasing packages, destinations, fleet services, and booking inquiry submission. |
| **Admin Dashboard** | `/admin` | Enterprise administration suite with fixed top header & fixed sidebar, full fleet control, user management, client directory, trip dispatch, expense auditing, and deal settlement. |
| **Manager Dashboard** | `/manager` | Role-based operations portal strictly governed by admin-assigned permissions (Trips, Assign Drivers, Review Expenses, Reports). **Client personal details are strictly hidden/masked.** |
| **Driver Terminal** | `/driver` | High-productivity terminal optimized for mobile screens & desktop, featuring OTP login, trip assignments, fuel/odometer receipt submission, offline sync queue, and instant wallet ledger crediting. |

---

## 🎨 Design & Branding
- **Color Palette**: Deep Purple (`#1b1030`, `#1e1035`), Vibrant Orange (`#ea580c`, `#f97316`), Clean White & Slate.
- **Fixed Layouts**: Fixed sidebar and fixed top navigation bar ensuring zero scrolling drift on operational dashboards.
- **Official Brand Assets**: Features the authentic Tirupati Balaji Tours & Travels brand emblem.

---

## 🚀 Key Modules & Capabilities

### 1. Admin Management Suite (`/admin`)
- **Executive KPI Dashboard**: Live package counts, active trips breakdown, driver availability matrix, expenses approved/pending, and financial summaries.
- **User Management**: Complete CRUD for Operations Managers and Fleet Drivers (licence numbers, expiry dates, documents, contact details, activation/deactivation).
- **Manager Granular Permissions**: Admin can assign individual permissions per manager (`view_trips`, `add_trips`, `assign_drivers`, `review_expenses`, `view_reports`).
- **Client & Traveller Directory**: Linked booking contacts and traveller logs. Protected by **Zero-Leak Client Privacy** (only visible to Admin).
- **Trip Dispatch & Date-Clash Prevention**: Validates overlapping trip dates and prevents double-booking drivers.
- **Expense Review & Lightbox**: Scrutinize driver submissions with photo receipt viewer, category breakdown (Fuel, Toll, Parking, Maintenance), and approval/rejection notes.
- **Trip Deal Closing & Wallet Crediting**: Once a trip completes, entering salary and closing the deal locks the trip as read-only and automatically credits the driver's wallet ledger.
- **PDF & Excel Reporting**: Instant tabular export of trip rosters, driver performance, and categorized expense ledgers using `jspdf`, `jspdf-autotable`, and `xlsx`.
- **System Activity Audit**: Tamper-evident audit log tracking every action performed by admins and managers.

### 2. Manager Operations Suite (`/manager`)
- Enforces Admin-assigned RBAC permissions at both UI and API levels.
- **Client Privacy Safeguard**: Client names, phone numbers, and emails are never returned to or rendered in the Manager portal.
- All actions logged in the master audit activity stream.

### 3. Driver Application Terminal (`/driver`)
- **Seamless Responsiveness**: Fully functional on both mobile phones and desktop displays.
- **Authentication**: Secure Registered Email OTP verification & Google SSO flow.
- **Trip Statuses**: Upcoming Projects, Recent Trips, and Completed Deals.
- **Expense Submission**: Category-specific forms including Fuel (odometer reading, quantity, fuel bill) and receipt image uploads.
- **Offline Sync**: Caches expenses offline in `localStorage` when disconnected and automatically synchronizes when network reconnects.
- **Driver Wallet**: Live balance, trip-by-trip earnings breakdown, and complete transaction ledger history.
- **Driver Availability**: Quick toggle between `Available`, `On Trip`, and `On Leave`.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons
- **Backend**: Node.js, Express 5 REST API
- **File & Media Handling**: Multer (Receipts, Licence Proofs, Avatars)
- **Export Engines**: `jspdf`, `jspdf-autotable`, `xlsx`
- **Data Store**: JSON File-based persistence engine (`server/data/db.json`)

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/codtech1208408/tirupati-travels.git
cd tirupati-travels

# Install dependencies
npm install
```

### Running the Application
```bash
# Start both backend server (Port 5000) and frontend Vite server (Port 5173)
npm run start
```

Access the applications in your browser:
- Public Website: `http://localhost:5173/`
- Admin Panel: `http://localhost:5173/admin`
- Manager Panel: `http://localhost:5173/manager`
- Driver App: `http://localhost:5173/driver`

---

## 🔑 Default Demo Accounts

| Role | Email | Access |
| :--- | :--- | :--- |
| **Admin** | `admin@tirupatibalaji.com` | Full Administrative Suite |
| **Manager** | `priya.manager@tirupatibalaji.com` | Operations Suite (RBAC Permissions) |
| **Driver** | `ramesh.driver@tirupatibalaji.com` | Driver Terminal (OTP: `123456`) |

---

## 📄 License
Proprietary — Tirupati Balaji Tours & Travels. All rights reserved.

