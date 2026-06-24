import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useDoctorStore from '../../store/doctor.store';
import useAuthStore from '../../store/auth.store';
import {
  Spinner, Alert, AvatarPlaceholder, Stars, Pagination,
  PageHeader, EmptyState, Icon, Badge,
} from './DoctorUI';
import './doctor.css';

/* ── Debounce ── */
function useDebounce(val, ms = 400) {
  const [v, setV] = useState(val);
  useEffect(() => { const t = setTimeout(() => setV(val), ms); return () => clearTimeout(t); }, [val, ms]);
  return v;
}

/* ── Doctor card ── */
function DoctorCard({ doctor, onClick, isAdmin }) {
  const fullName = doctor.user?.full_name || 'Bác sĩ';
  const specialtyName = doctor.specialty?.name || 'Đa khoa';
  const avatarUrl = doctor.user?.avatar;
  const rating = parseFloat(doctor.rating_avg || 0);
  const reviewCount = doctor.rating_count || 0;
  const yearsExp = doctor.experience_years;
  const isAvailable = doctor.is_available;

  return (
    <div className="doctor-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      <AvatarPlaceholder name={fullName} size="lg" src={avatarUrl} />
      <div className="doctor-card-name">{fullName}</div>
      <div className="doctor-card-specialty">{specialtyName}</div>

      {reviewCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <Stars value={rating} />
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            ({reviewCount})
          </span>
        </div>
      )}

      <div className="doctor-card-meta">
        <Icon name="stethoscope" size={13} />
        {yearsExp != null ? `${yearsExp} năm kinh nghiệm` : 'Bác sĩ chuyên khoa'}
      </div>

      <Badge
        label={isAvailable ? 'Đang làm việc' : 'Nghỉ'}
        type={isAvailable ? 'active' : 'inactive'}
      />

      <div className="doctor-card-actions">
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={(e) => { e.stopPropagation(); onClick(); }}>
          {isAdmin ? 'Xem & Sửa thông tin' : 'Xem lịch khám'}
        </button>
      </div>
    </div>
  );
}

