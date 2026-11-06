import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'tirupati-balaji-secret-jwt-key-2026';

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Directories & Storage
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? '/tmp/data' : path.join(__dirname, 'data');
const UPLOADS_DIR = isVercel ? '/tmp/uploads' : path.join(__dirname, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SEED_DB_FILE = path.join(__dirname, 'data', 'db.json');

try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch (e) {
  // Ignored in read-only setups
}

// Serve uploads statically
app.use('/uploads', express.static(UPLOADS_DIR));
const STATIC_UPLOADS = path.join(__dirname, '..', 'client', 'public', 'uploads');
if (fs.existsSync(STATIC_UPLOADS)) {
  app.use('/uploads', express.static(STATIC_UPLOADS));
}
app.use('/logo.png', (req, res) => {
  const logoPath = path.join(__dirname, '..', 'client', 'public', 'logo.png');
  if (fs.existsSync(logoPath)) {
    res.sendFile(logoPath);
  } else {
    res.status(404).send('Logo not found');
  }
});

// Serve frontend dist build if available
const DIST_DIR = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
}

// Configure Multer for proof & document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    } catch (e) { }
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'proof-' + uniqueSuffix + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

// Database helper functions
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      if (fs.existsSync(SEED_DB_FILE)) {
        try {
          if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
          fs.copyFileSync(SEED_DB_FILE, DB_FILE);
        } catch (copyErr) {
          const seedContent = fs.readFileSync(SEED_DB_FILE, 'utf-8');
          return JSON.parse(seedContent);
        }
      } else {
        return {
          users: [],
          packages: [],
          clients: [],
          trips: [],
          expenses: [],
          walletTransactions: [],
          activityLogs: [],
          notifications: [],
          inquiries: [],
        };
      }
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json:', err);
    if (fs.existsSync(SEED_DB_FILE)) {
      try {
        return JSON.parse(fs.readFileSync(SEED_DB_FILE, 'utf-8'));
      } catch (e) { }
    }
    return {
      users: [],
      packages: [],
      clients: [],
      trips: [],
      expenses: [],
      walletTransactions: [],
      activityLogs: [],
      notifications: [],
      inquiries: [],
    };
  }
}

function writeDb(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return false;
  }
}

// Helper: Log Activity
function logActivity(userId, userName, userRole, action, details) {
  const db = readDb();
  const newLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    userId: userId || 'system',
    userName: userName || 'System',
    userRole: userRole || 'system',
    action,
    details,
  };
  db.activityLogs = [newLog, ...(db.activityLogs || [])].slice(0, 500); // keep recent 500
  writeDb(db);
}

// Helper: Create Notification
function createNotification({ recipientRole, recipientId, title, message, type, tripId }) {
  const db = readDb();
  const notif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    recipientRole: recipientRole || 'all',
    recipientId: recipientId || null,
    title,
    message,
    type: type || 'general',
    isRead: false,
    createdAt: new Date().toISOString(),
    tripId: tripId || null,
  };
  db.notifications = [notif, ...(db.notifications || [])].slice(0, 300);
  writeDb(db);
}

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Optional Auth (for role-aware endpoints that can be public)
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err && user) req.user = user;
      next();
    });
  } else {
    next();
  }
}

// In-memory OTP storage: email -> { otp, expiresAt, attempts }
const otpStore = new Map();

/* ==========================================================================
   1. AUTHENTICATION & SECURITY APIS
   ========================================================================== */

// POST /api/auth/send-otp
app.post('/api/auth/send-otp', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(404).json({
      error: 'Unregistered email address. Only accounts created by Admin can log in.',
    });
  }

  if (user.status === 'deactivated' || user.status === 'blocked') {
    return res.status(403).json({
      error: 'Your account has been deactivated or blocked by Admin. Contact support.',
    });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

  otpStore.set(cleanEmail, {
    otp,
    expiresAt,
    attempts: 0,
  });

  console.log(`[OTP GENERATED] For ${cleanEmail}: ${otp}`);

  // Return OTP in response so demo/review is smooth and hassle-free
  res.json({
    success: true,
    message: `OTP sent to ${cleanEmail}. Valid for 5 minutes.`,
    debugOtp: otp, // For seamless testing
    userRole: user.role,
    userName: user.name,
  });
});

// POST /api/auth/verify-otp
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.status === 'deactivated') {
    return res.status(403).json({ error: 'Account is deactivated' });
  }

  const stored = otpStore.get(cleanEmail);

  // Standard verification or demo OTP bypass (123456 or generated otp)
  const isMatch = (stored && stored.otp === otp.trim()) || otp.trim() === '123456';

  if (!isMatch) {
    if (stored) {
      stored.attempts = (stored.attempts || 0) + 1;
      if (stored.attempts >= 4) {
        otpStore.delete(cleanEmail);
        return res.status(429).json({ error: 'Too many failed attempts. Please request a new OTP.' });
      }
    }
    return res.status(400).json({ error: 'Invalid verification OTP' });
  }

  if (stored && Date.now() > stored.expiresAt && otp.trim() !== '123456') {
    otpStore.delete(cleanEmail);
    return res.status(400).json({ error: 'OTP has expired. Please request a new OTP.' });
  }

  // Success: Clear OTP
  otpStore.delete(cleanEmail);

  // Generate JWT token
  const tokenPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions || [],
  };
  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

  logActivity(user.id, user.name, user.role, 'USER_LOGIN', `User logged in via OTP (${user.role})`);

  res.json({
    success: true,
    token,
    user,
  });
});

// POST /api/auth/google
app.post('/api/auth/google', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Google email required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(403).json({
      error: `Unregistered email (${email}). Only accounts created by Admin can log in with Google.`,
    });
  }

  if (user.status === 'deactivated') {
    return res.status(403).json({ error: 'Account is deactivated. Contact Admin.' });
  }

  const tokenPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions || [],
  };
  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

  logActivity(user.id, user.name, user.role, 'GOOGLE_LOGIN', `User logged in via Google (${user.role})`);

  res.json({
    success: true,
    token,
    user,
  });
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

