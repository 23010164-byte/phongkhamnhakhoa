import { ROUTES } from '../../routes/constants';

// SVG icon components (inline, no dependency)
const iconProps = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'linejoin' };

export const Icons = {
  Dashboard: () => (
    <svg {...iconProps}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
  ),
  Users: () => (
    <svg {...iconProps}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Doctor: () => (
    <svg {...iconProps}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  Calendar: () => (
    <svg {...iconProps}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  FileText: () => (
    <svg {...iconProps}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  ),
  Settings: () => (
    <svg {...iconProps}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  ),
  BarChart: () => (
    <svg {...iconProps}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
  ),
  Shield: () => (
    <svg {...iconProps}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Patient: () => (
    <svg {...iconProps}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Clipboard: () => (
    <svg {...iconProps}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
  ),
  CreditCard: () => (
    <svg {...iconProps}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
  ),
  CheckCircle: () => (
    <svg {...iconProps}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  ),
  Pill: () => (
    <svg {...iconProps}><path d="M10.5 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7"/><path d="M16 20h6"/><path d="M19 17v6"/></svg>
  ),
  User: () => (
    <svg {...iconProps}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Clock: () => (
    <svg {...iconProps}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  Monitor: () => (
    <svg {...iconProps}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
  ),
  DollarSign: () => (
    <svg {...iconProps}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  ),
};

// ─── Nav configs per role ─────────────────────────────────────────────────────
export const NAV_CONFIG = {
  admin: [
    {
      label: 'Tổng quan',
      path: ROUTES.ADMIN_DASHBOARD,
      Icon: Icons.Dashboard,
    },
    {
      label: 'Quản lý người dùng',
      path: ROUTES.ADMIN_USERS,
      Icon: Icons.Users,
    },
    {
      label: 'Quản lý dịch vụ',
      path: ROUTES.ADMIN_SERVICES,
      Icon: Icons.Clipboard,
    },
    {
      label: 'Quản lý bác sĩ',
      path: ROUTES.ADMIN_DOCTORS,
      Icon: Icons.Doctor,
    },
    {
      label: 'Báo cáo & Thống kê',
      path: ROUTES.ADMIN_REPORTS,
      Icon: Icons.BarChart,
    },
    {
      label: 'Nhật ký hệ thống',
      path: ROUTES.ADMIN_AUDIT,
      Icon: Icons.Shield,
    },
    {
      label: 'Cài đặt',
      path: ROUTES.ADMIN_SETTINGS,
      Icon: Icons.Settings,
    },
    {
      label: 'Ngày nghỉ',
      path: ROUTES.ADMIN_HOLIDAYS,
      Icon: Icons.Calendar,
    },
    {
      label: 'Ca làm việc',
      path: ROUTES.ADMIN_SHIFTS,
      Icon: Icons.Clock,
    },
    {
      label: 'Lịch trực BS',
      path: ROUTES.ADMIN_ROSTERS,
      Icon: Icons.Clipboard,
    },
    {
      label: 'Duyệt ngày nghỉ',
      path: '/admin/leaves',
      Icon: Icons.Calendar,
    },
    {
      label: 'Monitor',
      path: ROUTES.ADMIN_MONITOR,
      Icon: Icons.Monitor,
    },
    {
      label: 'Tính lương BS',
      path: ROUTES.ADMIN_SALARY,
      Icon: Icons.DollarSign,
    },
  ],

  doctor: [
    {
      label: 'Tổng quan',
      path: ROUTES.DOCTOR_DASHBOARD,
      Icon: Icons.Dashboard,
    },
    {
      label: 'Lịch hẹn',
      path: ROUTES.DOCTOR_APPOINTMENTS,
      Icon: Icons.Calendar,
    },
    {
      label: 'Lịch làm việc',
      path: ROUTES.DOCTOR_SCHEDULE,
      Icon: Icons.Clipboard,
    },
    {
      label: 'Hồ sơ bệnh án',
      path: ROUTES.DOCTOR_RECORDS,
      Icon: Icons.FileText,
    },
    {
      label: 'Hồ sơ cá nhân',
      path: ROUTES.DOCTOR_PROFILE,
      Icon: Icons.User,
    },
  ],

  receptionist: [
    {
      label: 'Tổng quan',
      path: ROUTES.RECEPTIONIST_DASHBOARD,
      Icon: Icons.Dashboard,
    },
    {
      label: 'Lịch hẹn',
      path: ROUTES.RECEPTIONIST_APPOINTMENTS,
      Icon: Icons.Calendar,
    },
    {
      label: 'Bệnh nhân',
      path: ROUTES.RECEPTIONIST_PATIENTS,
      Icon: Icons.Patient,
    },
    {
      label: 'Check-in',
      path: ROUTES.RECEPTIONIST_CHECKIN,
      Icon: Icons.CheckCircle,
    },
    {
      label: 'Thanh toán',
      path: ROUTES.RECEPTIONIST_BILLING,
      Icon: Icons.CreditCard,
    },
    {
      label: 'Hồ sơ cá nhân',
      path: ROUTES.RECEPTIONIST_PROFILE,
      Icon: Icons.User,
    },
    {
      label: 'Monitor',
      path: ROUTES.RECEPTIONIST_MONITOR,
      Icon: Icons.Monitor,
    },
  ],

  patient: [
    {
      label: 'Tổng quan',
      path: ROUTES.PATIENT_DASHBOARD,
      Icon: Icons.Dashboard,
    },
    {
      label: 'Lịch hẹn',
      path: ROUTES.PATIENT_APPOINTMENTS,
      Icon: Icons.Calendar,
    },
    {
      label: 'Hồ sơ bệnh án',
      path: ROUTES.PATIENT_RECORDS,
      Icon: Icons.FileText,
    },
    {
      label: 'Đơn thuốc',
      path: ROUTES.PATIENT_PRESCRIPTIONS,
      Icon: Icons.Pill,
    },
    {
      label: 'Hóa đơn',
      path: ROUTES.PATIENT_BILLING,
      Icon: Icons.CreditCard,
    },
    {
      label: 'Hồ sơ cá nhân',
      path: ROUTES.PATIENT_PROFILE,
      Icon: Icons.User,
    },
  ],
};

// ─── Role display config ──────────────────────────────────────────────────────
export const ROLE_CONFIG = {
  admin: {
    label: 'Quản trị viên',
    color: 'var(--color-admin)',
    bgColor: 'var(--color-admin-light)',
    accent: '#2d3a8c',
  },
  doctor: {
    label: 'Bác sĩ',
    color: 'var(--color-doctor)',
    bgColor: 'var(--color-doctor-light)',
    accent: '#0f7c6e',
  },
  receptionist: {
    label: 'Lễ tân',
    color: 'var(--color-receptionist)',
    bgColor: 'var(--color-receptionist-light)',
    accent: '#7c3aed',
  },
  patient: {
    label: 'Bệnh nhân',
    color: 'var(--color-patient)',
    bgColor: 'var(--color-patient-light)',
    accent: '#1a6bcc',
  },
};
