import { Link } from 'react-router-dom';
import useAuthStore from '../../store/auth.store';
import { ROLE_HOME } from '../../routes/constants';
import './ErrorPages.css';

export function NotFoundPage() {
  return (
    <div className="error-page">
      <div className="error-page__code">404</div>
      <h1 className="error-page__title">Trang không tồn tại</h1>
      <p className="error-page__desc">Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      <Link to="/" className="error-page__btn">Về trang chủ</Link>
    </div>
  );
}

export function UnauthorizedPage() {
  const user = useAuthStore((s) => s.user);
  const home = user?.role ? ROLE_HOME[user.role] : '/auth/login';

  return (
    <div className="error-page">
      <div className="error-page__code error-page__code--warn">403</div>
      <h1 className="error-page__title">Không có quyền truy cập</h1>
      <p className="error-page__desc">Bạn không có quyền truy cập trang này.</p>
      <Link to={home} className="error-page__btn">Quay về trang của tôi</Link>
    </div>
  );
}

export function UnderConstructionPage() {
  return (
    <div className="error-page">
      <div className="error-page__code" style={{ color: '#2563eb' }}>ĐANG PHÁT TRIỂN</div>
      <h1 className="error-page__title">Tính năng đang xây dựng</h1>
      <p className="error-page__desc">Tính năng này đang được chúng tôi phát triển và sẽ sớm ra mắt.</p>
    </div>
  );
}
