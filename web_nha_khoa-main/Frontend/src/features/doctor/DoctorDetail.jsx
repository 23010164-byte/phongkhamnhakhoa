import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useDoctorStore from '../../store/doctor.store';
import useAuthStore from '../../store/auth.store';
import {
  Spinner, Alert, AvatarPlaceholder, Stars, TabBar,
  BackBtn, Card, CardHeader, CardBody, Icon,
  fmtDate, getWeekDates, toISODate, VN_DAYS,
} from './DoctorUI';
import './doctor.css';

/* ── Week day strip ── */
function WeekStrip({ selectedDate, onSelect }) {
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const d = new Date(today);
    const diff = today.getDay() === 0 ? -6 : 1 - today.getDay();
    d.setDate(today.getDate() + diff);
    return d;
  });

  const days = getWeekDates(weekStart);
  const today = toISODate(new Date());

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    if (toISODate(d) >= today || toISODate(d) === today) setWeekStart(d);
    // don't allow going before today's week
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <button className="btn btn-secondary btn-sm" onClick={prevWeek}>
          <Icon name="chevLeft" size={14} />
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {fmtDate(days[0].toISOString())} – {fmtDate(days[6].toISOString())}
        </span>
        <button className="btn btn-secondary btn-sm" onClick={nextWeek}>
          <Icon name="chevRight" size={14} />
        </button>
      </div>
      <div className="week-strip">
        {days.map((d, i) => {
          const iso = toISODate(d);
          const isPast = iso < today;
          return (
            <button
              key={iso}
              className={`week-day-btn${selectedDate === iso ? ' active' : ''}`}
              onClick={() => !isPast && onSelect(iso)}
              disabled={isPast}
              style={isPast ? { opacity: .4, cursor: 'not-allowed' } : undefined}
            >
              <span className="week-day-name">{VN_DAYS[i]}</span>
              <span className="week-day-date">{d.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Slot grid ── */
function SlotGrid({ slots, loading, selectedSlot, onSelect }) {
  if (loading) return <Spinner label="Đang tải slot…" />;
  if (!slots.length) {
    return <div className="slot-empty">Không có slot khả dụng cho ngày này.</div>;
  }
  return (
    <div className="slot-grid">
      {slots.map((slot) => (
        <button
          key={slot.id}
          className={[
            'slot-item',
            slot.status === 'booked'  ? 'slot-booked'   : '',
            selectedSlot?.id === slot.id ? 'slot-selected' : '',
          ].filter(Boolean).join(' ')}
          onClick={() => slot.status !== 'booked' && onSelect(slot)}
          disabled={slot.status === 'booked'}
          aria-pressed={selectedSlot?.id === slot.id}
        >
          {slot.startTime}
          {slot.endTime && <div style={{ fontSize: '0.7rem', opacity: .75 }}>{slot.endTime}</div>}
        </button>
      ))}
    </div>
  );
}

/* ── Info row ── */
function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
      <span style={{ color: 'var(--color-accent)', marginTop: 2 }}><Icon name={icon} size={16} /></span>
      <div>
        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{value}</div>
      </div>
    </div>
  );
}

/* ── DoctorDetail ── */
export default function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const {
    selectedDoctor: doctor,
    selectedDoctorLoading: loading,
    selectedDoctorError: error,
    slots, slotsLoading,
    fetchDoctorById, fetchSlots, clearSelectedDoctor,
  } = useDoctorStore();

  const [activeTab, setActiveTab]     = useState('schedule');
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchDoctorById(id);
    return () => clearSelectedDoctor();
  }, [id]);

  // Fetch slots whenever date changes
  useEffect(() => {
    if (id && selectedDate) fetchSlots(id, selectedDate);
  }, [id, selectedDate]);

  const handleBook = useCallback(() => {
    if (!selectedSlot) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/doctors/${id}` } });
      return;
    }
    // Navigate to booking flow passing slot + doctor via state
    navigate('/patient/appointments/new', {
      state: { doctorId: id, slotId: selectedSlot.id, date: selectedDate },
    });
  }, [selectedSlot, isAuthenticated, id, selectedDate, navigate]);

  if (loading) return <Spinner label="Đang tải thông tin bác sĩ…" />;

  if (error) {
    return (
      <div>
        <BackBtn onClick={() => navigate(-1)} />
        <Alert type="error">{error}</Alert>
        <button className="btn btn-secondary" onClick={() => fetchDoctorById(id)}>Thử lại</button>
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div>
      <BackBtn onClick={() => navigate(-1)}>Quay lại danh sách bác sĩ</BackBtn>

      <div className="doctor-detail-layout">
        {/* ── Left panel ── */}
        <div className="doctor-info-card">
          <AvatarPlaceholder name={doctor.user?.full_name || doctor.fullName} size="lg" src={doctor.user?.avatar || doctor.avatarUrl} />
          <div className="doctor-info-name">{doctor.user?.full_name || doctor.fullName}</div>
          <div className="doctor-info-specialty">{doctor.specialty?.name || (typeof doctor.specialty === 'string' ? doctor.specialty : '')}</div>

          {doctor.rating_avg != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Stars value={Number(doctor.rating_avg)} />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {Number(doctor.rating_avg).toFixed(1)} ({doctor.rating_count ?? 0} đánh giá)
              </span>
            </div>
          )}

          {(doctor.experience_years != null || doctor.patientCount != null || doctor.rating_count != null) && (
            <div className="doctor-stats">
              {doctor.experience_years != null && (
                <div className="doctor-stat">
                  <span className="doctor-stat-value">{doctor.experience_years}</span>
                  <span className="doctor-stat-label">Năm KN</span>
                </div>
              )}
              {doctor.patientCount != null && (
                <div className="doctor-stat">
                  <span className="doctor-stat-value">{doctor.patientCount}</span>
                  <span className="doctor-stat-label">Bệnh nhân</span>
                </div>
              )}
              {doctor.rating_count != null && (
                <div className="doctor-stat">
                  <span className="doctor-stat-value">{doctor.rating_count}</span>
                  <span className="doctor-stat-label">Đánh giá</span>
                </div>
              )}
            </div>
          )}

          <hr style={{ width: '100%', border: 'none', borderTop: '1px solid var(--color-border-soft)', margin: '4px 0' }} />

          <div style={{ width: '100%', textAlign: 'left', marginTop: 12 }}>
            <InfoRow icon="info" label="Bằng cấp / Học vị" value={doctor.title || doctor.qualification} />
            <InfoRow icon="calendar" label="Phòng khám" value={doctor.room ? `Phòng ${doctor.room}` : null} />
            <InfoRow icon="user" label="Email" value={doctor.user?.email || doctor.email} />
            <InfoRow icon="creditCard" label="Phí khám" value={doctor.consultation_fee ? `${Number(doctor.consultation_fee).toLocaleString()}đ` : 'Theo dịch vụ'} />
            <InfoRow icon="calendar" label="Lịch khám" value={(doctor.working_days || []).map(d => VN_DAYS[['sunday','monday','tuesday','wednesday','thursday','friday','saturday'].indexOf(d)] || d).join(', ')} />
          </div>
        </div>

        {/* ── Right panel ── */}
        <div>
          <TabBar
            tabs={[
              { key: 'schedule', label: 'Đặt lịch khám' },
              { key: 'about',    label: 'Giới thiệu' },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />

          {/* Schedule tab */}
          {activeTab === 'schedule' && (
            <Card>
              <CardHeader title="Chọn ngày & giờ khám" />
              <CardBody>
                <WeekStrip selectedDate={selectedDate} onSelect={(d) => { setSelectedDate(d); setSelectedSlot(null); }} />

                <div style={{ marginTop: 20, marginBottom: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Chọn khung giờ
                </div>
                <SlotGrid
                  slots={slots}
                  loading={slotsLoading}
                  selectedSlot={selectedSlot}
                  onSelect={setSelectedSlot}
                />

                {selectedSlot && (
                  <div style={{
                    marginTop: 20, padding: '14px 16px',
                    background: 'var(--color-accent-light)', borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                        Đã chọn
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {selectedDate && new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                        {' – '}{selectedSlot.startTime}{selectedSlot.endTime && ` → ${selectedSlot.endTime}`}
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleBook}>
                      <Icon name="check" size={15} /> Đặt lịch
                    </button>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* About tab */}
          {activeTab === 'about' && (
            <Card>
              <CardHeader title="Giới thiệu bác sĩ" />
              <CardBody>
                {doctor.bio
                  ? <p style={{ lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>{doctor.bio}</p>
                  : <p style={{ color: 'var(--color-text-muted)' }}>Chưa có thông tin giới thiệu.</p>
                }

                {doctor.education?.length > 0 && (
                  <>
                    <div style={{ marginTop: 20, marginBottom: 10, fontWeight: 600, fontSize: '0.9rem' }}>Học vấn & Đào tạo</div>
                    <ul style={{ paddingLeft: 18, color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 2 }}>
                      {doctor.education.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </>
                )}

                {doctor.certifications?.length > 0 && (
                  <>
                    <div style={{ marginTop: 20, marginBottom: 10, fontWeight: 600, fontSize: '0.9rem' }}>Chứng chỉ chuyên môn</div>
                    <ul style={{ paddingLeft: 18, color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 2 }}>
                      {doctor.certifications.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
