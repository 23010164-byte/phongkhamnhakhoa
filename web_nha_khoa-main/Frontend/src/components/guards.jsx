import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ROUTES } from '../utils/constants';
import { ROLE_HOME } from '../hooks/constants';

/**
 * PrivateRoute — requires authentication.
 * Unauthenticated users → /auth/login (with return path)
 */
export function PrivateRoute({ children }) {
  const isAuth = useAuthStore((s) => s.isAuth);
  const location = useLocation();

  if (!isAuth) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}

/**
 * RoleRoute — requires authentication + specific role(s).
 * Wrong role → role's own dashboard (or 403 page)
 */
export function RoleRoute({ children, allowedRoles }) {
  const { isAuth, user } = useAuthStore((s) => ({
    isAuth: s.isAuth,
    user: s.user,
  }));
  const location = useLocation();

  if (!isAuth) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    );
  }

  const userRole = user?.role;
  const allowed = Array.isArray(allowedRoles)
    ? allowedRoles.includes(userRole)
    : allowedRoles === userRole;

  if (!allowed) {
    const redirectTo = ROLE_HOME[userRole] ?? ROUTES.LOGIN;
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

/**
 * GuestRoute — only for unauthenticated users.
 * Authenticated users → their dashboard.
 */
export function GuestRoute({ children }) {
  const { isAuth, user } = useAuthStore((s) => ({
    isAuth: s.isAuth,
    user: s.user,
  }));

  if (isAuth && user?.role) {
    const redirectTo = ROLE_HOME[user.role] ?? '/';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
