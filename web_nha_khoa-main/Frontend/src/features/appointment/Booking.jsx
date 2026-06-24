import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useAppointmentStore from '../../store/appointment.store';
import useUserStore from '../../store/user.store';
import './Booking.css';

const getTodayStr = () => new Date().toISOString().split('T')[0];
const getMaxDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
};

export default function Booking() {
  const navigate = useNavigate();
  const { role, isPatient } = useAuth();
  const hasPatientStep = !isPatient;

  const { doctors, doctorsLoading, slots, slotsLoading, bookingLoading, bookingError,
    doctorRosters, rostersLoading,
    fetchDoctors, fetchSlots, fetchDoctorRosters, createAppointment, clearBookingError } = useAppointmentStore();

  const { users: patients, usersLoading: patientsLoading, fetchPatients, createPatient } = useUserStore();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    patientId: '',
    patientName: '',
    doctorId: '',
    doctorName: '',
    date: '',
    slotId: '',
    slotTime: '',
    reason: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [successId, setSuccessId] = useState(null);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');

  // Quick Create Patient states
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickForm, setQuickForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: 'Patient@123', // Default strong password
    gender: 'male',
    dob: '',
    address: ''
  });
  const [quickError, setQuickError] = useState(null);
  const [quickLoading, setQuickLoading] = useState(false);

  // Verification states
  const [showVerification, setShowVerification] = useState(false);
  const [verifyMethod, setVerifyMethod] = useState('email');
  const [verifyContact, setVerifyContact] = useState('');
  const [verifyStep, setVerifyStep] = useState(1); // 1: choose method & send, 2: enter code
  const [verifyCode, setVerifyCode] = useState('');

  const steps = hasPatientStep
    ? ['Chọn bệnh nhân', 'Chọn bác sĩ', 'Chọn ngày & giờ', 'Xác nhận']
    : ['Chọn bác sĩ', 'Chọn ngày & giờ', 'Xác nhận'];

  useEffect(() => {
    fetchDoctors();
    clearBookingError();
  }, [fetchDoctors, clearBookingError]);

  useEffect(() => {
    if (hasPatientStep) {
      fetchPatients({ page: 1, limit: 50, search: patientSearch });
    }
  }, [patientSearch, hasPatientStep, fetchPatients]);

  useEffect(() => {
    if (form.doctorId && form.date) {
      fetchSlots(form.doctorId, form.date);
    }
  }, [form.doctorId, form.date, fetchSlots]);

  useEffect(() => {
    if (form.doctorId) {
      const today = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 30);
      const fromStr = today.toISOString().split('T')[0];
      const toStr = end.toISOString().split('T')[0];
      fetchDoctorRosters(form.doctorId, fromStr, toStr);
    }
  }, [form.doctorId, fetchDoctorRosters]);

  const generateCalendarDays = useCallback(() => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const roster = doctorRosters.find((r) => r.date === dateStr);
      days.push({
        date: dateStr,
        dayOfWeek: d.getDay(),
        dayNum: d.getDate(),
        month: d.getMonth() + 1,
        hasShift: !!roster,
        shifts: roster?.shifts || [],
      });
    }
    return days;
  }, [doctorRosters]);

  const setField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const filteredDoctors = doctors.filter((d) =>
    d.fullName?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const goNext = useCallback(() => {
    let errs = {};
    if (hasPatientStep) {
      if (step === 0) {
        if (!form.patientId) errs.patientId = 'Vui lòng chọn bệnh nhân';
      } else if (step === 1) {
        if (!form.doctorId) errs.doctorId = 'Vui lòng chọn bác sĩ';
      } else if (step === 2) {
        if (!form.date) errs.date = 'Vui lòng chọn ngày';
        if (!form.slotId) errs.slotId = 'Vui lòng chọn khung giờ';
      }
    } else {
      if (step === 0) {
        if (!form.doctorId) errs.doctorId = 'Vui lòng chọn bác sĩ';
      } else if (step === 1) {
        if (!form.date) errs.date = 'Vui lòng chọn ngày';
        if (!form.slotId) errs.slotId = 'Vui lòng chọn khung giờ';
      }
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
  }, [step, form, hasPatientStep]);

  const goBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleQuickCreateSubmit = async (e) => {
    e.preventDefault();
    setQuickError(null);
    if (!quickForm.fullName?.trim()) {
      setQuickError('Họ tên không được để trống');
      return;
    }
    if (!quickForm.email?.trim()) {
      setQuickError('Email không được để trống');
      return;
    }
    if (!quickForm.password?.trim()) {
      setQuickError('Mật khẩu không được để trống');
      return;
    }

    setQuickLoading(true);
    const res = await createPatient({
      fullName: quickForm.fullName.trim(),
      email: quickForm.email.trim(),
      phone: quickForm.phone.trim() || undefined,
      password: quickForm.password,
      gender: quickForm.gender,
      dateOfBirth: quickForm.dob || undefined,
      address: quickForm.address.trim() || undefined
    });
    setQuickLoading(false);

    if (res.success) {
      // Auto-select new patient
      const newPatient = res.data;
      setField('patientId', newPatient.id || newPatient._id);
      setField('patientName', newPatient.fullName || newPatient.full_name);
      setShowQuickCreate(false);
      // Reset form
      setQuickForm({
        fullName: '',
        email: '',
        phone: '',
        password: 'Patient@123',
        gender: 'male',
        dob: '',
        address: ''
      });
    } else {
      setQuickError(res.message || 'Tạo tài khoản thất bại');
    }
  };

  const handleSubmitClick = () => {
    const errs = {};
    if (!form.reason?.trim()) errs.reason = 'Vui lòng nhập lý do khám';
    if (form.reason?.trim().length < 5) errs.reason = 'Lý do tối thiểu 5 ký tự';

    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    // Check if patient info is available to prefill verifyContact
    if (hasPatientStep) {
      const selectedPatient = patients.find(p => (p.id || p._id) === form.patientId);
      if (selectedPatient?.email) setVerifyContact(selectedPatient.email);
    } else {
      // User is patient himself
      const userStore = useUserStore.getState().user;
      if (userStore?.email) setVerifyContact(userStore.email);
    }
    
    // Instead of direct submit, show verification modal
    setVerifyStep(1);
    setShowVerification(true);
  };

  const handleSendCode = (e) => {
    e.preventDefault();
    if (!verifyContact.trim()) return alert('Vui lòng nhập thông tin liên hệ');
    setVerifyStep(2);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyCode.trim()) return alert('Vui lòng nhập mã xác nhận');

    // Simulate verification success
    setShowVerification(false);
    
    const result = await createAppointment({
      doctorId: form.doctorId,
      slotId: form.slotId,
      date: form.date,
      reason: form.reason.trim(),
      notes: form.notes?.trim() || '',
      patientId: hasPatientStep ? form.patientId : undefined,
    });
    if (result.success) {
      setSuccessId(result.data?.id || result.data?._id || 'new');
    }
  };

  if (successId) return (
    <div className="booking-success">
      <div className="success-icon">✓</div>
      <h2>Đặt lịch thành công!</h2>
      <p>Lịch hẹn với <strong>{form.doctorName}</strong> vào <strong>{form.slotTime}</strong> ngày <strong>{form.date}</strong> đã được ghi nhận.</p>
      {hasPatientStep && <p style={{ marginTop: 8 }}>Đặt cho bệnh nhân: <strong>{form.patientName}</strong></p>}
      <p className="success-note">Chúng tôi sẽ xác nhận lịch hẹn trong thời gian sớm nhất.</p>
      <div className="success-actions">
        <button className="btn-primary" onClick={() => navigate(`/${role}/appointments`)}>Xem lịch hẹn</button>
        <button className="btn-ghost" onClick={() => {
          setStep(0);
          setForm({ patientId: '', patientName: '', doctorId: '', doctorName: '', date: '', slotId: '', slotTime: '', reason: '', notes: '' });
          setSuccessId(null);
        }}>Đặt lịch khác</button>
      </div>
    </div>
  );

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h1>Đặt lịch khám {hasPatientStep && '(Lễ tân)'}</h1>
        <div className="stepper">
          {steps.map((label, i) => (
            <div key={i} className={`step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <div className="step-dot">{i < step ? '✓' : i + 1}</div>
              <span className="step-label">{label}</span>
              {i < steps.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>
      </div>

      <div className="booking-body">
        {/* STEP 0 FOR RECEPTIONIST: SELECT PATIENT */}
        {hasPatientStep && step === 0 && (
          <div className="step-panel">
            <div className="patient-step-header">
              <h2>Chọn bệnh nhân</h2>
              <button className="btn-quick-create" onClick={() => setShowQuickCreate(true)}>
                + Tạo nhanh bệnh nhân
              </button>
            </div>
            <input
              className="search-input"
              placeholder="Tìm bệnh nhân theo tên, số điện thoại hoặc email..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
            />
            {errors.patientId && <p className="field-error">{errors.patientId}</p>}
            {patientsLoading ? <div className="loading-spinner" /> : (
              <div className="patient-grid">
                {patients.length === 0 && <p className="empty-text">Không tìm thấy bệnh nhân nào</p>}
                {patients.map((p) => {
                  const pId = p.id || p._id;
                  const pName = p.fullName || p.full_name || 'Không có tên';
                  return (
                    <div
                      key={pId}
                      className={`patient-card ${form.patientId === pId ? 'selected' : ''}`}
                      onClick={() => {
                        setField('patientId', pId);
                        setField('patientName', pName);
                      }}
                    >
                      <div className="patient-card-name">{pName}</div>
                      <div className="patient-card-detail">SĐT: {p.phone || '—'}</div>
                      <div className="patient-card-detail">Email: {p.email || '—'}</div>
                      {form.patientId === pId && <div className="check-mark">✓</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SELECT DOCTOR STEP */}
        {((hasPatientStep && step === 1) || (!hasPatientStep && step === 0)) && (
          <div className="step-panel">
            <h2>Chọn bác sĩ</h2>
            <input
              className="search-input"
              placeholder="Tìm theo tên hoặc chuyên khoa..."
              value={doctorSearch}
              onChange={(e) => setDoctorSearch(e.target.value)}
            />
            {errors.doctorId && <p className="field-error">{errors.doctorId}</p>}
            {doctorsLoading ? <div className="loading-spinner" /> : (
              <div className="doctor-grid">
                {filteredDoctors.length === 0 && <p className="empty-text">Không tìm thấy bác sĩ</p>}
                {filteredDoctors.map((doc) => {
                  const docId = doc.id || doc._id;
                  return (
                    <div
                      key={docId}
                      className={`doctor-card ${form.doctorId === docId ? 'selected' : ''}`}
                      onClick={() => {
                        setField('doctorId', docId);
                        setField('doctorName', doc.fullName);
                      }}
                    >
                      <div className="doctor-avatar">{doc.fullName?.[0] || 'D'}</div>
                      <div className="doctor-info">
                        <h3>{doc.fullName}</h3>
                        <p className="doctor-spec">{doc.specialization}</p>
                        {doc.experience && <p className="doctor-exp">{doc.experience} năm kinh nghiệm</p>}
                      </div>
                      {form.doctorId === docId && <div className="check-mark">✓</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SELECT DATE AND TIME STEP */}
        {((hasPatientStep && step === 2) || (!hasPatientStep && step === 1)) && (
          <div className="step-panel">
            <h2>Chọn ngày & giờ khám</h2>

            {form.doctorId && (
              <div className="roster-calendar-section">
                <h3 className="roster-title">📅 Lịch làm việc của bác sĩ (30 ngày tới)</h3>
                <p className="roster-hint">Chọn ngày có ca (màu xanh) để xem khung giờ trống</p>
                
                {rostersLoading ? (
                  <div className="loading-spinner" />
                ) : (
                  <>
                    <div className="roster-weekday-header">
                      {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                        <div key={d} className="roster-weekday">{d}</div>
                      ))}
                    </div>
                    <div className="roster-grid">
                      {/* Empty cells for first week alignment */}
                      {Array.from({ length: generateCalendarDays()[0]?.dayOfWeek || 0 }).map((_, i) => (
                        <div key={`empty-${i}`} className="roster-day empty" />
                      ))}
                      
                      {generateCalendarDays().map(day => (
                        <button
                          key={day.date}
                          type="button"
                          className={`roster-day ${day.hasShift ? 'has-shift' : 'no-shift'} ${form.date === day.date ? 'selected' : ''}`}
                          disabled={!day.hasShift}
                          onClick={() => {
                            if (day.hasShift) {
                              setField('date', day.date);
                              setField('slotId', '');
                              setField('slotTime', '');
                            }
                          }}
                          title={day.hasShift ? day.shifts.map(s => `${s.name}: ${s.startTime}-${s.endTime}`).join(', ') : 'Bác sĩ không có lịch trực'}
                        >
                          <span className="roster-day-num">{day.dayNum}</span>
                          {(day.dayNum === 1 || generateCalendarDays().indexOf(day) === 0) && (
                            <span className="roster-day-month">T{day.month}</span>
                          )}
                          {day.hasShift && <span className="roster-day-dot" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="field-group">
              <label>Ngày khám</label>
              <input
                type="date"
                className={`field-input ${errors.date ? 'error' : ''}`}
                min={getTodayStr()}
                max={getMaxDateStr()}
                value={form.date}
                onChange={(e) => { setField('date', e.target.value); setField('slotId', ''); setField('slotTime', ''); }}
              />
              {errors.date && <p className="field-error">{errors.date}</p>}
            </div>
            <div className="field-group">
              <label>Khung giờ {form.date && `(${form.date})`}</label>
              {!form.date && <p className="hint-text">Vui lòng chọn ngày trước</p>}
              {form.date && slotsLoading && <div className="loading-spinner" />}
              {form.date && !slotsLoading && (
                <>
                  {errors.slotId && <p className="field-error">{errors.slotId}</p>}
                  <div className="slots-grid">
                    {slots.length === 0 && <p className="empty-text">Không có khung giờ trống trong ngày này</p>}
                    {slots.map((slot) => {
                      const slotKey = slot.id || slot._id || slot.time;
                      return (
                        <button
                          key={slotKey}
                          disabled={!slot.available}
                          className={`slot-btn ${!slot.available ? 'unavailable' : ''} ${form.slotId === slotKey ? 'selected' : ''}`}
                          onClick={() => { setField('slotId', slotKey); setField('slotTime', slot.time); }}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* CONFIRMATION STEP */}
        {((hasPatientStep && step === 3) || (!hasPatientStep && step === 2)) && (
          <div className="step-panel">
            <h2>Xác nhận thông tin</h2>
            <div className="confirm-card">
              {hasPatientStep && (
                <div className="confirm-row"><span>Bệnh nhân</span><strong>{form.patientName}</strong></div>
              )}
              <div className="confirm-row"><span>Bác sĩ</span><strong>{form.doctorName}</strong></div>
              <div className="confirm-row"><span>Ngày</span><strong>{form.date}</strong></div>
              <div className="confirm-row"><span>Giờ</span><strong>{form.slotTime}</strong></div>
            </div>
            <div className="field-group">
              <label>Lý do khám <span className="required">*</span></label>
              <textarea
                className={`field-textarea ${errors.reason ? 'error' : ''}`}
                placeholder="Mô tả triệu chứng hoặc lý do khám..."
                rows={4}
                value={form.reason}
                onChange={(e) => setField('reason', e.target.value)}
              />
              {errors.reason && <p className="field-error">{errors.reason}</p>}
            </div>
            <div className="field-group">
              <label>Ghi chú thêm (tùy chọn)</label>
              <textarea
                className="field-textarea"
                placeholder="Thông tin bổ sung cho bác sĩ..."
                rows={2}
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
              />
            </div>
            {bookingError && <div className="api-error">{bookingError}</div>}
          </div>
        )}
      </div>

      <div className="booking-footer">
        {step > 0 && <button className="btn-secondary" onClick={goBack} disabled={bookingLoading}>Quay lại</button>}
        <div className="footer-right">
          {step < steps.length - 1
            ? <button className="btn-primary" onClick={goNext}>Tiếp theo</button>
            : <button className="btn-primary" onClick={handleSubmitClick} disabled={bookingLoading}>
                {bookingLoading ? 'Đang đặt lịch...' : 'Xác nhận đặt lịch'}
              </button>
          }
        </div>
      </div>

      {/* QUICK CREATE PATIENT MODAL */}
      {showQuickCreate && (
        <div className="quick-modal-overlay">
          <div className="quick-modal">
            <div className="quick-modal-header">
              <h3>Tạo nhanh tài khoản bệnh nhân</h3>
              <button className="btn-close-modal" onClick={() => setShowQuickCreate(false)}>×</button>
            </div>
            <form onSubmit={handleQuickCreateSubmit}>
              {quickError && <div className="api-error" style={{ marginBottom: 16 }}>{quickError}</div>}
              <div className="quick-form-grid">
                <div className="field-group">
                  <label>Họ tên <span className="required">*</span></label>
                  <input
                    type="text"
                    required
                    className="field-input"
                    placeholder="Nguyễn Văn A"
                    value={quickForm.fullName}
                    onChange={(e) => setQuickForm({ ...quickForm, fullName: e.target.value })}
                  />
                </div>
                <div className="field-group">
                  <label>Email <span className="required">*</span></label>
                  <input
                    type="email"
                    required
                    className="field-input"
                    placeholder="email@example.com"
                    value={quickForm.email}
                    onChange={(e) => setQuickForm({ ...quickForm, email: e.target.value })}
                  />
                </div>
                <div className="field-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    className="field-input"
                    placeholder="0912345678"
                    value={quickForm.phone}
                    onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                  />
                </div>
                <div className="field-group">
                  <label>Giới tính</label>
                  <select
                    className="field-input"
                    value={quickForm.gender}
                    onChange={(e) => setQuickForm({ ...quickForm, gender: e.target.value })}
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div className="field-group">
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    className="field-input"
                    value={quickForm.dob}
                    onChange={(e) => setQuickForm({ ...quickForm, dob: e.target.value })}
                  />
                </div>
                <div className="field-group">
                  <label>Mật khẩu <span className="required">*</span></label>
                  <input
                    type="text"
                    required
                    className="field-input"
                    placeholder="Patient@123"
                    value={quickForm.password}
                    onChange={(e) => setQuickForm({ ...quickForm, password: e.target.value })}
                  />
                  <p className="hint-text" style={{ marginTop: 4 }}>Mặc định: Patient@123</p>
                </div>
              </div>
              <div className="field-group" style={{ marginTop: 12 }}>
                <label>Địa chỉ</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="Địa chỉ liên hệ..."
                  value={quickForm.address}
                  onChange={(e) => setQuickForm({ ...quickForm, address: e.target.value })}
                />
              </div>
              <div className="quick-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowQuickCreate(false)} disabled={quickLoading}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={quickLoading}>
                  {quickLoading ? 'Đang tạo...' : 'Tạo & Chọn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERIFICATION MODAL */}
      {showVerification && (
        <div className="quick-modal-overlay">
          <div className="quick-modal" style={{ maxWidth: '400px' }}>
            <div className="quick-modal-header">
              <h3>Xác minh lịch hẹn</h3>
              <button className="btn-close-modal" onClick={() => setShowVerification(false)}>×</button>
            </div>
            
            {verifyStep === 1 ? (
              <form onSubmit={handleSendCode}>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '12px' }}>
                    Để hoàn tất đặt lịch, vui lòng xác nhận thông tin liên hệ. Hệ thống sẽ gửi mã OTP qua phương thức bạn chọn.
                  </p>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>Hình thức xác nhận</label>
                  <select 
                    className="field-input" 
                    value={verifyMethod} 
                    onChange={e => {
                      setVerifyMethod(e.target.value);
                      setVerifyContact('');
                    }}
                  >
                    <option value="email">Qua Email</option>
                    <option value="sms">Qua SMS</option>
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>
                    {verifyMethod === 'email' ? 'Nhập Email của bạn' : 'Nhập số điện thoại'}
                  </label>
                  <input 
                    type={verifyMethod === 'email' ? 'email' : 'tel'} 
                    required 
                    className="field-input" 
                    placeholder={verifyMethod === 'email' ? 'email@example.com' : '0912345678'}
                    value={verifyContact}
                    onChange={e => setVerifyContact(e.target.value)}
                  />
                </div>
                <div className="quick-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowVerification(false)}>Hủy</button>
                  <button type="submit" className="btn-primary">Gửi mã xác nhận</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifySubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '12px' }}>
                    Mã xác nhận đã được gửi đến <strong>{verifyContact}</strong>.
                  </p>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>Mã xác nhận OTP</label>
                  <input 
                    type="text" 
                    required 
                    className="field-input" 
                    placeholder="Nhập mã 6 số..."
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value)}
                    style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px' }}
                  />
                  <p className="hint-text" style={{ marginTop: 8, color: '#10b981', textAlign: 'center' }}>
                    (Mô phỏng: Vui lòng nhập mã bất kỳ để thành công)
                  </p>
                </div>
                <div className="quick-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setVerifyStep(1)}>Quay lại</button>
                  <button type="submit" className="btn-primary" disabled={bookingLoading}>
                    {bookingLoading ? 'Đang xử lý...' : 'Xác nhận & Hoàn tất'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
