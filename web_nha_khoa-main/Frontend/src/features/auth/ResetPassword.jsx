import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/auth.store';
import useAuthForm from '../../hooks/useAuthForm';
import AuthLayout from './components/AuthLayout';
import FormField from './components/FormField';
import { ROUTES } from '../../utils/constants';
import { isStrongPassword, isRequired } from '../../utils/helpers';

// ─── Validation ────────────────────────────────────────────────────────────────

const validate = (values) => {
  const errors = {};

  if (!isRequired(values.password)) {
    errors.password = 'Mật khẩu mới là bắt buộc.';
  } else if (!isStrongPassword(values.password)) {
    errors.password =
      'Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số.';
  }

  if (!isRequired(values.confirmPassword)) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
  }

  return errors;
};

// ─── Component ─────────────────────────────────────────────────────────────────

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState('');

  const token = searchParams.get('token');
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const storeError = useAuthStore((state) => state.error);
  const loading = useAuthStore((state) => state.loading);

  // Validate token tồn tại trong URL
  useEffect(() => {
    if (!token) {
      setTokenError(
        'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.'
      );
    }
  }, [token]);

  const handleSubmit = async (values) => {
    const result = await resetPassword({
      token,
      password: values.password,
      confirmPassword: values.confirmPassword,
    });

    if (result.success) {
      setSuccess(true);
    }
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit: onSubmit,
  } = useAuthForm(
    { password: '', confirmPassword: '' },
    validate,
    handleSubmit
  );

  const isLoading = loading || isSubmitting;

  // Token không có trong URL
  if (tokenError) {
    return (
      <AuthLayout
        title="Link không hợp lệ"
        footerText="Cần link mới?"
        footerLink={ROUTES.FORGOT_PASSWORD}
        footerLinkText="Gửi lại email"
      >
        <div className="alert alert--error">{tokenError}</div>
      </AuthLayout>
    );
  }

  // Đặt lại thành công
  if (success) {
    return (
      <AuthLayout title="Đặt lại mật khẩu thành công!">
        <div className="alert alert--success">
          Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập với mật khẩu mới.
        </div>
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

  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      subtitle="Nhập mật khẩu mới cho tài khoản của bạn."
    >
      {storeError && (
        <div className="alert alert--error" role="alert">
          {storeError}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <FormField
          label="Mật khẩu mới"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          touched={touched.password}
          placeholder="Tối thiểu 8 ký tự"
          autoComplete="new-password"
          disabled={isLoading}
        />

        <FormField
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.confirmPassword}
          touched={touched.confirmPassword}
          placeholder="Nhập lại mật khẩu mới"
          autoComplete="new-password"
          disabled={isLoading}
        />

        <button
          type="submit"
          className="btn btn--primary btn--full"
          disabled={isLoading}
        >
          {isLoading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
