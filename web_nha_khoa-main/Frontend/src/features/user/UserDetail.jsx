import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useUserStore from '../../store/user.store';
import {
  Spinner, Alert, AvatarPlaceholder,
  RoleBadge, StatusBadge, Icon,
} from './UserUI';
import './user.css';

/* ── Field display row ── */
function DetailField({ label, value, children }) {
  return (
    <div className="detail-field">
      <div className="detail-field-label">{label}</div>
      <div className="detail-field-value">{children ?? value ?? '—'}</div>
    </div>
  );
}

/* ── Section card ── */
function Section({ title, children }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header">
        <span className="card-title">{title}</span>
      </div>
      <div className="card-body">
        <div className="detail-grid">{children}</div>
      </div>
    </div>
  );
}

/* ── Format helpers ── */
const GENDER_LABEL  = { male: 'Nam', female: 'Nữ', other: 'Khác' };
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('vi-VN') : null;
const fmtDateTime = (iso) => iso ? new Date(iso).toLocaleString('vi-VN') : null;

/* ── UserDetail ── */
export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedUser: user,
    selectedUserLoading: loading,
    selectedUserError: error,
    fetchUserById,
    clearSelectedUser,
  } = useUserStore();

  useEffect(() => {
    fetchUserById(id);
    return () => clearSelectedUser();
  }, [id]);

  /* ── States ── */
  if (loading) return <Spinner label="Đang tải thông tin người dùng…" />;

  if (error) {
    return (
      <div>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <Icon name="back" size={15} /> Quay lại
        </button>
        <Alert type="error">{error}</Alert>
        <button className="btn btn-secondary" onClick={() => fetchUserById(id)}>
          Thử lại
        </button>
      </div>
    );
  }

  if (!user) return null;

  const fullName = user.full_name || 'Người dùng';
  const avatarUrl = user.avatar;
  const status = user.is_active ? 'active' : 'inactive';
  const dob = user.date_of_birth;
  const createdAt = user.created_at;
  const updatedAt = user.updated_at;
  const lastLoginAt = user.last_login_at;

  const bloodType = user.blood_type || user.patientInfo?.bloodType;
  const allergies = user.allergies || user.patientInfo?.allergies;
  const emergencyName = user.emergency_contact_name || user.patientInfo?.emergencyContactName;
  const emergencyPhone = user.emergency_contact_phone || user.patientInfo?.emergencyContactPhone;

  return (
    <div>
      {/* Back button */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        <Icon name="back" size={15} /> Quay lại danh sách
      </button>

      {/* Page header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <AvatarPlaceholder name={fullName} size="lg" src={avatarUrl} />
          <div>
            <div className="page-title">{fullName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <RoleBadge role={user.role} />
              <StatusBadge status={status} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/admin/users/${id}/edit`)}
          >
            <Icon name="edit" size={15} /> Chỉnh sửa
          </button>
        </div>
      </div>

      {/* Personal info */}
      <Section title="Thông tin cá nhân">
        <DetailField label="Họ và tên"      value={fullName} />
        <DetailField label="Email"           value={user.email} />
        <DetailField label="Số điện thoại"  value={user.phone} />
        <DetailField label="Ngày sinh"       value={fmtDate(dob)} />
        <DetailField label="Giới tính"       value={GENDER_LABEL[user.gender] ?? user.gender} />
        <DetailField label="Địa chỉ"         value={user.address} />
      </Section>

      {/* Account info */}
      <Section title="Thông tin tài khoản">
        <DetailField label="Mã người dùng"  value={user.id} />
        <DetailField label="Vai trò">
          <RoleBadge role={user.role} />
        </DetailField>
        <DetailField label="Trạng thái">
          <StatusBadge status={status} />
        </DetailField>
        <DetailField label="Ngày tạo"        value={fmtDateTime(createdAt)} />
        <DetailField label="Cập nhật lần cuối" value={fmtDateTime(updatedAt)} />
        <DetailField label="Đăng nhập gần nhất" value={fmtDateTime(lastLoginAt)} />
      </Section>

      {/* Role-specific extra fields */}
      {user.role === 'doctor' && user.doctorInfo && (
        <Section title="Thông tin bác sĩ">
          <DetailField label="Chuyên khoa"    value={user.doctorInfo.specialty} />
          <DetailField label="Phòng khám"     value={user.doctorInfo.room} />
          <DetailField label="Bằng cấp"       value={user.doctorInfo.qualification} />
          <DetailField label="Năm kinh nghiệm" value={user.doctorInfo.yearsExp} />
        </Section>
      )}

      {user.role === 'patient' && (bloodType || allergies || emergencyName || emergencyPhone) && (
        <Section title="Thông tin bệnh nhân">
          <DetailField label="Nhóm máu"        value={bloodType} />
          <DetailField label="Dị ứng"          value={allergies} />
          <DetailField label="Người liên hệ khẩn cấp" value={emergencyName} />
          <DetailField label="SĐT khẩn cấp"    value={emergencyPhone} />
        </Section>
      )}
    </div>
  );
}
