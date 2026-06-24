import { useState } from 'react';
import useAuthStore from '../../store/auth.store';
import useAuthForm from '../../hooks/useAuthForm';
import AuthLayout from './components/AuthLayout';
import FormField from './components/FormField';
import { ROUTES } from '../../utils/constants';
import { isValidEmail, isRequired } from '../../utils/helpers';

// ─── Validation ────────────────────────────────────────────────────────────────

const validate = (values) => {
  const errors = {};

  if (!isRequired(values.email)) {
    errors.email = 'Email là bắt buộc.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Email không hợp lệ.';
  }

  return errors;
};

// ─── Component ─────────────────────────────────────────────────────────────────

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const storeError = useAuthStore((state) => state.error);
  const loading = useAuthStore((state) => state.loading);

  const handleSubmit = async (values) => {
    const email = values.email.trim();
    const result = await forgotPassword(email);

    if (result.success) {
      setSubmittedEmail(email);
      setSubmitted(true);
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
  } = useAuthForm({ email: '' }, validate, handleSubmit);

  const isLoading = loading || isSubmitting;

  // Sau khi gửi thành công → hiện confirmation
  if (submitted) {
    return (
      <AuthLayout
        title="Kiểm tra email"
        subtitle={`Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến ${submittedEmail}`}
        footerText="Nhớ ra mật khẩu rồi?"
        footerLink={ROUTES.LOGIN}
        footerLinkText="Đăng nhập"
      >
        <div className="alert alert--info">
          Nếu không nhận được email trong vài phút, hãy kiểm tra thư mục spam
          hoặc thử lại.
        </div>
        <button
          className="btn btn--secondary btn--full"
          style={{ marginTop: '1rem' }}
          onClick={() => {
            setSubmitted(false);
            setSubmittedEmail('');
          }}
        >
          Gửi lại email
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu."
      footerText="Nhớ ra mật khẩu rồi?"
      footerLink={ROUTES.LOGIN}
      footerLinkText="Đăng nhập"
    >
      {storeError && (
        <div className="alert alert--error" role="alert">
          {storeError}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <FormField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          touched={touched.email}
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isLoading}
        />

        <button
          type="submit"
          className="btn btn--primary btn--full"
          disabled={isLoading}
        >
          {isLoading ? 'Đang gửi...' : 'Gửi hướng dẫn đặt lại'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
