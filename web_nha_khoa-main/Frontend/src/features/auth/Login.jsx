import { useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/auth.store';
import { ROLE_HOME, ROUTES } from '../../routes/constants';
import './Login.css';

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(fields) {
  const errors = {};
  if (!fields.email.trim()) {
    errors.email = 'Email là bắt buộc';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'Email không hợp lệ';
  }
  if (!fields.password) {
    errors.password = 'Mật khẩu là bắt buộc';
  } else if (fields.password.length < 6) {
    errors.password = 'Mật khẩu tối thiểu 6 ký tự';
  }
  return errors;
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading: isLoading, error, clearError } = useAuthStore();

  const [fields, setFields] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname;

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    clearError();
  }, [clearError]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const errors = validate(fields);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    const credentials = {
      email: fields.email.trim(),
      password: fields.password,
    };

    const result = await login(credentials);
    if (result.success && result.user) {
      const redirectTo = from || ROLE_HOME[result.user.role] || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [fields, from, login, navigate, clearError]);

  return (
    <div className="login">
      <div className="login__header">
        <h2 className="login__title">Đăng nhập</h2>
        <p className="login__subtitle">Chào mừng bạn quay trở lại</p>
      </div>

      {error && (
        <div className="login__alert login__alert--error" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <form className="login__form" onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className={`form-group ${fieldErrors.email ? 'form-group--error' : ''}`}>
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            placeholder="bacsi@hospital.vn"
            value={fields.email}
            onChange={handleChange}
            autoComplete="username"
            disabled={isLoading}
          />
          {fieldErrors.email && (
            <span className="form-error">{fieldErrors.email}</span>
          )}
        </div>

        {/* Password */}
        <div className={`form-group ${fieldErrors.password ? 'form-group--error' : ''}`}>
          <label className="form-label" htmlFor="password">Mật khẩu</label>
          <div className="form-input-wrap">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input form-input--with-action"
              placeholder="••••••••"
              value={fields.password}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="form-input-action"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <span className="form-error">{fieldErrors.password}</span>
          )}
        </div>

        <div className="login__forgot">
          <Link to={ROUTES.FORGOT}>Quên mật khẩu?</Link>
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--full"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="btn__spinner" />
          ) : null}
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="register-footer">
        Chưa có tài khoản?{' '}
        <Link to={ROUTES.REGISTER} className="register-footer__link">Đăng ký ngay</Link>
      </div>
    </div>
  );
}

export default Login;
