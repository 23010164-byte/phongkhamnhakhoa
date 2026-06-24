import { RoleRoute } from '../routes/guards';
import { ROLES } from '../routes/constants';
import MainLayout from './MainLayout';

/**
 * PatientLayout — layout cho Bệnh nhân.
 * Chỉ cho phép role: patient
 */
function PatientLayout() {
  return (
    <RoleRoute allowedRoles={[ROLES.PATIENT]}>
      <MainLayout role={ROLES.PATIENT} />
    </RoleRoute>
  );
}

export default PatientLayout;
