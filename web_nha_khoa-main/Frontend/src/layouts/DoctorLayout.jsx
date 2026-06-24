import { RoleRoute } from '../routes/guards';
import { ROLES } from '../routes/constants';
import MainLayout from './MainLayout';

/**
 * DoctorLayout — layout cho Bác sĩ.
 * Chỉ cho phép role: doctor
 */
function DoctorLayout() {
  return (
    <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
      <MainLayout role={ROLES.DOCTOR} />
    </RoleRoute>
  );
}

export default DoctorLayout;