/* ==========================================================================
   2. USER MANAGEMENT & MANAGER PERMISSIONS (ADMIN ONLY)
   ========================================================================== */

// GET /api/users
app.get('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const { role } = req.query;
  const db = readDb();
  let users = db.users || [];
  if (role) {
    users = users.filter((u) => u.role === role);
  }
  res.json({ users });
});

// POST /api/users
app.post('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const {
    role,
    name,
    email,
    mobile,
    photo,
    permissions,
    licenseNumber,
    licenseExpiry,
    address,
    emergencyContact,
    documents,
  } = req.body;

  if (!role || !name || !email) {
    return res.status(400).json({ error: 'Role, name and email are required' });
  }

  const db = readDb();
  const cleanEmail = email.trim().toLowerCase();

  if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return res.status(400).json({ error: 'A user with this email already exists' });
  }

  const idPrefix = role === 'manager' ? 'usr-mgr' : role === 'driver' ? 'usr-drv' : 'usr-admin';
  const newUser = {
    id: `${idPrefix}-${Date.now().toString().slice(-4)}`,
    role,
    name: name.trim(),
    email: cleanEmail,
    mobile: mobile || '',
    photo: photo || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  if (role === 'manager') {
    newUser.permissions = permissions || [
      'view_trips',
      'add_trips',
      'assign_drivers',
      'review_expenses',
      'view_reports',
    ];
  }

  if (role === 'driver') {
    newUser.availability = 'Available';
    newUser.licenseNumber = licenseNumber || 'AP-03-2024-001289';
    newUser.licenseExpiry = licenseExpiry || '2034-12-31';
    newUser.address = address || 'Tirupati, Andhra Pradesh';
    newUser.emergencyContact = emergencyContact || '';
    newUser.documents = documents || [
      { name: 'Commercial Driving License', type: 'PDF', verified: true },
    ];
    newUser.walletBalance = 0;
    newUser.totalEarnings = 0;
    newUser.totalExpenses = 0;
    newUser.totalReimbursements = 0;
  }

  db.users.push(newUser);
  writeDb(db);

  logActivity(req.user.id, req.user.name, 'admin', 'USER_CREATED', `Created new ${role}: ${newUser.name} (${newUser.email})`);

  res.status(201).json({ success: true, user: newUser });
});

// PUT /api/users/:id
app.put('/api/users/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const db = readDb();
  const idx = db.users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  const existing = db.users[idx];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id, // prevent ID overwrite
    role: existing.role, // prevent role change
  };

  db.users[idx] = updated;
  writeDb(db);

  logActivity(req.user.id, req.user.name, 'admin', 'USER_UPDATED', `Updated ${existing.role}: ${updated.name}`);

  res.json({ success: true, user: updated });
});

// DELETE /api/users/:id
app.delete('/api/users/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const db = readDb();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Prevent deleting super admin
  if (user.id === 'usr-admin-1') {
    return res.status(400).json({ error: 'Cannot delete primary Super Admin' });
  }

  // Check if driver has active/ongoing trips
  if (user.role === 'driver') {
    const hasActiveTrips = (db.trips || []).some(
      (t) => t.driverId === user.id && (t.status === 'Ongoing' || t.status === 'Upcoming')
    );
    if (hasActiveTrips) {
      return res.status(400).json({
        error: 'Cannot delete driver with upcoming or ongoing trips. Reassign trips first.',
      });
    }
  }

  db.users = db.users.filter((u) => u.id !== req.params.id);
  writeDb(db);

  logActivity(req.user.id, req.user.name, 'admin', 'USER_DELETED', `Deleted ${user.role}: ${user.name}`);

  res.json({ success: true, message: 'User deleted successfully' });
});

/* ==========================================================================
   3. PACKAGE MANAGEMENT
   ========================================================================== */

// GET /api/packages
app.get('/api/packages', (req, res) => {
  const db = readDb();
  const { search, status } = req.query;
  let pkgs = db.packages || [];

  if (status) {
    pkgs = pkgs.filter((p) => p.status === status);
  }

  if (search) {
    const s = search.toLowerCase();
    pkgs = pkgs.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.route.toLowerCase().includes(s) ||
        p.vehicleType.toLowerCase().includes(s)
    );
  }

  res.json({ packages: pkgs });
});

// POST /api/packages
app.post('/api/packages', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { name, description, route, duration, vehicleType, notes, price, image } = req.body;
  if (!name || !route) {
    return res.status(400).json({ error: 'Package name and route are required' });
  }

  const db = readDb();
  const newPkg = {
    id: `PKG-${String((db.packages?.length || 0) + 1).padStart(3, '0')}`,
    name: name.trim(),
    description: description || '',
    route: route.trim(),
    duration: duration || '1 Day',
    vehicleType: vehicleType || 'Tempo Traveller / Innova Crysta',
    notes: notes || '',
    price: Number(price) || 0,
    status: 'active',
    image: image || 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80',
  };

  db.packages = [newPkg, ...(db.packages || [])];
  writeDb(db);

  logActivity(req.user.id, req.user.name, 'admin', 'PACKAGE_CREATED', `Created package: ${newPkg.name}`);

  res.status(201).json({ success: true, package: newPkg });
});

// PUT /api/packages/:id
app.put('/api/packages/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const db = readDb();
  const idx = db.packages.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Package not found' });

  db.packages[idx] = { ...db.packages[idx], ...req.body, id: db.packages[idx].id };
  writeDb(db);

  logActivity(req.user.id, req.user.name, 'admin', 'PACKAGE_UPDATED', `Updated package: ${db.packages[idx].name}`);

  res.json({ success: true, package: db.packages[idx] });
});

// DELETE /api/packages/:id
app.delete('/api/packages/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const db = readDb();
  const pkg = db.packages.find((p) => p.id === req.params.id);
  if (!pkg) return res.status(404).json({ error: 'Package not found' });

  db.packages = db.packages.filter((p) => p.id !== req.params.id);
  writeDb(db);

  logActivity(req.user.id, req.user.name, 'admin', 'PACKAGE_DELETED', `Deleted package: ${pkg.name}`);

  res.json({ success: true, message: 'Package deleted' });
});

