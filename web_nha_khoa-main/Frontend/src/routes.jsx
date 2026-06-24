import { lazy, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from './utils/constants';
import useAuthStore, { selectIsAuth, selectInitialized } from './store/auth.store';

// ─── Lazy Pages ────────────────────────────────────────────────────────────────

// Auth pages
const Login = lazy(() => import('./features/auth/Login'));
const Register = lazy(() => import('./features/auth/Register'));
const ForgotPassword = lazy(() => import('./features/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./features/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./features/auth/VerifyEmail'));

// App pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// ─── Suspense Fallback ─────────────────────────────────────────────────────────

const PageLoader = () => (
  <div className="page-loader">
    <span className="page-loader__spinner" />
  </div>
);

const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

// ─── Route Guards ──────────────────────────────────────────────────────────────

/**
 * PrivateRoute — chỉ render khi đã đăng nhập.
 * Lưu lại `location` để sau login redirect về đúng trang.
 */
export const PrivateRoute = () => {
  const isAuth = useAuthStore(selectIsAuth);

  if (!isAuth) {
    // Không dùng useLocation ở đây để tránh re-render,
    // component con sẽ tự handle nếu cần `from`
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};

/**
 * GuestRoute — chỉ render khi chưa đăng nhập.
 * Tránh user đã login vào lại /login, /register.
 */
export const GuestRoute = () => {
  const isAuth = useAuthStore(selectIsAuth);

  if (isAuth) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};

// ─── Route Definitions ─────────────────────────────────────────────────────────

export const routes = [
  // ── Guest only ────────────────────────────────────────────────────────────
  {
    element: <GuestRoute />,
    children: [
      { path: ROUTES.LOGIN, element: withSuspense(Login) },
      { path: ROUTES.REGISTER, element: withSuspense(Register) },
      { path: ROUTES.FORGOT_PASSWORD, element: withSuspense(ForgotPassword) },
    ],
  },

  // ── Public (cả guest lẫn auth đều vào được) ───────────────────────────────
  {
    path: ROUTES.RESET_PASSWORD,
    element: withSuspense(ResetPassword),
  },
  {
    path: ROUTES.VERIFY_EMAIL,
    element: withSuspense(VerifyEmail),
  },

  // ── Private ───────────────────────────────────────────────────────────────
  {
    element: <PrivateRoute />,
    children: [
      { path: ROUTES.DASHBOARD, element: withSuspense(DashboardPage) },
      { path: ROUTES.PROFILE, element: withSuspense(ProfilePage) },
    ],
  },

  // ── Fallbacks ─────────────────────────────────────────────────────────────
  { path: ROUTES.HOME, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
  { path: ROUTES.NOT_FOUND, element: withSuspense(NotFoundPage) },
];
