import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { NAV_CONFIG, ROLE_CONFIG } from './navConfig.jsx';
import './Sidebar.css';

function Sidebar({ collapsed, onToggle, role }) {
  const user = useAuthStore((s) => s.user);
  const navItems = NAV_CONFIG[role] ?? [];
  const roleConfig = ROLE_CONFIG[role] ?? {};

  return (
    <aside
      className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
      style={{ '--role-color': roleConfig.color, '--role-bg': roleConfig.bgColor }}
    >
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        {!collapsed && (
          <span className="sidebar__logo-text">HealthCare</span>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="sidebar__role-badge">
          <span className="sidebar__role-label">{roleConfig.label}</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar__nav">
        <ul className="sidebar__nav-list">
          {navItems.map(({ label, path, Icon }) => (
            <li key={path} className="sidebar__nav-item">
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`
                }
                title={collapsed ? label : undefined}
              >
                <span className="sidebar__nav-icon">
                  <Icon />
                </span>
                {!collapsed && (
                  <span className="sidebar__nav-label">{label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User info at bottom */}
      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__user-avatar">
            {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          {!collapsed && (
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user?.fullName ?? 'User'}</span>
              <span className="sidebar__user-email">{user?.email ?? ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Toggle button */}
      <button className="sidebar__toggle" onClick={onToggle} aria-label="Toggle sidebar">
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
    </aside>
  );
}

export default Sidebar;