/* ==========================================================================
   4. CLIENT / TRAVELLER MANAGEMENT (STRICT PRIVACY - ADMIN ONLY)
   ========================================================================== */

// Middleware to strictly enforce Client Privacy
function requireAdminForClients(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access Denied: Client personal and contact details are visible ONLY to Admin.',
    });
  }
  next();
}

// GET /api/clients
app.get('/api/clients', authenticateToken, requireAdminForClients, (req, res) => {
  const db = readDb();
  res.json({ clients: db.clients || [] });
});

// POST /api/clients
app.post('/api/clients', authenticateToken, requireAdminForClients, (req, res) => {
  const { name, mobile, email, address, travellersCount, idProof, specialRequirements } = req.body;
  if (!name || !mobile) {
    return res.status(400).json({ error: 'Client name and mobile number are required' });
  }

  const db = readDb();
  const newClient = {
    id: `CLI-${String((db.clients?.length || 0) + 1).padStart(3, '0')}`,
    name: name.trim(),
    mobile: mobile.trim(),
    email: email || '',
    address: address || '',
    travellersCount: Number(travellersCount) || 1,
    idProof: idProof || 'Aadhaar Verified',
    specialRequirements: specialRequirements || '',
    createdAt: new Date().toISOString(),
  };

  db.clients = [newClient, ...(db.clients || [])];
  writeDb(db);

  logActivity(req.user.id, req.user.name, 'admin', 'CLIENT_CREATED', `Added client: ${newClient.name} (${newClient.mobile})`);

  res.status(201).json({ success: true, client: newClient });
});

// PUT /api/clients/:id
app.put('/api/clients/:id', authenticateToken, requireAdminForClients, (req, res) => {
  const db = readDb();
  const idx = db.clients.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Client not found' });

  db.clients[idx] = { ...db.clients[idx], ...req.body, id: db.clients[idx].id };
  writeDb(db);

  logActivity(req.user.id, req.user.name, 'admin', 'CLIENT_UPDATED', `Updated client: ${db.clients[idx].name}`);

  res.json({ success: true, client: db.clients[idx] });
});

// DELETE /api/clients/:id
app.delete('/api/clients/:id', authenticateToken, requireAdminForClients, (req, res) => {
  const db = readDb();
  const client = db.clients.find((c) => c.id === req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  db.clients = db.clients.filter((c) => c.id !== req.params.id);
  writeDb(db);

  logActivity(req.user.id, req.user.name, 'admin', 'CLIENT_DELETED', `Deleted client: ${client.name}`);

  res.json({ success: true, message: 'Client deleted' });
});

/* ==========================================================================
   5. TRIP MANAGEMENT & DRIVER ASSIGNMENT (WITH PRIVACY SANITIZATION)
   ========================================================================== */

// Helper: Sanitize trip for non-admin users (Manager, Driver)
function sanitizeTripForRole(trip, role) {
  if (role === 'admin') return trip;

  // Clone trip
  const sanitized = { ...trip };
  // Never expose client personal contact details
  delete sanitized.client;
  delete sanitized.clientId;
  sanitized.clientName = 'Pilgrim Group';
  sanitized.clientPhone = 'Confidential (Admin Managed)';
  sanitized.clientEmail = 'Confidential';
  return sanitized;
}

// Helper: Check Date Clash for Driver
function checkDriverDateClash(trips, driverId, startDate, endDate, excludeTripId = null) {
  const newStart = new Date(startDate).getTime();
  const newEnd = new Date(endDate).getTime();

  return trips.some((t) => {
    if (t.id === excludeTripId) return false;
    if (t.driverId !== driverId) return false;
    if (t.status === 'Cancelled' || t.status === 'Closed') return false;

    const tStart = new Date(t.startDate).getTime();
    const tEnd = new Date(t.endDate).getTime();

    // Check overlap
    return newStart <= tEnd && newEnd >= tStart;
  });
}

// GET /api/trips
app.get('/api/trips', authenticateToken, (req, res) => {
  const db = readDb();
  const role = req.user.role;
  let trips = db.trips || [];

  // Drivers only see their own trips
  if (role === 'driver') {
    trips = trips.filter((t) => t.driverId === req.user.id);
  }

  // Populate client details for Admin ONLY
  const enriched = trips.map((t) => {
    if (role === 'admin') {
      const client = (db.clients || []).find((c) => c.id === t.clientId);
      return { ...t, client: client || null };
    } else {
      return sanitizeTripForRole(t, role);
    }
  });

  res.json({ trips: enriched });
});

// GET /api/trips/:id
app.get('/api/trips/:id', authenticateToken, (req, res) => {
  const db = readDb();
  const trip = (db.trips || []).find((t) => t.id === req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  // Driver authorization
  if (req.user.role === 'driver' && trip.driverId !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to view this trip' });
  }

  if (req.user.role === 'admin') {
    const client = (db.clients || []).find((c) => c.id === trip.clientId);
    return res.json({ trip: { ...trip, client: client || null } });
  }

  res.json({ trip: sanitizeTripForRole(trip, req.user.role) });
});

// POST /api/trips
app.post('/api/trips', authenticateToken, (req, res) => {
  // Check permissions: Admin or Manager with 'add_trips'
  if (req.user.role === 'manager') {
    const perms = req.user.permissions || [];
    if (!perms.includes('add_trips')) {
      return res.status(403).json({ error: 'You do not have permission to add trips.' });
    }
  } else if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin or Manager access required' });
  }

  const {
    name,
    packageId,
    clientId,
    pickupLocation,
    dropLocation,
    startDate,
    endDate,
    route,
    stops,
    vehicleDetails,
    instructions,
    driverId,
    salary,
    travellersCount,
    notes,
  } = req.body;

  if (!name || !startDate || !endDate) {
    return res.status(400).json({ error: 'Trip name, start date and end date are required' });
  }

  const db = readDb();

  // Validate driver and check date clashes
  let driverName = null;
  if (driverId) {
    const driver = (db.users || []).find((u) => u.id === driverId && u.role === 'driver');
    if (!driver) return res.status(400).json({ error: 'Selected driver not found' });
    if (driver.status === 'deactivated') {
      return res.status(400).json({ error: 'Selected driver is deactivated' });
    }

    const hasClash = checkDriverDateClash(db.trips || [], driverId, startDate, endDate);
    if (hasClash) {
      return res.status(400).json({
        error: `Driver ${driver.name} is already assigned to another active trip during this date range! Prevented double booking.`,
      });
    }
    driverName = driver.name;
  }

  const tripYear = new Date(startDate).getFullYear() || 2026;
  const count = (db.trips?.length || 0) + 1;
  const newTrip = {
    id: `TIR-${tripYear}-${String(count).padStart(3, '0')}`,
    name: name.trim(),
    packageId: packageId || null,
    clientId: clientId || null,
    travellersCount: Number(travellersCount) || 1,
    pickupLocation: pickupLocation || 'Tirupati Railway Station',
    dropLocation: dropLocation || 'Alipiri Gate / Hotel',
    startDate,
    endDate,
    route: route || 'Tirupati Circuit',
    stops: stops || 'Tirumala, Alipiri',
    vehicleDetails: vehicleDetails || 'Tempo Traveller',
    instructions: instructions || 'Drive carefully and assist pilgrims with darshan timings.',
    driverId: driverId || null,
    driverName: driverName,
    status: 'Upcoming',
    salary: Number(salary) || 0,
    salaryStatus: 'Pending',
    notes: notes || '',
    closedAt: null,
    closedBy: null,
    adjustments: [],
    createdAt: new Date().toISOString(),
    createdBy: req.user.id,
  };

  db.trips = [newTrip, ...(db.trips || [])];

  // If driver assigned, notify driver & update availability if needed
  if (driverId) {
    createNotification({
      recipientRole: 'driver',
      recipientId: driverId,
      title: 'New Trip Assigned!',
      message: `You have been assigned to trip ${newTrip.id}: ${newTrip.name} starting on ${newTrip.startDate.slice(0, 10)}.`,
      type: 'trip_assigned',
      tripId: newTrip.id,
    });
  }

  writeDb(db);

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'TRIP_CREATED',
    `Created trip ${newTrip.id} (${newTrip.name})${driverName ? ` assigned to ${driverName}` : ''}`
  );

  res.status(201).json({
    success: true,
    trip: sanitizeTripForRole(newTrip, req.user.role),
  });
});

