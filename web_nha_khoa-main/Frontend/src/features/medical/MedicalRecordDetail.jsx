import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import medicalApi from '../../api/medical.api';
import appointmentApi from '../../api/appointment.api';
import useAuthStore from '../../store/auth.store';
// removed missing imports
import { formatDate, formatDateTime, getRecordStatus, validate, validators } from '../../utils/helpers';
import './MedicalRecordDetail.css';

const EMPTY_FORM = {
  appointmentId: '',
  diagnosis: '',
  chiefComplaint: '',
  clinicalFindings: '',
  treatment: '',
  followUpDate: '',
  notes: '',
  status: 'draft',
  complexityLevel: '0',
};

function buildFormErrors(form, isNew) {
  const errors = {};
  const req = validators.required;
  if (isNew && !form.appointmentId) {
    errors.appointmentId = 'Vui lòng chọn lịch hẹn khám';
  }
  if (validate(form.diagnosis, [req])) errors.diagnosis = validate(form.diagnosis, [req]);
  if (validate(form.chiefComplaint, [req])) errors.chiefComplaint = validate(form.chiefComplaint, [req]);
  return errors;
}

export default function MedicalRecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isDoctor = user?.role === 'doctor';
  const role = user?.role || 'patient';
  const isNew = id === 'new';

  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [editMode, setEditMode] = useState(isNew);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  useEffect(() => {
    if (isNew) {
      const fetchAppts = async () => {
        setLoadingAppointments(true);
        try {
          const res = await appointmentApi.getAppointments({ limit: 100 });
          const payload = res.data?.data ?? res.data ?? res;
          const list = Array.isArray(payload) ? payload : (payload.items || []);
          const filtered = list.filter(a => ['checkin', 'checked_in', 'confirmed', 'pending', 'completed'].includes(a.status));
          setAppointments(filtered);
        } catch (err) {
          console.error('Failed to fetch appointments:', err);
        } finally {
          setLoadingAppointments(false);
        }
      };
      fetchAppts();
    }
  }, [isNew]);

  const fetchRecord = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    setError(null);
    try {
      const res = await medicalApi.getRecordById(id);
      const payload = res.data?.data ?? res.data;
      setRecord(payload);
      setForm({
        diagnosis: payload.diagnosis || '',
        chiefComplaint: payload.chiefComplaint || payload.chief_complaint || '',
        clinicalFindings: payload.clinicalFindings || payload.clinical_findings || '',
        treatment: payload.treatment || payload.treatment_plan || '',
        followUpDate: payload.followUpDate || payload.follow_up_date ? (payload.followUpDate || payload.follow_up_date).slice(0, 10) : '',
        notes: payload.notes || '',
        status: payload.status || 'active',
        complexityLevel: payload.appointment?.complexity_level?.toString() || '0',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      
      // Auto-fill chief complaint when selecting an appointment
      if (name === 'appointmentId' && isNew && value) {
        const selectedAppt = appointments.find(a => String(a.id) === String(value) || String(a._id) === String(value));
        if (selectedAppt && selectedAppt.reason) {
          next.chiefComplaint = selectedAppt.reason;
        }
      }
      
      return next;
    });
    
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = buildFormErrors(form, isNew);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        const res = await medicalApi.createRecord(form);
        setSuccessMsg('Tạo bệnh án thành công!');
        const payload = res.data?.data ?? res.data ?? res;
        const newId = payload.id || payload._id;
        setTimeout(() => navigate(`/${user?.role || 'doctor'}/records/${newId}`), 1200);
      } else {
        const res = await medicalApi.updateRecord(id, form);
        const payload = res.data?.data ?? res.data ?? res;
        setRecord(payload);
        setEditMode(false);
        setSuccessMsg('Cập nhật thành công!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Thao tác thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12, color: '#6b7280' }}>
      <div style={{ width: 24, height: 24, border: '2.5px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      Đang tải bệnh án...
    </div>
  );

  const statusMeta = record ? getRecordStatus(record.status) : null;
  const selectedAppointment = appointments.find(a => a.id === form.appointmentId);
  const activePatient = isNew ? selectedAppointment?.patient : record?.patient;
  const activeDoctor = isNew ? selectedAppointment?.doctor : record?.doctor;

  const patientName = activePatient?.full_name || activePatient?.fullName || '—';
  const patientDob = activePatient?.date_of_birth || activePatient?.dob || activePatient?.dateOfBirth;
  const patientGender = activePatient?.gender;
  const patientPhone = activePatient?.phone || '—';
  const doctorName = activeDoctor?.user?.full_name || activeDoctor?.user?.fullName || activeDoctor?.fullName || '—';

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to={`/${user?.role || 'doctor'}/records`}>Hồ sơ bệnh án</Link>
        <span>›</span>
        <span>{isNew ? 'Tạo mới' : (record?.code || id.slice(-8).toUpperCase())}</span>
      </nav>

      <div className="detail-header">
        <div>
          <h1 className="page-title">
            {isNew ? 'Tạo bệnh án mới' : `Bệnh án ${record?.code || ''}`}
          </h1>
          {record && (
            <div className="detail-meta">
              <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, color: statusMeta.color, background: statusMeta.bg || '#f3f4f6' }}>
                {statusMeta.label}
              </span>
              <span className="meta-sep">•</span>
              <span>Ngày khám: {formatDate(record.visitDate)}</span>
              <span className="meta-sep">•</span>
              <span>Cập nhật: {formatDateTime(record.updatedAt)}</span>
            </div>
          )}
        </div>
        <div className="detail-actions">
          {!isNew && isDoctor && !editMode && record?.status !== 'completed' && (
            <button className="btn btn-primary" onClick={() => setEditMode(true)}>
              Chỉnh sửa
            </button>
          )}
          {!isNew && (
            <Link to={`/${role}/records/${id}/prescription`} className="btn btn-outline" style={{ display: 'inline-block' }}>
              <span className="icon">💊</span> Đơn thuốc
            </Link>
          )}
          {!isNew && (
            <Link to={`/${role}/records/${id}/services`} className="btn btn-outline" style={{ display: 'inline-block' }}>
              <span className="icon">🦷</span> Dịch vụ chỉ định
            </Link>
          )}
          {!isNew && ['patient', 'receptionist'].includes(user?.role) && (
            <Link
              to={`/${user?.role}/billing/checkout?recordId=${id}`}
              className="btn btn-outline"
            >
              Thanh toán
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#b91c1c', fontSize: '0.88rem' }}>
          <span>⚠️ {error}</span>
          {!isNew && <button style={{ border: '1px solid currentColor', borderRadius: 6, padding: '4px 12px', background: 'transparent', color: 'inherit', cursor: 'pointer' }} onClick={fetchRecord}>Thử lại</button>}
        </div>
      )}
      {successMsg && <div className="success-msg">{successMsg}</div>}

      {/* Patient info (read-only) */}
      {activePatient && (
        <div className="info-card">
          <h2 className="card-title">Thông tin bệnh nhân {isNew && "(Từ Lịch Hẹn Được Chọn)"}</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Họ tên</span>
              <span className="info-value">{patientName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Ngày sinh</span>
              <span className="info-value">{formatDate(patientDob)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Giới tính</span>
              <span className="info-value">
                {patientGender === 'male' ? 'Nam' : patientGender === 'female' ? 'Nữ' : '—'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Điện thoại</span>
              <span className="info-value">{patientPhone}</span>
            </div>
            <div className="info-item">
              <span className="info-label">BHYT</span>
              <span className="info-value">{activePatient?.insuranceCode || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Bác sĩ</span>
              <span className="info-value">{doctorName}</span>
            </div>
          </div>
        </div>
      )}

      {/* Medical form */}
      {(editMode || isNew) && isDoctor ? (
        <form className="medical-form" onSubmit={handleSubmit} noValidate>
          {isNew && (
            <div className="form-section" style={{ marginBottom: 20 }}>
              <h2 className="card-title">Chọn Lịch Hẹn</h2>
              <div className={`form-group ${formErrors.appointmentId ? 'has-error' : ''}`}>
                <label className="form-label">
                  Lịch khám của bệnh nhân <span className="required">*</span>
                </label>
                {loadingAppointments ? (
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Đang tải lịch hẹn...</div>
                ) : (
                  <select
                    name="appointmentId"
                    className="form-select"
                    value={form.appointmentId}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn lịch hẹn khám --</option>
                    {appointments.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.patient?.full_name || a.patient?.fullName} - {formatDate(a.appointment_date || a.date)} ({a.appointment_time || a.slotTime}) - {a.status}
                      </option>
                    ))}
                  </select>
                )}
                {formErrors.appointmentId && (
                  <span className="field-error">{formErrors.appointmentId}</span>
                )}
              </div>
            </div>
          )}

          <div className="form-section">
            <h2 className="card-title">Thông tin lâm sàng</h2>
            <div className="form-grid">
              <div className={`form-group ${formErrors.chiefComplaint ? 'has-error' : ''}`}>
                <label className="form-label">
                  Lý do khám <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="chiefComplaint"
                  className="form-input"
                  value={form.chiefComplaint}
                  onChange={handleChange}
                  placeholder="VD: Đau đầu, sốt, ho..."
                />
                {formErrors.chiefComplaint && (
                  <span className="field-error">{formErrors.chiefComplaint}</span>
                )}
              </div>

              <div className={`form-group ${formErrors.diagnosis ? 'has-error' : ''}`}>
                <label className="form-label">
                  Chẩn đoán <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="diagnosis"
                  className="form-input"
                  value={form.diagnosis}
                  onChange={handleChange}
                  placeholder="VD: Viêm amidan cấp, ICD-10: J03.9"
                />
                {formErrors.diagnosis && (
                  <span className="field-error">{formErrors.diagnosis}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label className="form-label">Khám lâm sàng</label>
                <textarea
                  name="clinicalFindings"
                  className="form-textarea"
                  rows={4}
                  value={form.clinicalFindings}
                  onChange={handleChange}
                  placeholder="Mô tả kết quả khám: sinh hiệu, dấu hiệu thực thể..."
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Hướng điều trị</label>
                <textarea
                  name="treatment"
                  className="form-textarea"
                  rows={3}
                  value={form.treatment}
                  onChange={handleChange}
                  placeholder="Phác đồ điều trị, chỉ định..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ngày tái khám</label>
                <input
                  type="date"
                  name="followUpDate"
                  className="form-input"
                  value={form.followUpDate}
                  onChange={handleChange}
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Trạng thái</label>
                <select
                  name="status"
                  className="form-select"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="draft">Nháp</option>
                  <option value="active">Đang điều trị</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã huỷ</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Độ khó ca bệnh</label>
                <select
                  name="complexityLevel"
                  className="form-select"
                  value={form.complexityLevel}
                  onChange={handleChange}
                >
                  <option value="0">Bình thường (+0 hệ số)</option>
                  <option value="0.1">Mức độ 1 (+0.1 hệ số)</option>
                  <option value="0.2">Mức độ 2 (+0.2 hệ số)</option>
                  <option value="0.3">Mức độ 3 (+0.3 hệ số)</option>
                  <option value="0.4">Mức độ 4 (+0.4 hệ số)</option>
                  <option value="0.5">Mức độ 5 (+0.5 hệ số)</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Ghi chú thêm</label>
                <textarea
                  name="notes"
                  className="form-textarea"
                  rows={2}
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Lưu ý đặc biệt, dị ứng thuốc..."
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            {!isNew && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setEditMode(false);
                  setFormErrors({});
                }}
                disabled={saving}
              >
                Huỷ
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : isNew ? 'Tạo bệnh án' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      ) : (
        /* Read-only view */
        record && (
          <div className="info-card">
            <h2 className="card-title">Thông tin lâm sàng</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Lý do khám</span>
                <span className="info-value">{record.chiefComplaint || record.chief_complaint || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Chẩn đoán</span>
                <span className="info-value">{record.diagnosis || '—'}</span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">Khám lâm sàng</span>
                <span className="info-value">{record.clinicalFindings || record.clinical_findings || '—'}</span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">Hướng điều trị</span>
                <span className="info-value">{record.treatment || record.treatment_plan || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tái khám</span>
                <span className="info-value">{formatDate(record.followUpDate || record.follow_up_date)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Độ khó ca bệnh</span>
                <span className="info-value">
                  {record.appointment?.complexity_level ? `+${record.appointment.complexity_level} hệ số` : 'Bình thường (+0)'}
                </span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">Ghi chú</span>
                <span className="info-value">{record.notes || '—'}</span>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
