import { RoleRoute } from '../routes/guards';
import { ROLES } from '../routes/constants';
import MainLayout from './MainLayout';

/**
 * ReceptionistLayout — layout cho Lễ tân.
 * Chỉ cho phép role: receptionist
 */
function ReceptionistLayout() {
  return (
    <RoleRoute allowedRoles={[ROLES.RECEPTIONIST]}>
      <MainLayout role={ROLES.RECEPTIONIST} />
    </RoleRoute>
  );
}

export default ReceptionistLayout;