// PUT /api/trips/:id
app.put('/api/trips/:id', authenticateToken, (req, res) => {
  const db = readDb();
  const idx = db.trips.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Trip not found' });

  const existing = db.trips[idx];

  // Prevent editing closed trips (read-only requirement)
  if (existing.status === 'Closed') {
    return res.status(400).json({
      error: 'This trip is CLOSED and read-only. Use the adjustment entry module for corrections.',
    });
  }

  // Manager check
  if (req.user.role === 'manager') {
    const perms = req.user.permissions || [];
    if (!perms.includes('assign_drivers') && req.body.driverId !== undefined) {
      return res.status(403).json({ error: 'Permission denied: Cannot assign driver.' });
    }
  }

  const newDriverId = req.body.driverId !== undefined ? req.body.driverId : existing.driverId;
  const newStartDate = req.body.startDate || existing.startDate;
  const newEndDate = req.body.endDate || existing.endDate;

  // If driver assigned or dates changed, check date clash
  let newDriverName = existing.driverName;
  if (newDriverId && (newDriverId !== existing.driverId || req.body.startDate || req.body.endDate)) {
    const driver = db.users.find((u) => u.id === newDriverId && u.role === 'driver');
    if (!driver) return res.status(400).json({ error: 'Selected driver not found' });

    const hasClash = checkDriverDateClash(db.trips, newDriverId, newStartDate, newEndDate, existing.id);
    if (hasClash) {
      return res.status(400).json({
        error: `Driver ${driver.name} is already assigned to another active trip during these dates! Prevented double booking.`,
      });
    }
    newDriverName = driver.name;

    // Notify driver if reassigned
    if (newDriverId !== existing.driverId) {
      createNotification({
        recipientRole: 'driver',
        recipientId: newDriverId,
        title: 'Trip Assigned!',
        message: `You were assigned to trip ${existing.id}: ${existing.name}.`,
        type: 'trip_assigned',
        tripId: existing.id,
      });

      // Also notify unassigned driver if any
      if (existing.driverId) {
        createNotification({
          recipientRole: 'driver',
          recipientId: existing.driverId,
          title: 'Trip Unassigned',
          message: `You were unassigned from trip ${existing.id}.`,
          type: 'trip_unassigned',
          tripId: existing.id,
        });
      }
    }
  } else if (newDriverId === null || newDriverId === '') {
    newDriverName = null;
  }

  const updatedTrip = {
    ...existing,
    ...req.body,
    id: existing.id,
    driverId: newDriverId,
    driverName: newDriverName,
    startDate: newStartDate,
    endDate: newEndDate,
  };

  db.trips[idx] = updatedTrip;
  writeDb(db);

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'TRIP_UPDATED',
    `Updated trip ${existing.id} (${existing.name})`
  );

  res.json({
    success: true,
    trip: sanitizeTripForRole(updatedTrip, req.user.role),
  });
});

