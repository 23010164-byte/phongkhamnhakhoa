import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

/**
 * AuthLayout — layout wrapper cho auth pages (Login, Register, Forgot, etc.)
 * Sử dụng <Outlet /> để render child routes
 */
function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout__bg">
        <div className="auth-layout__bg-shape auth-layout__bg-shape--1" />
        <div className="auth-layout__bg-shape auth-layout__bg-shape--2" />
        <div className="auth-layout__bg-shape auth-layout__bg-shape--3" />
      </div>

      <div className="auth-layout__content">
        {/* Brand */}
        <div className="auth-layout__brand">
          <div className="auth-layout__brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span className="auth-layout__brand-name">HealthCare Portal</span>
        </div>

        {/* Page content (Login / Register / etc.) */}
        <div className="auth-layout__card">
          <Outlet />
        </div>

        <p className="auth-layout__footer">
          © {new Date().getFullYear()} HealthCare Portal. Bảo lưu mọi quyền.
        </p>
      </div>
    </div>
  );
}

export default AuthLayout;
