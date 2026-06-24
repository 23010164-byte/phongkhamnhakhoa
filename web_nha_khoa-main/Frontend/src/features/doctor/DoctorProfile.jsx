import { useEffect, useRef, useState } from 'react';
import useDoctorStore from '../../store/doctor.store';
import {
  Spinner, Alert, AvatarPlaceholder, PageHeader,
  Card, CardHeader, CardBody, Icon, FormGroup, Btn,
} from './DoctorUI';
import './doctor.css';

/* ── Validation ── */
function validate(v) {
  const e = {};
  if (!v.fullName?.trim())  e.fullName  = 'Họ tên không được để trống.';
  if (!v.specialty?.trim()) e.specialty = 'Chuyên khoa không được để trống.';
  if (v.phone && !/^(0|\+84)[0-9]{8,10}$/.test(v.phone.trim()))
    e.phone = 'Số điện thoại không hợp lệ.';
  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
    e.email = 'Email không hợp lệ.';
  if (v.yearsExp && (isNaN(v.yearsExp) || v.yearsExp < 0 || v.yearsExp > 60))
    e.yearsExp = 'Số năm kinh nghiệm không hợp lệ.';
  return e;
}

/* ── Avatar upload ── */
function AvatarUpload({ profile, onUploaded }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState(null);

  // Import on demand to avoid circular dep
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setErr('Ảnh tối đa 3MB.'); return; }
    if (!file.type.startsWith('image/')) { setErr('Vui lòng chọn file ảnh.'); return; }
    setErr(null);
    setUploading(true);
    try {
      const { default: userApi } = await import('../../api/user.api');
      const fd = new FormData();
      fd.append('avatar', file);
      await userApi.updateAvatar(fd);
      onUploaded?.();
    } catch (ex) {
      setErr(ex.response?.data?.message ?? 'Upload thất bại.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 24px 0' }}>
      <div style={{ position: 'relative' }}>
        <AvatarPlaceholder name={profile?.user?.full_name || profile?.fullName} size="lg" src={profile?.user?.avatar || profile?.avatarUrl} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          aria-label="Thay ảnh"
          style={{
            position: 'absolute', bottom: 0, right: -4,
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--color-text-secondary)',
          }}
        >
          <Icon name="camera" size={13} />
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>
      {err && <div className="form-error">⚠ {err}</div>}
      <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem' }}>
          {profile?.user?.full_name || profile?.fullName}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 500 }}>
          {profile?.specialty?.name || (typeof profile?.specialty === 'string' ? profile.specialty : '')}
        </div>
      </div>
    </div>
  );
}

