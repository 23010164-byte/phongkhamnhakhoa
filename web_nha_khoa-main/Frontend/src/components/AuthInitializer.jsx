import { useEffect } from 'react';
import useAuthStore, { selectInitialized } from '../store/auth.store';

/**
 * AuthInitializer
 *
 * Mount một lần duy nhất ở App.jsx.
 * Gọi store.initialize() để:
 *   1. Kiểm tra access token còn trong localStorage không
 *   2. Nếu có → gọi GET /auth/me để lấy user info + xác nhận token còn hợp lệ
 *   3. Set initialized = true → app mới render routes
 *
 * Trong lúc chưa initialized → hiện spinner toàn trang để tránh flash /login
 */
const AuthInitializer = ({ children }) => {
  const initialize = useAuthStore((state) => state.initialize);
  const initialized = useAuthStore(selectInitialized);

  useEffect(() => {
    initialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!initialized) {
    return (
      <div className="page-loader">
        <span className="page-loader__spinner" />
      </div>
    );
  }

  return children;
};

export default AuthInitializer;
