import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar';
import Header from '../components/header/Header';
import useLayout from '../hooks/useLayout';
import './MainLayout.css';

/**
 * MainLayout — base layout with sidebar + header.
 * Used as a building block; role-specific layouts extend this.
 *
 * @param {string} role - The role key for nav config + styling
 * @param {string} [pageTitle] - Optional page title to show in header
 */
function MainLayout({ role, pageTitle }) {
  const { collapsed, toggleSidebar } = useLayout();
  const location = useLocation();

  return (
    <div className={`main-layout ${collapsed ? 'main-layout--collapsed' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleSidebar}
        role={role}
      />

      <div className="main-layout__body">
        <Header collapsed={collapsed} pageTitle={pageTitle} />

        <main className="main-layout__content">
          <div
            className="main-layout__page"
            key={location.pathname} // triggers fade animation on route change
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