/* ── DoctorProfile ── */
export default function DoctorProfile() {
  const { myProfile: profile, myProfileLoading: loading, myProfileError: error,
    fetchMyProfile, updateMyProfile, clearMyProfileError } = useDoctorStore();

  const [values, setValues] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => { fetchMyProfile(); }, []);

  // Populate form once profile loads
  useEffect(() => {
    if (profile && !values) {
      // Handle array or string for education/certifications defensively
      const parseField = (val) => Array.isArray(val) ? val.join('\n') : (val || '');
      
      const specialtyName = profile.specialty?.name || (typeof profile.specialty === 'string' ? profile.specialty : '');

      setValues({
        fullName:      profile.user?.full_name ?? profile.fullName ?? '',
        phone:         profile.user?.phone ?? profile.phone ?? '',
        email:         profile.user?.email ?? profile.email ?? '',
        specialty:     specialtyName,
        qualification: profile.title ?? profile.qualification ?? '',
        room:          profile.room ?? '',
        yearsExp:      profile.experience_years ?? profile.yearsExp ?? '',
        bio:           profile.bio ?? '',
        education:     parseField(profile.education),
        certifications:parseField(profile.certificate ?? profile.certifications),
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
    setSuccess(false);
    clearMyProfileError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(values);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      ...values,
      experienceYears: values.yearsExp ? Number(values.yearsExp) : undefined,
      title:           values.qualification,
      education:       values.education.split('\n').map(s => s.trim()).filter(Boolean).join('\n'),
      certificate:     values.certifications.split('\n').map(s => s.trim()).filter(Boolean).join('\n'),
    };

    const result = await updateMyProfile(payload);
    if (result.success) setSuccess(true);
  };

  if (loading && !profile) return <Spinner label="Đang tải hồ sơ…" />;
  if (error && !profile)   return <Alert type="error" onClose={clearMyProfileError}>{error}</Alert>;
  if (!values)             return null;

  const field = (name, label, props = {}) => (
    <FormGroup label={label} htmlFor={name} error={errors[name]}>
      <input
        id={name} name={name}
        className={`form-control${errors[name] ? ' error' : ''}`}
        value={values[name]}
        onChange={handleChange}
        {...props}
      />
    </FormGroup>
  );

  return (
    <div>
      <PageHeader title="Hồ sơ bác sĩ" subtitle="Cập nhật thông tin chuyên môn và cá nhân" />

      {error   && <Alert type="error" onClose={clearMyProfileError}>{error}</Alert>}
      {success && <Alert type="success">Cập nhật thành công.</Alert>}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>

          {/* Avatar card */}
          <Card>
            <AvatarUpload profile={profile} onUploaded={fetchMyProfile} />
            <CardBody style={{ paddingTop: 16 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                Ảnh JPG/PNG, tối đa 3MB.<br />Tỷ lệ 1:1 cho tốt nhất.
              </div>
            </CardBody>
          </Card>

          {/* Form cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Personal info */}
            <Card>
              <CardHeader title="Thông tin cá nhân" />
              <CardBody>
                <div className="form-row">
                  {field('fullName', 'Họ và tên *', { placeholder: 'BS. Nguyễn Văn A' })}
                  {field('phone', 'Số điện thoại', { placeholder: '0901234567' })}
                </div>
                {field('email', 'Email', { type: 'email', placeholder: 'doctor@hospital.vn' })}
              </CardBody>
            </Card>

            {/* Professional info */}
            <Card>
              <CardHeader title="Thông tin chuyên môn" />
              <CardBody>
                <div className="form-row">
                  {field('specialty', 'Chuyên khoa *', { placeholder: 'Nội tiết, Tim mạch…' })}
                  {field('qualification', 'Bằng cấp', { placeholder: 'Tiến sĩ Y khoa…' })}
                </div>
                <div className="form-row">
                  {field('room', 'Số phòng khám', { placeholder: '101' })}
                  {field('yearsExp', 'Năm kinh nghiệm', { type: 'number', min: 0, max: 60, placeholder: '10' })}
                </div>

                <FormGroup label="Giới thiệu bản thân" htmlFor="bio">
                  <textarea
                    id="bio" name="bio"
                    className="form-control"
                    value={values.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Mô tả ngắn về chuyên môn, kinh nghiệm…"
                    style={{ resize: 'vertical' }}
                  />
                </FormGroup>
              </CardBody>
            </Card>

            {/* Education & certs */}
            <Card>
              <CardHeader title="Học vấn & Chứng chỉ" />
              <CardBody>
                <FormGroup
                  label="Học vấn & Đào tạo"
                  htmlFor="education"
                  hint="Mỗi dòng một mục (trường, năm tốt nghiệp…)"
                >
                  <textarea
                    id="education" name="education"
                    className="form-control"
                    value={values.education}
                    onChange={handleChange}
                    rows={3}
                    placeholder={'ĐH Y Hà Nội – 2005\nBV Bạch Mai – Nội trú 2007'}
                    style={{ resize: 'vertical' }}
                  />
                </FormGroup>

                <FormGroup
                  label="Chứng chỉ chuyên môn"
                  htmlFor="certifications"
                  hint="Mỗi dòng một chứng chỉ"
                >
                  <textarea
                    id="certifications" name="certifications"
                    className="form-control"
                    value={values.certifications}
                    onChange={handleChange}
                    rows={3}
                    placeholder={'Chứng chỉ siêu âm – 2010\nChứng chỉ nội soi – 2012'}
                    style={{ resize: 'vertical' }}
                  />
                </FormGroup>
              </CardBody>
            </Card>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={fetchMyProfile}>
                Huỷ thay đổi
              </button>
              <Btn type="submit" disabled={loading}>
                {loading
                  ? <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> Đang lưu…</>
                  : <><Icon name="check" size={15} /> Lưu hồ sơ</>
                }
              </Btn>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
