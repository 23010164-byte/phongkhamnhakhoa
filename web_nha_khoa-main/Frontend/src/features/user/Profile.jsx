import { useEffect, useRef, useState, useCallback } from 'react';
import useUserStore from '../../store/user.store';
import useAuthStore from '../../store/auth.store';
import userApi from '../../api/user.api';
import { Spinner, Alert, AvatarPlaceholder, RoleBadge, Icon } from './UserUI';
import './user.css';

/* ────────────────────────────────────────────────────
   Validation helpers
──────────────────────────────────────────────────── */
function validateProfileForm(values) {
  const errors = {};
  if (!values.fullName?.trim()) errors.fullName = 'Họ tên không được để trống.';
  if (!values.phone?.trim()) {
    errors.phone = 'Số điện thoại không được để trống.';
  } else if (!/^(0|\+84)[0-9]{8,10}$/.test(values.phone.trim())) {
    errors.phone = 'Số điện thoại không hợp lệ.';
  }
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Email không hợp lệ.';
  }
  return errors;
}

function validatePasswordForm(values) {
  const errors = {};
  if (!values.currentPassword) errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
  if (!values.newPassword) {
    errors.newPassword = 'Vui lòng nhập mật khẩu mới.';
  } else if (values.newPassword.length < 8) {
    errors.newPassword = 'Mật khẩu phải ít nhất 8 ký tự.';
  }
  if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
  }
  return errors;
}

