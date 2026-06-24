import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/auth.store';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <NavLink to="/" className="navbar-brand">
          <span className="brand-icon">✦</span>
          ReviewBlog
        </NavLink>

        <nav className="navbar-nav">
          <NavLink to="/reviews" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Reviews
          </NavLink>
          <NavLink to="/blogs" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Blog
          </NavLink>
          {user && (
            <>
              <NavLink to="/blogs/new" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Viết bài
              </NavLink>
            </>
          )}
        </nav>

        <div className="navbar-actions">
          {user ? (
            <>
              <span className="user-name">{user.name}</span>
              <button className="btn btn--sm btn--outline" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn--sm btn--primary">
              Đăng nhập
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