// PUT /api/trips/:id/status
app.put('/api/trips/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const db = readDb();
  const idx = db.trips.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Trip not found' });

  const existing = db.trips[idx];
  if (existing.status === 'Closed') {
    return res.status(400).json({ error: 'Closed trips are read-only' });
  }

  existing.status = status;
  db.trips[idx] = existing;

  // If driver on trip, update driver availability
  if (existing.driverId) {
    const driverIdx = db.users.findIndex((u) => u.id === existing.driverId);
    if (driverIdx !== -1) {
      if (status === 'Ongoing') {
        db.users[driverIdx].availability = 'On Trip';
      } else if (status === 'Completed' || status === 'Cancelled') {
        db.users[driverIdx].availability = 'Available';
      }
    }
  }

  // If completed, notify Admin
  if (status === 'Completed') {
    createNotification({
      recipientRole: 'admin',
      title: 'Trip Completed – Awaiting Closing',
      message: `Trip ${existing.id} (${existing.name}) has been marked as Completed. Ready for expense review & salary closing.`,
      type: 'trip_completed',
      tripId: existing.id,
    });
  }

  writeDb(db);

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'TRIP_STATUS_CHANGED',
    `Changed trip ${existing.id} status to ${status}`
  );

  res.json({ success: true, trip: sanitizeTripForRole(existing, req.user.role) });
});

/* ==========================================================================
   6. SALARY MANAGEMENT, CLOSING DEALS & DRIVER WALLET
   ========================================================================== */

// POST /api/trips/:id/close-deal
app.post('/api/trips/:id/close-deal', authenticateToken, (req, res) => {
  // Only Admin or explicitly permitted Manager
  if (req.user.role === 'manager') {
    const perms = req.user.permissions || [];
    if (!perms.includes('close_deals')) {
      return res.status(403).json({ error: 'You do not have permission to close deals and add salary.' });
    }
  } else if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { salary, notes } = req.body;
  const numSalary = Number(salary);
  if (isNaN(numSalary) || numSalary < 0) {
    return res.status(400).json({ error: 'A valid salary amount is required' });
  }

  const db = readDb();
  const tripIdx = db.trips.findIndex((t) => t.id === req.params.id);
  if (tripIdx === -1) return res.status(404).json({ error: 'Trip not found' });

  const trip = db.trips[tripIdx];
  if (trip.status === 'Closed') {
    return res.status(400).json({ error: 'Trip has already been closed and locked.' });
  }

  if (!trip.driverId) {
    return res.status(400).json({ error: 'Cannot close trip without an assigned driver.' });
  }

  // Find Driver
  const driverIdx = db.users.findIndex((u) => u.id === trip.driverId);
  if (driverIdx === -1) {
    return res.status(404).json({ error: 'Assigned driver not found in user database.' });
  }
  const driver = db.users[driverIdx];

  // Calculate Approved Expense Reimbursements for this trip
  const tripExpenses = (db.expenses || []).filter(
    (e) => e.tripId === trip.id && e.driverId === trip.driverId
  );
  const approvedExpenses = tripExpenses.filter((e) => e.status === 'Approved');
  const totalApprovedReimbursement = approvedExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Update Trip
  trip.salary = numSalary;
  trip.salaryStatus = 'Paid';
  trip.status = 'Closed';
  trip.closedAt = new Date().toISOString();
  trip.closedBy = req.user.id;
  if (notes) trip.closeNotes = notes;

  // Credit Driver Wallet: Salary + Approved Reimbursements
  const prevBalance = Number(driver.walletBalance) || 0;
  const totalCredit = numSalary; // Salary credited to wallet

  driver.walletBalance = prevBalance + totalCredit;
  driver.totalEarnings = (Number(driver.totalEarnings) || 0) + numSalary;
  driver.totalReimbursements = (Number(driver.totalReimbursements) || 0) + totalApprovedReimbursement;
  driver.availability = 'Available';

  // Create Wallet Ledger Transaction for Trip Salary
  const salaryTx = {
    id: `WT-${Date.now()}-sal`,
    driverId: driver.id,
    tripId: trip.id,
    type: 'credit',
    category: 'Trip Salary',
    amount: numSalary,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    notes: `Trip Salary - ${trip.id} credited upon deal closing`,
    balanceAfter: driver.walletBalance,
    createdAt: new Date().toISOString(),
  };

  db.walletTransactions = [salaryTx, ...(db.walletTransactions || [])];
  db.trips[tripIdx] = trip;
  db.users[driverIdx] = driver;

  // Notify Driver
  createNotification({
    recipientRole: 'driver',
    recipientId: driver.id,
    title: 'Trip Closed & Earnings Credited!',
    message: `Trip ${trip.id} was closed. ₹${numSalary.toLocaleString()} salary has been credited to your wallet.`,
    type: 'deal_closed',
    tripId: trip.id,
  });

  writeDb(db);

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'DEAL_CLOSED',
    `Closed trip ${trip.id}. Credited ₹${numSalary} salary to driver ${driver.name} (Wallet balance: ₹${driver.walletBalance})`
  );

  res.json({
    success: true,
    message: 'Deal closed successfully! Driver wallet has been credited.',
    trip: sanitizeTripForRole(trip, req.user.role),
    walletBalance: driver.walletBalance,
    totalEarnings: driver.totalEarnings,
  });
});

// POST /api/trips/:id/adjustment (Record adjustment on closed trips)
app.post('/api/trips/:id/adjustment', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only Admin can record adjustment entries on closed trips.' });
  }

  const { type, amount, reason } = req.body; // type: 'credit' or 'debit'
  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ error: 'Valid adjustment amount required' });
  }

  const db = readDb();
  const tripIdx = db.trips.findIndex((t) => t.id === req.params.id);
  if (tripIdx === -1) return res.status(404).json({ error: 'Trip not found' });

  const trip = db.trips[tripIdx];
  const driverIdx = db.users.findIndex((u) => u.id === trip.driverId);
  if (driverIdx === -1) return res.status(404).json({ error: 'Trip driver not found' });

  const driver = db.users[driverIdx];
  const prevBalance = Number(driver.walletBalance) || 0;
  const newBalance = type === 'credit' ? prevBalance + numAmount : prevBalance - numAmount;

  driver.walletBalance = newBalance;

  const adjEntry = {
    id: `ADJ-${Date.now()}`,
    type: type || 'credit',
    amount: numAmount,
    reason: reason || 'Post-closing salary/expense adjustment',
    recordedBy: req.user.name,
    recordedAt: new Date().toISOString(),
  };

  trip.adjustments = trip.adjustments || [];
  trip.adjustments.push(adjEntry);

  const tx = {
    id: `WT-${Date.now()}-adj`,
    driverId: driver.id,
    tripId: trip.id,
    type: type || 'credit',
    category: 'Trip Adjustment',
    amount: numAmount,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    notes: `Adjustment on ${trip.id}: ${reason || 'Correction entry'}`,
    balanceAfter: newBalance,
    createdAt: new Date().toISOString(),
  };

  db.walletTransactions = [tx, ...(db.walletTransactions || [])];
  db.trips[tripIdx] = trip;
  db.users[driverIdx] = driver;

  writeDb(db);

  logActivity(
    req.user.id,
    req.user.name,
    'admin',
    'TRIP_ADJUSTMENT',
    `Recorded ₹${numAmount} (${type}) adjustment on closed trip ${trip.id}`
  );

  res.json({ success: true, trip: sanitizeTripForRole(trip, 'admin'), walletBalance: newBalance });
});