/* ────────────────────────────────────────────────────
   ProfileForm
──────────────────────────────────────────────────── */
function ProfileForm({ profile, onSaved }) {
  const { updateProfile, profileLoading, profileError, clearProfileError } = useUserStore();

  const [values, setValues] = useState({
    fullName:  profile?.fullName  ?? '',
    email:     profile?.email     ?? '',
    phone:     profile?.phone     ?? '',
    address:   profile?.address   ?? '',
    dob:       profile?.dob       ?? '',
    gender:    profile?.gender    ?? '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
    setSuccess(false);
    clearProfileError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateProfileForm(values);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const result = await updateProfile(values);
    if (result.success) {
      setSuccess(true);
      onSaved?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {profileError && (
        <Alert type="error" onClose={clearProfileError}>{profileError}</Alert>
      )}
      {success && (
        <Alert type="success">Cập nhật hồ sơ thành công.</Alert>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="fullName">Họ và tên *</label>
          <input
            id="fullName" name="fullName" className={`form-control${errors.fullName ? ' error' : ''}`}
            value={values.fullName} onChange={handleChange} placeholder="Nguyễn Văn A"
          />
          {errors.fullName && <div className="form-error">⚠ {errors.fullName}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email" name="email" type="email"
            className={`form-control${errors.email ? ' error' : ''}`}
            value={values.email} onChange={handleChange} placeholder="example@email.com"
          />
          {errors.email && <div className="form-error">⚠ {errors.email}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="phone">Số điện thoại *</label>
          <input
            id="phone" name="phone" className={`form-control${errors.phone ? ' error' : ''}`}
            value={values.phone} onChange={handleChange} placeholder="0901234567"
          />
          {errors.phone && <div className="form-error">⚠ {errors.phone}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="dob">Ngày sinh</label>
          <input id="dob" name="dob" type="date" className="form-control"
            value={values.dob} onChange={handleChange} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="gender">Giới tính</label>
          <select id="gender" name="gender" className="form-control form-select"
            value={values.gender} onChange={handleChange}>
            <option value="">-- Chọn --</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="address">Địa chỉ</label>
          <input id="address" name="address" className="form-control"
            value={values.address} onChange={handleChange} placeholder="Số nhà, đường, quận/huyện…" />
        </div>
      </div>

      <div className="card-footer" style={{ padding: '20px 0 0', border: 'none', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={profileLoading}>
          {profileLoading
            ? <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> Đang lưu…</>
            : <><Icon name="check" size={15} /> Lưu thay đổi</>
          }
        </button>
      </div>
    </form>
  );
}

/* ────────────────────────────────────────────────────
   ChangePasswordForm
──────────────────────────────────────────────────── */
function ChangePasswordForm() {
  const [values, setValues] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
    setSuccess(false);
    setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validatePasswordForm(values);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await userApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setSuccess(true);
      setValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setServerError(err.response?.data?.message ?? 'Đổi mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && <Alert type="error" onClose={() => setServerError(null)}>{serverError}</Alert>}
      {success    && <Alert type="success">Đổi mật khẩu thành công.</Alert>}

      <div className="form-group">
        <label className="form-label" htmlFor="currentPassword">Mật khẩu hiện tại *</label>
        <input
          id="currentPassword" name="currentPassword" type="password"
          className={`form-control${errors.currentPassword ? ' error' : ''}`}
          value={values.currentPassword} onChange={handleChange} autoComplete="current-password"
        />
        {errors.currentPassword && <div className="form-error">⚠ {errors.currentPassword}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="newPassword">Mật khẩu mới *</label>
          <input
            id="newPassword" name="newPassword" type="password"
            className={`form-control${errors.newPassword ? ' error' : ''}`}
            value={values.newPassword} onChange={handleChange} autoComplete="new-password"
          />
          {errors.newPassword
            ? <div className="form-error">⚠ {errors.newPassword}</div>
            : <div className="form-hint">Tối thiểu 8 ký tự.</div>
          }
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
          <input
            id="confirmPassword" name="confirmPassword" type="password"
            className={`form-control${errors.confirmPassword ? ' error' : ''}`}
            value={values.confirmPassword} onChange={handleChange} autoComplete="new-password"
          />
          {errors.confirmPassword && <div className="form-error">⚠ {errors.confirmPassword}</div>}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading
            ? <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> Đang lưu…</>
            : <><Icon name="lock" size={15} /> Đổi mật khẩu</>
          }
        </button>
      </div>
    </form>
  );
}

/* ────────────────────────────────────────────────────
   AvatarUpload
──────────────────────────────────────────────────── */
function AvatarUpload({ profile, onUploaded }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Ảnh tối đa 2MB.'); return; }
    if (!file.type.startsWith('image/')) { setError('Vui lòng chọn file ảnh.'); return; }
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      await userApi.updateAvatar(fd);
      onUploaded?.();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Upload thất bại.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <AvatarPlaceholder name={profile?.fullName} size="lg" src={profile?.avatarUrl} />
      <button
        type="button"
        className="btn-icon-only"
        style={{
          position: 'absolute', bottom: 0, right: -4,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '50%',
          width: 28, height: 28,
        }}
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        aria-label="Thay ảnh đại diện"
      >
        <Icon name="camera" size={13} />
      </button>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      {error && <div className="form-error" style={{ marginTop: 6 }}>⚠ {error}</div>}
    </div>
  );
}

/* ────────────────────────────────────────────────────
   Profile (main export)
──────────────────────────────────────────────────── */
export default function Profile() {
  const { profile, profileLoading, profileError, fetchProfile, clearProfileError } = useUserStore();

  useEffect(() => {
    fetchProfile();
    return () => clearProfileError();
  }, []);

  if (profileLoading && !profile) return <Spinner label="Đang tải hồ sơ…" />;

  if (profileError && !profile) {
    return (
      <Alert type="error" onClose={clearProfileError}>
        {profileError} –{' '}
        <button className="btn-ghost btn-sm" onClick={fetchProfile}>Thử lại</button>
      </Alert>
    );
  }

  const mappedProfile = profile ? {
    fullName: profile.full_name || profile.fullName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    address: profile.address || '',
    dob: profile.date_of_birth || profile.dob || '',
    gender: profile.gender || '',
    avatarUrl: profile.avatar || profile.avatarUrl || '',
    role: profile.role || '',
  } : null;

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-title">Hồ sơ của tôi</div>
          <div className="page-subtitle">Xem và cập nhật thông tin cá nhân</div>
        </div>
      </div>

      <div className="profile-layout">
        {/* Left – avatar card */}
        <div className="card profile-avatar-card">
          <AvatarUpload profile={mappedProfile} onUploaded={fetchProfile} />
          <div>
            <div className="profile-name">{mappedProfile?.fullName ?? '—'}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
              {mappedProfile?.email}
            </div>
          </div>
          <div className="profile-role-badge">
            <RoleBadge role={mappedProfile?.role} />
          </div>
          <hr className="divider" style={{ width: '100%', margin: '8px 0' }} />
          <div style={{ width: '100%', textAlign: 'left' }}>
            {[
              ['Điện thoại', mappedProfile?.phone],
              ['Ngày sinh', mappedProfile?.dob ? new Date(mappedProfile.dob).toLocaleDateString('vi-VN') : '—'],
              ['Giới tính', mappedProfile?.gender === 'male' ? 'Nam' : mappedProfile?.gender === 'female' ? 'Nữ' : mappedProfile?.gender],
            ].map(([label, value]) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <div className="detail-field-label">{label}</div>
                <div className="detail-field-value">{value || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right – forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Edit profile */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Thông tin cá nhân</span>
            </div>
            <div className="card-body">
              {mappedProfile && <ProfileForm profile={mappedProfile} onSaved={fetchProfile} />}
            </div>
          </div>

          {/* Change password */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Đổi mật khẩu</span>
            </div>
            <div className="card-body">
              <ChangePasswordForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
