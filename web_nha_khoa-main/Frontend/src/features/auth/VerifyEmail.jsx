import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/auth.store';
import AuthLayout from './components/AuthLayout';
import { ROUTES } from '../../utils/constants';

// ─── States ────────────────────────────────────────────────────────────────────
const STATUS = {
  VERIFYING: 'verifying',
  SUCCESS: 'success',
  ERROR: 'error',
  NO_TOKEN: 'no_token',
};

// ─── Component ─────────────────────────────────────────────────────────────────

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(STATUS.VERIFYING);
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const resendVerification = useAuthStore((state) => state.resendVerification);

  const token = searchParams.get('token');
  const emailParam = searchParams.get('email'); // optional: email để resend

  useEffect(() => {
    if (!token) {
      setStatus(STATUS.NO_TOKEN);
      return;
    }

    const run = async () => {
      const result = await verifyEmail(token);

      if (result.success) {
        setStatus(STATUS.SUCCESS);
        setMessage(result.message || 'Email đã được xác thực thành công!');
      } else {
        setStatus(STATUS.ERROR);
        setMessage(result.message || 'Xác thực thất bại. Link có thể đã hết hạn.');
      }
    };

    run();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResend = async (e) => {
    e.preventDefault();
    const email = (resendEmail || emailParam || '').trim();

    if (!email) {
      setResendMessage('Vui lòng nhập email.');
      return;
    }

    setResendLoading(true);
    setResendMessage('');

    const result = await resendVerification(email);
    setResendMessage(
      result.success
        ? 'Email xác thực đã được gửi lại. Hãy kiểm tra hộp thư.'
        : result.message
    );
    setResendLoading(false);
  };

  // ── Render theo trạng thái ──────────────────────────────────────────────────

  if (status === STATUS.VERIFYING) {
    return (
      <AuthLayout title="Đang xác thực..." subtitle="Vui lòng chờ trong giây lát.">
        <div className="verify-loading">
          <span className="page-loader__spinner" />
        </div>
      </AuthLayout>
    );
  }

  if (status === STATUS.SUCCESS) {
    return (
      <AuthLayout title="Xác thực thành công!">
        <div className="alert alert--success">{message}</div>
        <button
          className="btn btn--primary btn--full"
          style={{ marginTop: '1rem' }}
          onClick={() => navigate(ROUTES.LOGIN)}
        >
          Đăng nhập ngay
        </button>
      </AuthLayout>
    );
  }

  if (status === STATUS.NO_TOKEN || status === STATUS.ERROR) {
    return (
      <AuthLayout
        title={status === STATUS.NO_TOKEN ? 'Link không hợp lệ' : 'Xác thực thất bại'}
        footerText="Về trang đăng nhập?"
        footerLink={ROUTES.LOGIN}
        footerLinkText="Đăng nhập"
      >
        <div className="alert alert--error">{message || 'Link xác thực không hợp lệ.'}</div>

        {/* Cho phép gửi lại nếu link hết hạn */}
        <div className="resend-section">
          <p className="text-muted" style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            Gửi lại email xác thực:
          </p>

          <form onSubmit={handleResend} noValidate>
            <input
              type="email"
              className="form-field__input"
              placeholder="Nhập email của bạn"
              value={resendEmail || emailParam || ''}
              onChange={(e) => setResendEmail(e.target.value)}
              disabled={resendLoading}
            />
            {resendMessage && (
              <span className="form-field__error">{resendMessage}</span>
            )}
            <button
              type="submit"
              className="btn btn--secondary btn--full"
              style={{ marginTop: '0.75rem' }}
              disabled={resendLoading}
            >
              {resendLoading ? 'Đang gửi...' : 'Gửi lại email xác thực'}
            </button>
          </form>
        </div>
      </AuthLayout>
    );
  }

  return null;
};

export default VerifyEmail;