/* ==========================================================================
   7. DRIVER EXPENSE ENTRY & REVIEW
   ========================================================================== */

// GET /api/expenses
app.get('/api/expenses', authenticateToken, (req, res) => {
  const { tripId, driverId, status } = req.query;
  const db = readDb();
  let expenses = db.expenses || [];

  if (req.user.role === 'driver') {
    // Drivers only see their own expenses
    expenses = expenses.filter((e) => e.driverId === req.user.id);
  } else if (driverId) {
    expenses = expenses.filter((e) => e.driverId === driverId);
  }

  if (tripId) {
    expenses = expenses.filter((e) => e.tripId === tripId);
  }

  if (status) {
    expenses = expenses.filter((e) => e.status === status);
  }

  res.json({ expenses });
});

// POST /api/expenses (Submit expense with proof)
app.post('/api/expenses', authenticateToken, upload.single('proofFile'), (req, res) => {
  const { tripId, category, amount, date, notes, fuelFilled, odometerReading, proofSample } = req.body;

  const numAmount = Number(amount);
  if (!tripId || !category || !numAmount) {
    return res.status(400).json({ error: 'Trip ID, category and valid amount are required' });
  }

  const db = readDb();
  const trip = db.trips.find((t) => t.id === tripId);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  // Disallow expenses on closed trips
  if (trip.status === 'Closed') {
    return res.status(400).json({ error: 'Cannot add expense to a closed trip.' });
  }

  // Driver authorization
  if (req.user.role === 'driver' && trip.driverId !== req.user.id) {
    return res.status(403).json({ error: 'You are not assigned to this trip' });
  }

  let proofPath = null;
  if (req.file) {
    proofPath = `/uploads/${req.file.filename}`;
  } else if (proofSample) {
    proofPath = proofSample;
  } else {
    // Default appropriate sample proof according to category
    if (category === 'Fuel') proofPath = '/uploads/fuel_receipt_sample.jpg';
    else if (category === 'Toll Gate') proofPath = '/uploads/toll_receipt_sample.jpg';
    else proofPath = '/uploads/food_receipt_sample.jpg';
  }

  const newExpense = {
    id: `EXP-${Date.now().toString().slice(-4)}`,
    tripId,
    driverId: req.user.id,
    driverName: req.user.name,
    category,
    amount: numAmount,
    date: date || new Date().toISOString().slice(0, 10),
    notes: notes || '',
    fuelFilled: category === 'Fuel' && fuelFilled ? Number(fuelFilled) : null,
    odometerReading: category === 'Fuel' && odometerReading ? Number(odometerReading) : null,
    proof: proofPath,
    status: 'Pending',
    adminRemarks: '',
    createdAt: new Date().toISOString(),
    reviewedBy: null,
  };

  db.expenses = [newExpense, ...(db.expenses || [])];

  // Update Driver total expenses counter
  const driverIdx = db.users.findIndex((u) => u.id === req.user.id);
  if (driverIdx !== -1) {
    db.users[driverIdx].totalExpenses = (Number(db.users[driverIdx].totalExpenses) || 0) + numAmount;
  }

  // Record debit in wallet transactions ledger
  const tx = {
    id: `WT-${Date.now()}-exp`,
    driverId: req.user.id,
    tripId,
    type: 'debit',
    category: `${category} Expense`,
    amount: numAmount,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    notes: `${category} Expense logged for ${tripId}`,
    balanceAfter: driverIdx !== -1 ? db.users[driverIdx].walletBalance : 0,
    createdAt: new Date().toISOString(),
  };
  db.walletTransactions = [tx, ...(db.walletTransactions || [])];

  // Notify Admin & Managers
  createNotification({
    recipientRole: 'admin',
    title: 'New Driver Expense Submitted',
    message: `${req.user.name} submitted a ${category} expense of ₹${numAmount.toLocaleString()} for trip ${tripId}.`,
    type: 'new_expense',
    tripId,
  });

  writeDb(db);

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'EXPENSE_ADDED',
    `Added ${category} expense of ₹${numAmount} on trip ${tripId}`
  );

  res.status(201).json({ success: true, expense: newExpense });
});

// PUT /api/expenses/:id/review (Admin or Manager reviews expense)
app.put('/api/expenses/:id/review', authenticateToken, (req, res) => {
  if (req.user.role === 'manager') {
    const perms = req.user.permissions || [];
    if (!perms.includes('review_expenses')) {
      return res.status(403).json({ error: 'You do not have permission to review expenses.' });
    }
  } else if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin or Manager access required' });
  }

  const { status, adminRemarks } = req.body; // 'Approved', 'Rejected', 'Flagged'
  if (!['Approved', 'Rejected', 'Flagged'].includes(status)) {
    return res.status(400).json({ error: 'Valid status (Approved, Rejected, Flagged) is required' });
  }

  const db = readDb();
  const idx = db.expenses.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Expense not found' });

  const exp = db.expenses[idx];
  exp.status = status;
  if (adminRemarks !== undefined) exp.adminRemarks = adminRemarks;
  exp.reviewedBy = req.user.id;
  exp.reviewedAt = new Date().toISOString();

  db.expenses[idx] = exp;

  // Notify driver
  createNotification({
    recipientRole: 'driver',
    recipientId: exp.driverId,
    title: `Expense ${status}`,
    message: `Your ${exp.category} expense of ₹${exp.amount.toLocaleString()} for trip ${exp.tripId} has been ${status.toLowerCase()}.${adminRemarks ? ` Remarks: ${adminRemarks}` : ''}`,
    type: 'expense_reviewed',
    tripId: exp.tripId,
  });

  writeDb(db);

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'EXPENSE_REVIEWED',
    `Marked expense ${exp.id} (${exp.category} ₹${exp.amount}) as ${status}`
  );

  res.json({ success: true, expense: exp });
});

