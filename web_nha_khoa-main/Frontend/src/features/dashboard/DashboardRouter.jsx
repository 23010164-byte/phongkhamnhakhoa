import useAuthStore from '../../store/auth.store';
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';
import PatientDashboard from './PatientDashboard';

const ROLE_COMPONENT_MAP = {
  admin: AdminDashboard,
  doctor: DoctorDashboard,
  receptionist: ReceptionistDashboard,
  patient: PatientDashboard,
};

function DashboardRouter() {
  const role = useAuthStore((s) => s.user?.role);
  const Component = ROLE_COMPONENT_MAP[role];

  if (!Component) {
    return (
      <div style={{ padding: 24, color: '#dc2626' }}>
        Không xác định được vai trò người dùng. Vui lòng đăng nhập lại.
      </div>
    );
  }

  return <Component />;
}

export default DashboardRouter;
