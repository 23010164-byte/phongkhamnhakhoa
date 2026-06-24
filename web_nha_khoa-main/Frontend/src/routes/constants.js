// ─── Roles ──────────────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:        'admin',
  DOCTOR:       'doctor',
  RECEPTIONIST: 'receptionist',
  PATIENT:      'patient',
};

// ─── Route Paths ────────────────────────────────────────────────────────────────
export const ROUTES = {
  // Auth
  LOGIN:            '/auth/login',
  REGISTER:         '/auth/register',
  FORGOT_PASSWORD:  '/auth/forgot-password',
  RESET_PASSWORD:   '/auth/reset-password',
  VERIFY_EMAIL:     '/auth/verify-email',
  FORGOT:           '/auth/forgot-password',

  // ── Admin ──────────────────────────────────────────────────────────────────
  ADMIN_DASHBOARD:  '/admin/dashboard',
  ADMIN_SERVICES:   '/admin/services',
  ADMIN_USERS:      '/admin/users',
  ADMIN_DOCTORS:    '/admin/doctors',
  ADMIN_REPORTS:    '/admin/reports',
  ADMIN_AUDIT:      '/admin/audit',
  ADMIN_SETTINGS:   '/admin/settings',
  ADMIN_HOLIDAYS:   '/admin/holidays',
  ADMIN_SHIFTS:     '/admin/shifts',
  ADMIN_ROSTERS:    '/admin/rosters',
  ADMIN_MONITOR:    '/admin/monitor',
  ADMIN_SALARY:     '/admin/salary',

  // ── Doctor ─────────────────────────────────────────────────────────────────
  DOCTOR_DASHBOARD:     '/doctor/dashboard',
  DOCTOR_APPOINTMENTS:  '/doctor/appointments',
  DOCTOR_PATIENTS:      '/doctor/patients',
  DOCTOR_SCHEDULE:      '/doctor/schedule',
  DOCTOR_ROSTER:        '/doctor/roster',
  DOCTOR_RECORDS:       '/doctor/records',
  DOCTOR_PROFILE:       '/doctor/profile',

  // ── Receptionist ───────────────────────────────────────────────────────────
  RECEPTIONIST_DASHBOARD:    '/receptionist/dashboard',
  RECEPTIONIST_APPOINTMENTS: '/receptionist/appointments',
  RECEPTIONIST_PATIENTS:     '/receptionist/patients',
  RECEPTIONIST_CHECKIN:      '/receptionist/checkin',
  RECEPTIONIST_BILLING:      '/receptionist/billing',
  RECEPTIONIST_PROFILE:      '/receptionist/profile',
  RECEPTIONIST_MONITOR:      '/receptionist/monitor',

  // ── Patient ────────────────────────────────────────────────────────────────
  PATIENT_DASHBOARD:      '/patient/dashboard',
  PATIENT_APPOINTMENTS:   '/patient/appointments',
  PATIENT_RECORDS:        '/patient/records',
  PATIENT_PRESCRIPTIONS:  '/patient/prescriptions',
  PATIENT_BILLING:        '/patient/billing',
  PATIENT_PROFILE:        '/patient/profile',

  // General
  HOME:       '/',
  DASHBOARD:  '/admin/dashboard',
  PROFILE:    '/profile',
  NOT_FOUND:  '*',
};

// ─── Default redirect per role after login ──────────────────────────────────────
export const ROLE_HOME = {
  [ROLES.ADMIN]:        ROUTES.ADMIN_DASHBOARD,
  [ROLES.DOCTOR]:       ROUTES.DOCTOR_DASHBOARD,
  [ROLES.RECEPTIONIST]: ROUTES.RECEPTIONIST_DASHBOARD,
  [ROLES.PATIENT]:      ROUTES.PATIENT_DASHBOARD,
};