/* ── Create Doctor Modal (Admin) ── */
function CreateDoctorModal({ onClose, onCreated, specialties }) {
  const { createDoctor } = useDoctorStore();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: 'Doctor@123', // Mật khẩu mặc định mạnh
    gender: '',
    dateOfBirth: '',
    specialtyId: '',
    title: 'Bác sĩ',
    experienceYears: '5',
    consultationFee: '150000',
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    workingStart: '08:00',
    workingEnd: '17:00',
    slotDurationMinutes: '30',
    maxPatientsPerDay: '20',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.specialtyId) {
      setError('Vui lòng chọn chuyên khoa');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await createDoctor(form);
    setLoading(false);
    if (result.success) {
      onCreated?.();
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="modal-box" style={{ maxWidth: 640, width: '95vw', padding: 24, textAlign: 'left' }}>
        <div className="modal-title" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16, fontSize: '1.25rem', fontWeight: 600 }}>
          Thêm bác sĩ mới
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
          
          <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 8 }}>
            <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-primary)', borderBottom: '1px dashed var(--color-border)', paddingBottom: 4, fontSize: '0.95rem' }}>
              1. Thông tin tài khoản bác sĩ
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>Họ và tên <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input
                  className="form-control"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Nguyễn Văn A"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>Email <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input
                  className="form-control"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="email@example.com"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>Số điện thoại</label>
                <input
                  className="form-control"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0901234567"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>Mật khẩu tài khoản <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input
                  className="form-control"
                  type="text"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Tối thiểu 8 ký tự"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>Giới tính</label>
                <select 
                  className="form-control" 
                  name="gender" 
                  value={form.gender} 
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6, background: '#fff' }}
                >
                  <option value="">— Chọn —</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>Ngày sinh</label>
                <input
                  className="form-control"
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6 }}
                />
              </div>
            </div>

            <h4 style={{ margin: '20px 0 12px 0', color: 'var(--color-primary)', borderBottom: '1px dashed var(--color-border)', paddingBottom: 4, fontSize: '0.95rem' }}>
              2. Hồ sơ chuyên môn
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>Chuyên khoa <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <select
                  className="form-control"
                  name="specialtyId"
                  value={form.specialtyId}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6, background: '#fff' }}
                >
                  <option value="">— Chọn chuyên khoa —</option>
                  {specialties.map((s) => (
                    <option key={s.id || s} value={s.id || s}>
                      {s.name || s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>Học vị / Chức danh</label>
                <input
                  className="form-control"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Thạc sĩ, Bác sĩ"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>Số năm kinh nghiệm</label>
                <input
                  className="form-control"
                  type="number"
                  name="experienceYears"
                  value={form.experienceYears}
                  onChange={handleChange}
                  min="0"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>Phí khám bệnh (VNĐ)</label>
                <input
                  className="form-control"
                  type="number"
                  name="consultationFee"
                  value={form.consultationFee}
                  onChange={handleChange}
                  min="0"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6 }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 24, borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Huỷ
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang thêm…' : 'Thêm bác sĩ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Edit Doctor Modal (Admin) ── */
function EditDoctorModal({ doctor, onClose, onUpdated, specialties }) {
  const { updateDoctor } = useDoctorStore();
  const [form, setForm] = useState({
    fullName: doctor?.user?.full_name || doctor?.fullName || '',
    phone: doctor?.user?.phone || doctor?.phone || '',
    gender: doctor?.user?.gender || doctor?.gender || '',
    dateOfBirth: doctor?.user?.date_of_birth ? doctor.user.date_of_birth.substring(0, 10) : (doctor?.dateOfBirth ? doctor.dateOfBirth.substring(0, 10) : ''),
    specialtyId: doctor?.specialty_id || doctor?.specialty?.id || '',
    title: doctor?.title || '',
    experienceYears: doctor?.experience_years != null ? String(doctor.experience_years) : '0',
    consultationFee: doctor?.consultation_fee != null ? String(doctor.consultation_fee) : '0',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.specialtyId) {
      setError('Vui lòng chọn chuyên khoa');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await updateDoctor(doctor.id, form);
    setLoading(false);
    if (result.success) {
      onUpdated?.();
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="modal-box" style={{ maxWidth: 640, width: '95vw', padding: 24, textAlign: 'left' }}>
        <div className="modal-title" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16, fontSize: '1.25rem', fontWeight: 600 }}>
          Sửa thông tin bác sĩ
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
          
          <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 8 }}>
            <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-primary)', borderBottom: '1px dashed var(--color-border)', paddingBottom: 4, fontSize: '0.95rem' }}>
              1. Thông tin cá nhân
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>Họ và tên <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input
                  className="form-control"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Nguyễn Văn A"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>Số điện thoại</label>
                <input
                  className="form-control"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0901234567"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>Giới tính</label>
                <select 
                  className="form-control" 
                  name="gender" 
                  value={form.gender} 
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6, background: '#fff' }}
                >
                  <option value="">— Chọn —</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>Ngày sinh</label>
                <input
                  className="form-control"
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6 }}
                />
              </div>
            </div>

            <h4 style={{ margin: '20px 0 12px 0', color: 'var(--color-primary)', borderBottom: '1px dashed var(--color-border)', paddingBottom: 4, fontSize: '0.95rem' }}>
              2. Hồ sơ chuyên môn
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>Chuyên khoa <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <select
                  className="form-control"
                  name="specialtyId"
                  value={form.specialtyId}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6, background: '#fff' }}
                >
                  <option value="">— Chọn chuyên khoa —</option>
                  {specialties.map((s) => (
                    <option key={s.id || s} value={s.id || s}>
                      {s.name || s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>Học vị / Chức danh</label>
                <input
                  className="form-control"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Thạc sĩ, Bác sĩ"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>Số năm kinh nghiệm</label>
                <input
                  className="form-control"
                  type="number"
                  name="experienceYears"
                  value={form.experienceYears}
                  onChange={handleChange}
                  min="0"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500, fontSize: '0.85rem' }}>Phí khám bệnh (VNĐ)</label>
                <input
                  className="form-control"
                  type="number"
                  name="consultationFee"
                  value={form.consultationFee}
                  onChange={handleChange}
                  min="0"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6 }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 24, borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Huỷ
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang lưu…' : 'Lưu thông tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── DoctorList ── */
export default function DoctorList() {
  const navigate = useNavigate();
  const {
    doctors, doctorTotal, doctorPage, doctorLimit,
    specialties, listLoading, listError,
    fetchDoctors, fetchSpecialties, clearListError,
  } = useDoctorStore();

  const currentUser = useAuthStore((s) => s.user);
  const currentRole = currentUser?.role;
  const isAdmin = currentRole === 'admin';

  const [search, setSearch]       = useState('');
  const [specialty, setSpecialty] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const debouncedSearch           = useDebounce(search);

  const load = useCallback((page = 1) => {
    fetchDoctors({ page, limit: doctorLimit, search: debouncedSearch, specialtyId: specialty, status: 'active' });
  }, [debouncedSearch, specialty, doctorLimit]);

  useEffect(() => { fetchSpecialties(); }, []);
  useEffect(() => { load(1); }, [debouncedSearch, specialty]);

  return (
    <div>
      <PageHeader
        title="Đội ngũ bác sĩ"
        subtitle="Tìm và đặt lịch với bác sĩ phù hợp"
        actions={
          isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Icon name="plus" size={15} /> Thêm bác sĩ
            </button>
          )
        }
      />

      {listError && <Alert type="error" onClose={clearListError}>{listError}</Alert>}

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: 24 }}>
        <div className="search-input-wrap">
          <Icon name="search" size={15} />
          <input
            className="search-input"
            placeholder="Tìm bác sĩ theo tên…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        >
          <option value="">Tất cả chuyên khoa</option>
          {specialties.map((s) => (
            <option key={s.id ?? s.value ?? s} value={s.id ?? s.value ?? s}>
              {s.name ?? s.label ?? s}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {listLoading && !doctors.length
        ? <Spinner label="Đang tải danh sách bác sĩ…" />
        : doctors.length === 0
          ? <EmptyState icon="user" message="Không tìm thấy bác sĩ nào." />
          : (
            <>
              <div className="doctor-grid">
                {doctors.map((d) => (
                  <DoctorCard
                    key={d.id}
                    doctor={d}
                    isAdmin={isAdmin}
                    onClick={() => {
                      if (isAdmin) {
                        setEditingDoctor(d);
                      } else {
                        navigate(`/doctors/${d.id}`);
                      }
                    }}
                  />
                ))}
              </div>

              {doctorTotal > doctorLimit && (
                <div style={{ marginTop: 28 }}>
                  <Pagination
                    page={doctorPage}
                    limit={doctorLimit}
                    total={doctorTotal}
                    onPageChange={load}
                  />
                </div>
              )}
            </>
          )
      }
      {/* Create doctor modal (admin only) */}
      {showCreateModal && (
        <CreateDoctorModal
          specialties={specialties}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => load(1)}
        />
      )}

      {/* Edit doctor modal (admin only) */}
      {editingDoctor && (
        <EditDoctorModal
          doctor={editingDoctor}
          specialties={specialties}
          onClose={() => setEditingDoctor(null)}
          onUpdated={() => load(doctorPage)}
        />
      )}
    </div>
  );
}
