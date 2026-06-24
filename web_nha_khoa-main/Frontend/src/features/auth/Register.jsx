import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../api/auth.api';
import { ROUTES } from '../../routes/constants';
import './Login.css';

/* ── Validation ── */
function validate(f) {
  const errors = {};
  if (!f.fullName.trim()) errors.fullName = 'Họ tên là bắt buộc';
  else if (f.fullName.trim().length < 2) errors.fullName = 'Họ tên tối thiểu 2 ký tự';

  if (!f.email.trim()) errors.email = 'Email là bắt buộc';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errors.email = 'Email không hợp lệ';

  if (f.phone && !/^[0-9+\s()-]{8,20}$/.test(f.phone))
    errors.phone = 'Số điện thoại không hợp lệ (từ 8 đến 20 số)';

  if (!f.password) errors.password = 'Mật khẩu là bắt buộc';
  else if (f.password.length < 8) errors.password = 'Mật khẩu tối thiểu 8 ký tự';
  else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(f.password))
    errors.password = 'Cần chữ hoa, chữ thường, số và ký tự đặc biệt';

  if (f.password !== f.confirmPassword)
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp';

  return errors;
}

/* ── Password strength ── */
function getStrength(pw) {
  if (!pw) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[@$!%*?&]/.test(pw)) score++;

  if (score <= 1) return { level: 1, label: 'Yếu', color: '#ef4444' };
  if (score === 2) return { level: 2, label: 'Trung bình', color: '#f59e0b' };
  if (score === 3) return { level: 3, label: 'Khá', color: '#3b82f6' };
  return { level: 4, label: 'Mạnh', color: '#10b981' };
}

function PasswordStrength({ password }) {
  const { level, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <div className="password-strength">
      <div className="password-strength__bar">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="password-strength__segment"
            style={{ background: i <= level ? color : '#e5e7eb' }}
          />
        ))}
      </div>
      <span className="password-strength__label" style={{ color }}>{label}</span>
    </div>
  );
}

/* ── Main ── */
export default function Register() {
  const navigate = useNavigate();
  const [fields, setFields] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: '',
    dateOfBirth: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const errors = validate(fields);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      await authApi.register({
        fullName: fields.fullName.trim(),
        email: fields.email.trim(),
        phone: fields.phone.trim() || undefined,
        password: fields.password,
        gender: fields.gender || undefined,
        dateOfBirth: fields.dateOfBirth || undefined,
      });
      setSuccess(true);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      const msg = apiErrors && Array.isArray(apiErrors)
        ? apiErrors.map(e => e.message).join(', ')
        : (err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  }, [fields]);

  /* ── Success Screen ── */
  if (success) {
    return (
      <div className="login">
        <div className="register-success">
          <div className="register-success__icon">🎉</div>
          <h2 className="login__title" style={{ textAlign: 'center' }}>Đăng ký thành công!</h2>
          <p className="login__subtitle" style={{ textAlign: 'center', marginBottom: 24 }}>
            Tài khoản của bạn đã được tạo. Bạn có thể đăng nhập ngay bây giờ.
          </p>
          <button
            className="btn btn--primary btn--full"
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            Đi đến trang Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="login">
      <div className="login__header">
        <h2 className="login__title">Đăng ký tài khoản</h2>
        <p className="login__subtitle">Tạo tài khoản bệnh nhân mới để đặt lịch khám</p>
      </div>

      {serverError && (
        <div className="login__alert login__alert--error" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {serverError}
        </div>
      )}

      <form className="login__form" onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className={`form-group ${fieldErrors.fullName ? 'form-group--error' : ''}`}>
          <label className="form-label" htmlFor="fullName">Họ và tên *</label>
          <input
            id="fullName"
            name="fullName"
            className="form-input"
            placeholder="Nguyễn Văn A"
            value={fields.fullName}
            onChange={handleChange}
            disabled={loading}
          />
          {fieldErrors.fullName && <span className="form-error">{fieldErrors.fullName}</span>}
        </div>

        {/* Email */}
        <div className={`form-group ${fieldErrors.email ? 'form-group--error' : ''}`}>
          <label className="form-label" htmlFor="reg-email">Email *</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            className="form-input"
            placeholder="email@example.com"
            value={fields.email}
            onChange={handleChange}
            autoComplete="email"
            disabled={loading}
          />
          {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
        </div>

        {/* Phone */}
        <div className={`form-group ${fieldErrors.phone ? 'form-group--error' : ''}`}>
          <label className="form-label" htmlFor="phone">Số điện thoại</label>
          <input
            id="phone"
            name="phone"
            className="form-input"
            placeholder="0901234567"
            value={fields.phone}
            onChange={handleChange}
            disabled={loading}
          />
          {fieldErrors.phone && <span className="form-error">{fieldErrors.phone}</span>}
        </div>

        {/* Gender + DOB row */}
        <div className="register-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label" htmlFor="gender">Giới tính</label>
            <select
              id="gender"
              name="gender"
              className="form-input form-select"
              value={fields.gender}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">— Chọn —</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label" htmlFor="dateOfBirth">Ngày sinh</label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              className="form-input"
              value={fields.dateOfBirth}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        {/* Password */}
        <div className={`form-group ${fieldErrors.password ? 'form-group--error' : ''}`}>
          <label className="form-label" htmlFor="reg-password">Mật khẩu *</label>
          <div className="form-input-wrap">
            <input
              id="reg-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input form-input--with-action"
              placeholder="••••••••"
              value={fields.password}
              onChange={handleChange}
              autoComplete="new-password"
              disabled={loading}
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
          <PasswordStrength password={fields.password} />
          {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}
        </div>

        {/* Confirm Password */}
        <div className={`form-group ${fieldErrors.confirmPassword ? 'form-group--error' : ''}`}>
          <label className="form-label" htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={fields.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            disabled={loading}
          />
          {fieldErrors.confirmPassword && <span className="form-error">{fieldErrors.confirmPassword}</span>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn--primary btn--full"
          disabled={loading}
        >
          {loading ? <span className="btn__spinner" /> : null}
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>

      {/* Footer link */}
      <div className="register-footer">
        Đã có tài khoản?{' '}
        <Link to={ROUTES.LOGIN} className="register-footer__link">Đăng nhập</Link>
      </div>
    </div>
  );
}
