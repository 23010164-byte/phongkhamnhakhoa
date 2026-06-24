import { RoleRoute } from '../routes/guards';
import { ROLES } from '../routes/constants';
import MainLayout from './MainLayout';

/**
 * AdminLayout — layout cho Quản trị viên.
 * Chỉ cho phép role: admin
 */
function AdminLayout() {
  return (
    <RoleRoute allowedRoles={[ROLES.ADMIN]}>
      <MainLayout role={ROLES.ADMIN} />
    </RoleRoute>
  );
}

export default AdminLayout;