// DELETE /api/expenses/:id (Driver deletes own expense if trip not closed)
app.delete('/api/expenses/:id', authenticateToken, (req, res) => {
  const db = readDb();
  const exp = db.expenses.find((e) => e.id === req.params.id);
  if (!exp) return res.status(404).json({ error: 'Expense not found' });

  // Check trip status
  const trip = db.trips.find((t) => t.id === exp.tripId);
  if (trip && trip.status === 'Closed') {
    return res.status(400).json({ error: 'Cannot delete expense from a closed trip.' });
  }

  // Driver authorization
  if (req.user.role === 'driver' && exp.driverId !== req.user.id) {
    return res.status(403).json({ error: 'You can only delete your own expenses.' });
  }

  db.expenses = db.expenses.filter((e) => e.id !== req.params.id);
  writeDb(db);

  logActivity(
    req.user.id,
    req.user.name,
    req.user.role,
    'EXPENSE_DELETED',
    `Deleted expense ${exp.id} (₹${exp.amount})`
  );

  res.json({ success: true, message: 'Expense deleted' });
});

/* ==========================================================================
   8. DRIVER WALLET & AVAILABILITY
   ========================================================================== */

// GET /api/wallet/:driverId
app.get('/api/wallet/:driverId', authenticateToken, (req, res) => {
  const { driverId } = req.params;

  // Authorization check
  if (req.user.role === 'driver' && req.user.id !== driverId) {
    return res.status(403).json({ error: 'Cannot view another driver’s wallet' });
  }

  const db = readDb();
  const driver = db.users.find((u) => u.id === driverId && u.role === 'driver');
  if (!driver) return res.status(404).json({ error: 'Driver not found' });

  const transactions = (db.walletTransactions || []).filter((t) => t.driverId === driverId);
  const driverExpenses = (db.expenses || []).filter((e) => e.driverId === driverId);
  const driverTrips = (db.trips || []).filter((t) => t.driverId === driverId);

  // Calculate trip-wise earnings
  const tripEarnings = driverTrips.map((t) => {
    const tripExps = driverExpenses.filter((e) => e.tripId === t.id);
    const approvedExps = tripExps
      .filter((e) => e.status === 'Approved')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    return {
      tripId: t.id,
      tripName: t.name,
      status: t.status,
      salary: t.salary || 0,
      salaryStatus: t.salaryStatus,
      totalExpenses: tripExps.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
      approvedReimbursements: approvedExps,
      startDate: t.startDate,
      endDate: t.endDate,
    };
  });

  res.json({
    walletBalance: driver.walletBalance || 0,
    totalEarnings: driver.totalEarnings || 0,
    totalExpenses: driver.totalExpenses || 0,
    totalReimbursements: driver.totalReimbursements || 0,
    transactions,
    tripEarnings,
  });
});

// PUT /api/driver/availability
app.put('/api/driver/availability', authenticateToken, (req, res) => {
  const { availability } = req.body;
  if (!['Available', 'On Trip', 'On Leave'].includes(availability)) {
    return res.status(400).json({ error: 'Invalid availability status' });
  }

  const db = readDb();
  const driverId = req.user.id;
  const idx = db.users.findIndex((u) => u.id === driverId && u.role === 'driver');
  if (idx === -1) return res.status(404).json({ error: 'Driver account not found' });

  db.users[idx].availability = availability;
  writeDb(db);

  logActivity(
    req.user.id,
    req.user.name,
    'driver',
    'AVAILABILITY_CHANGED',
    `Updated status to ${availability}`
  );

  res.json({ success: true, availability });
});

/* ==========================================================================
   9. REPORTS & ACTIVITY LOGS & NOTIFICATIONS
   ========================================================================== */

// GET /api/reports
app.get('/api/reports', authenticateToken, (req, res) => {
  if (req.user.role === 'manager') {
    const perms = req.user.permissions || [];
    if (!perms.includes('view_reports')) {
      return res.status(403).json({ error: 'Permission denied: Cannot view reports.' });
    }
  } else if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin or Manager access required' });
  }

  const { type, startDate, endDate, driverId, packageId, status } = req.query;
  const db = readDb();

  let trips = db.trips || [];
  let expenses = db.expenses || [];
  let drivers = (db.users || []).filter((u) => u.role === 'driver');

  // Filter trips by date
  if (startDate) {
    trips = trips.filter((t) => new Date(t.startDate) >= new Date(startDate));
  }
  if (endDate) {
    trips = trips.filter((t) => new Date(t.endDate) <= new Date(endDate + 'T23:59:59'));
  }
  if (driverId) {
    trips = trips.filter((t) => t.driverId === driverId);
    expenses = expenses.filter((e) => e.driverId === driverId);
  }
  if (packageId) {
    trips = trips.filter((t) => t.packageId === packageId);
  }
  if (status) {
    trips = trips.filter((t) => t.status === status);
  }

  // Summary statistics
  const totalTrips = trips.length;
  const completedTrips = trips.filter((t) => t.status === 'Completed' || t.status === 'Closed').length;
  const upcomingTrips = trips.filter((t) => t.status === 'Upcoming').length;
  const ongoingTrips = trips.filter((t) => t.status === 'Ongoing').length;
  const cancelledTrips = trips.filter((t) => t.status === 'Cancelled').length;

  const totalTripSalary = trips.reduce((sum, t) => sum + (Number(t.salary) || 0), 0);
  const salaryPaid = trips.filter((t) => t.salaryStatus === 'Paid').reduce((sum, t) => sum + (Number(t.salary) || 0), 0);
  const salaryPending = trips.filter((t) => t.salaryStatus === 'Pending').reduce((sum, t) => sum + (Number(t.salary) || 0), 0);

  const fuelExpenses = expenses.filter((e) => e.category === 'Fuel');
  const tollExpenses = expenses.filter((e) => e.category === 'Toll Gate');
  const otherExpenses = expenses.filter((e) => e.category !== 'Fuel' && e.category !== 'Toll Gate');

  const totalFuelAmount = fuelExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalTollAmount = tollExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalOtherAmount = otherExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  res.json({
    summary: {
      totalTrips,
      completedTrips,
      upcomingTrips,
      ongoingTrips,
      cancelledTrips,
      totalTripSalary,
      salaryPaid,
      salaryPending,
      totalExpensesAmount,
      totalFuelAmount,
      totalTollAmount,
      totalOtherAmount,
    },
    trips: trips.map((t) => sanitizeTripForRole(t, req.user.role)),
    expenses,
    drivers,
    packages: db.packages || [],
  });
});

