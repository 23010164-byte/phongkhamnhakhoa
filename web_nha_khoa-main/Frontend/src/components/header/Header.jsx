import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { ROLE_CONFIG } from '../sidebar/navConfig';
import { ROUTES } from '../../routes/constants';
import './Header.css';

function Header({ collapsed, pageTitle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore((s) => ({ user: s.user, logout: s.logout }));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef(null);

  const role = user?.role;
  const roleConfig = ROLE_CONFIG[role] ?? {};

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [logout, navigate]);

  const handleProfile = useCallback(() => {
    setDropdownOpen(false);
    const profileRoute = `/${role}/profile`;
    navigate(profileRoute);
  }, [role, navigate]);

  return (
    <header
      className="header"
      style={{ left: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}
    >
      <div className="header__left">
        {pageTitle && <h1 className="header__title">{pageTitle}</h1>}
      </div>

      <div className="header__right">
        {/* Notification bell (UI only) */}
        <button className="header__icon-btn" aria-label="Thông báo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="header__badge">3</span>
        </button>

        {/* User dropdown */}
        <div className="header__user-wrap" ref={dropdownRef}>
          <button
            className="header__user-btn"
            onClick={() => setDropdownOpen((v) => !v)}
            style={{ '--role-color': roleConfig.color, '--role-bg': roleConfig.bgColor }}
          >
            <div className="header__user-avatar">
              {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="header__user-info">
              <span className="header__user-name">{user?.fullName ?? 'User'}</span>
              <span className="header__user-role" style={{ color: roleConfig.color }}>
                {roleConfig.label}
              </span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {dropdownOpen && (
            <div className="header__dropdown">
              <div className="header__dropdown-header">
                <span className="header__dropdown-email">{user?.email}</span>
              </div>
              <div className="header__dropdown-body">
                {role !== 'admin' && (
                  <button className="header__dropdown-item" onClick={handleProfile}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    Hồ sơ cá nhân
                  </button>
                )}
                <div className="header__dropdown-divider" />
                <button
                  className="header__dropdown-item header__dropdown-item--danger"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
