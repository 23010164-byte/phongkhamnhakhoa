import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Guards
import { GuestRoute } from './routes/guards';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import DoctorLayout from './layouts/DoctorLayout';
import ReceptionistLayout from './layouts/ReceptionistLayout';
import PatientLayout from './layouts/PatientLayout';

// Auth pages (eager — small, always needed)
import Login from './features/auth/Login';
const Register = lazy(() => import('./features/auth/Register'));

// Dashboard pages (lazy)
const AdminDashboard        = lazy(() => import('./features/dashboard/AdminDashboard'));
const DoctorDashboard       = lazy(() => import('./features/dashboard/DoctorDashboard'));
const ReceptionistDashboard = lazy(() => import('./features/dashboard/ReceptionistDashboard'));
const PatientDashboard      = lazy(() => import('./features/dashboard/PatientDashboard'));

// Error pages
import { NotFoundPage, UnderConstructionPage } from './features/dashboard/ErrorPages';

// Feature pages (lazy)
const AdminReports = lazy(() => import('./features/dashboard/AdminReports'));
const AdminAuditLog = lazy(() => import('./features/admin/AdminAuditLog'));
const AdminSettings = lazy(() => import('./features/admin/AdminSettings'));
const AdminServiceList = lazy(() => import('./features/service/ServiceList'));
const AdminServiceForm = lazy(() => import('./features/service/ServiceForm'));
const UserList = lazy(() => import('./features/user/UserList'));
const DoctorList = lazy(() => import('./features/doctor/DoctorList'));
const DoctorProfile = lazy(() => import('./features/doctor/DoctorProfile'));
const DoctorSchedule = lazy(() => import('./features/doctor/DoctorSchedule'));
const AppointmentList = lazy(() => import('./features/appointment/AppointmentList'));
const AppointmentDetail = lazy(() => import('./features/appointment/AppointmentDetail'));
const Booking = lazy(() => import('./features/appointment/Booking'));
const ReceptionistCheckin = lazy(() => import('./features/appointment/ReceptionistCheckin'));
const MedicalRecordList = lazy(() => import('./features/medical/MedicalRecordList'));
const MedicalRecordDetail = lazy(() => import('./features/medical/MedicalRecordDetail'));
const Prescription = lazy(() => import('./features/medical/Prescription'));
const PatientPrescriptionList = lazy(() => import('./features/medical/PatientPrescriptionList'));
const MedicalRecordServices = lazy(() => import('./features/medical/MedicalRecordServices'));
const PaymentList = lazy(() => import('./features/payment/PaymentList'));
const PaymentCheckout = lazy(() => import('./features/payment/PaymentCheckout'));
const PaymentResult = lazy(() => import('./features/payment/PaymentResult'));
const Profile = lazy(() => import('./features/user/Profile'));

// Clinic Management pages (lazy)
const HolidayManagement = lazy(() => import('./features/clinic/HolidayManagement'));
const ShiftManagement = lazy(() => import('./features/clinic/ShiftManagement'));
const RosterManagement = lazy(() => import('./features/clinic/RosterManagement'));
const AdminLeaves = lazy(() => import('./features/clinic/AdminLeaves'));
const AppointmentMonitor = lazy(() => import('./features/clinic/AppointmentMonitor'));
const SalaryPage = lazy(() => import('./features/salary/SalaryPage'));

// Root redirect — users are redirected based on role by auth store
import useAuthStore from './store/auth.store';
import { ROLE_HOME } from './routes/constants';

function RootRedirect() {
  const { isAuth, user } = useAuthStore((s) => ({
    isAuth: s.isAuth,
    user: s.user,
  }));
  if (isAuth && user?.role) {
    return <Navigate to={ROLE_HOME[user.role] ?? '/auth/login'} replace />;
  }
  return <Navigate to="/auth/login" replace />;
}

function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '60vh', color: 'var(--color-text-muted)', fontSize: '0.9rem',
    }}>
      <span style={{
        width: 24, height: 24, borderRadius: '50%',
        border: '2px solid var(--color-border)',
        borderTopColor: 'var(--color-primary)',
        animation: 'spin 0.7s linear infinite',
        display: 'inline-block', marginRight: 10,
      }} />
      Đang tải...
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Root */}
        <Route path="/" element={<RootRedirect />} />

        {/* ── Auth routes ─────────────────────────────────────── */}
        <Route
          element={
            <GuestRoute>
              <AuthLayout />
            </GuestRoute>
          }
        >
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
        </Route>

        {/* ── Admin routes ─────────────────────────────────────── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="services" element={<AdminServiceList />} />
          <Route path="services/new" element={<AdminServiceForm />} />
          <Route path="services/:id/edit" element={<AdminServiceForm />} />
          <Route path="users" element={<UserList />} />
          <Route path="doctors" element={<DoctorList />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="audit" element={<AdminAuditLog />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="holidays" element={<HolidayManagement />} />
          <Route path="shifts" element={<ShiftManagement />} />
          <Route path="rosters" element={<RosterManagement />} />
          <Route path="leaves" element={<AdminLeaves />} />
          <Route path="monitor" element={<AppointmentMonitor />} />
          <Route path="salary/*" element={<SalaryPage />} />
        </Route>

        {/* ── Doctor routes ────────────────────────────────────── */}
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="appointments" element={<AppointmentList />} />
          <Route path="appointments/:id" element={<AppointmentDetail />} />
          <Route path="schedule" element={<DoctorSchedule />} />
          <Route path="roster" element={<RosterManagement />} />
          <Route path="records" element={<MedicalRecordList />} />
          <Route path="records/:id" element={<MedicalRecordDetail />} />
          <Route path="records/:id/prescription" element={<Prescription />} />
          <Route path="records/:id/services" element={<MedicalRecordServices />} />
          <Route path="profile" element={<DoctorProfile />} />
        </Route>

        {/* ── Receptionist routes ──────────────────────────────── */}
        <Route path="/receptionist" element={<ReceptionistLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ReceptionistDashboard />} />
          <Route path="appointments" element={<AppointmentList />} />
          <Route path="appointments/booking" element={<Booking />} />
          <Route path="appointments/:id" element={<AppointmentDetail />} />
          <Route path="patients" element={<UserList />} />
          <Route path="checkin" element={<ReceptionistCheckin />} />
          <Route path="billing" element={<PaymentList />} />
          <Route path="billing/:id" element={<PaymentCheckout />} />
          <Route path="profile" element={<Profile />} />
          <Route path="monitor" element={<AppointmentMonitor />} />
        </Route>

        {/* ── Patient routes ───────────────────────────────────── */}
        <Route path="/patient" element={<PatientLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="appointments" element={<AppointmentList />} />
          <Route path="appointments/booking" element={<Booking />} />
          <Route path="appointments/:id" element={<AppointmentDetail />} />
          <Route path="records" element={<MedicalRecordList />} />
          <Route path="records/:id" element={<MedicalRecordDetail />} />
          <Route path="records/:id/prescription" element={<Prescription />} />
          <Route path="records/:id/services" element={<MedicalRecordServices />} />
          <Route path="prescriptions" element={<PatientPrescriptionList />} />
          <Route path="billing" element={<PaymentList />} />
          <Route path="billing/:id" element={<PaymentCheckout />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Public Payment Result Route */}
        <Route path="/payment/result" element={<PaymentResult />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