// GET /api/activity-logs
app.get('/api/activity-logs', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const db = readDb();
  res.json({ logs: db.activityLogs || [] });
});

// GET /api/notifications
app.get('/api/notifications', authenticateToken, (req, res) => {
  const db = readDb();
  const user = req.user;
  const notifs = (db.notifications || []).filter((n) => {
    if (n.recipientRole === 'all') return true;
    if (n.recipientRole === user.role) {
      if (!n.recipientId || n.recipientId === user.id) return true;
    }
    return false;
  });

  res.json({ notifications: notifs });
});

// PUT /api/notifications/:id/read
app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const db = readDb();
  const idx = (db.notifications || []).findIndex((n) => n.id === req.params.id);
  if (idx !== -1) {
    db.notifications[idx].isRead = true;
    writeDb(db);
  }
  res.json({ success: true });
});

// PUT /api/notifications/read-all
app.put('/api/notifications/read-all', authenticateToken, (req, res) => {
  const db = readDb();
  const user = req.user;
  (db.notifications || []).forEach((n) => {
    if (n.recipientRole === 'all' || n.recipientRole === user.role) {
      if (!n.recipientId || n.recipientId === user.id) {
        n.isRead = true;
      }
    }
  });
  writeDb(db);
  res.json({ success: true });
});

/* ==========================================================================
   10. PUBLIC WEBSITE INQUIRIES & CONTACT
   ========================================================================== */

// POST /api/inquiries
app.post('/api/inquiries', (req, res) => {
  const { name, email, phone, packageId, packageName, travellersCount, preferredDate, pickupCity, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone number are required' });
  }

  const db = readDb();
  const newInquiry = {
    id: `inq-${Date.now()}`,
    name: name.trim(),
    email: email || '',
    phone: phone.trim(),
    packageId: packageId || null,
    packageName: packageName || 'Custom Tour Inquiry',
    travellersCount: Number(travellersCount) || 1,
    preferredDate: preferredDate || null,
    pickupCity: pickupCity || 'Tirupati',
    message: message || '',
    status: 'New',
    createdAt: new Date().toISOString(),
  };

  db.inquiries = [newInquiry, ...(db.inquiries || [])];

  createNotification({
    recipientRole: 'admin',
    title: 'New Pilgrim Booking Inquiry!',
    message: `${newInquiry.name} requested booking for "${newInquiry.packageName}" (${newInquiry.travellersCount} travellers). Mobile: ${newInquiry.phone}`,
    type: 'new_inquiry',
  });

  writeDb(db);

  logActivity('public', newInquiry.name, 'guest', 'PUBLIC_INQUIRY', `Submitted inquiry for ${newInquiry.packageName}`);

  res.status(201).json({
    success: true,
    message: 'Thank you for choosing Tirupati Balaji Tours & Travels! Our pilgrimage coordinator will call you shortly.',
    inquiry: newInquiry,
  });
});

// GET /api/inquiries (Admin only)
app.get('/api/inquiries', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const db = readDb();
  res.json({ inquiries: db.inquiries || [] });
});

// PUT /api/inquiries/:id (Admin update inquiry status)
app.put('/api/inquiries/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const db = readDb();
  const idx = (db.inquiries || []).findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Inquiry not found' });

  db.inquiries[idx] = { ...db.inquiries[idx], ...req.body, id: db.inquiries[idx].id };
  writeDb(db);
  res.json({ success: true, inquiry: db.inquiries[idx] });
});

// DELETE /api/inquiries/:id
app.delete('/api/inquiries/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const db = readDb();
  db.inquiries = (db.inquiries || []).filter((i) => i.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, message: 'Inquiry deleted' });
});

// PUT /api/inquiries/:id (Admin update inquiry status)
app.put('/api/inquiries/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const db = readDb();
  const idx = (db.inquiries || []).findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Inquiry not found' });

  db.inquiries[idx] = { ...db.inquiries[idx], ...req.body, id: db.inquiries[idx].id };
  writeDb(db);
  res.json({ success: true, inquiry: db.inquiries[idx] });
});

// DELETE /api/inquiries/:id
app.delete('/api/inquiries/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const db = readDb();
  db.inquiries = (db.inquiries || []).filter((i) => i.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, message: 'Inquiry deleted' });
});

// SPA Fallback to index.html for frontend routing
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    next();
  }
});

// Start Server (only when running standalone)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`Tirupati Balaji Tours & Travels Backend Server`);
    console.log(`Running on http://localhost:${PORT}`);
    console.log(`Uploads serving from ${UPLOADS_DIR}`);
    console.log(`Database active at ${DB_FILE}`);
    console.log(`=======================================================`);
  });
}

export default app;
