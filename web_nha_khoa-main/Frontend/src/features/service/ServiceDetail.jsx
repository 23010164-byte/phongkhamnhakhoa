import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useServiceStore from '../../store/service.store';
import useAuthStore from '../../store/auth.store';
import {
  Spinner, Alert, BackBtn, PageHeader, Card, CardHeader, CardBody,
  AvatarPlaceholder, Btn, Icon, fmtCurrency, fmtDate,
} from '../doctor/DoctorUI';
import '../doctor/doctor.css';

/* ── Detail field ── */
function DetailField({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{children ?? '—'}</div>
    </div>
  );
}

/* ── Stat badge ── */
function StatBadge({ icon, value, label }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 4, padding: '16px 20px',
      background: 'var(--color-accent-light)', borderRadius: 'var(--radius-md)',
    }}>
      <span style={{ color: 'var(--color-accent)' }}><Icon name={icon} size={20} /></span>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-accent)' }}>{value}</span>
      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
  );
}

const CATEGORY_EMOJI = {
  'Nha khoa tổng quát': '🪥', 'Nha khoa trẻ em': '👶', 'Chỉnh nha - Niềng răng': '😁',
  'Cấy ghép Implant': '🔩', 'Nhổ răng - Tiểu phẫu': '💉',
  default: '🦷',
};

/* ── ServiceDetail ── */
export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const { selectedService: service, selectedServiceLoading: loading, selectedServiceError: error,
    fetchServiceById, clearSelectedService } = useServiceStore();

  useEffect(() => {
    fetchServiceById(id);
    return () => clearSelectedService();
  }, [id]);

  if (loading) return <Spinner label="Đang tải thông tin dịch vụ…" />;

  if (error) {
    return (
      <div>
        <BackBtn onClick={() => navigate(-1)} />
        <Alert type="error">{error}</Alert>
        <button className="btn btn-secondary" onClick={() => fetchServiceById(id)}>Thử lại</button>
      </div>
    );
  }

  if (!service) return null;

  const emoji = CATEGORY_EMOJI[service.category] ?? CATEGORY_EMOJI.default;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <BackBtn onClick={() => navigate(-1)}>Quay lại danh sách dịch vụ</BackBtn>
        {isAdmin && (
          <button className="btn btn-secondary" onClick={() => navigate(`/admin/services/${id}/edit`)}>
            <Icon name="edit" size={14} /> Chỉnh sửa
          </button>
        )}
      </div>

      <div className="service-detail-layout">
        {/* ── Left: main content ── */}
        <div>
          {/* Header card */}
          <Card style={{ marginBottom: 20, overflow: 'hidden' }}>
            <div className="service-detail-icon">
              {service.iconUrl
                ? <img src={service.iconUrl} alt="" style={{ width: 80, height: 80, objectFit: 'contain' }} />
                : <span>{emoji}</span>
              }
            </div>
            <CardBody>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-accent)', fontWeight: 600, marginBottom: 4 }}>
                {service.category ?? 'Dịch vụ y tế'}
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 12, lineHeight: 1.2 }}>
                {service.name}
              </h1>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                {service.price != null && (
                  <StatBadge icon="money" value={fmtCurrency(service.price)} label="Giá dịch vụ" />
                )}
                {service.durationMinutes != null && (
                  <StatBadge icon="clock" value={`${service.durationMinutes} phút`} label="Thời gian" />
                )}
                {service.doctorCount != null && (
                  <StatBadge icon="user" value={service.doctorCount} label="Bác sĩ" />
                )}
              </div>

              {service.description && (
                <>
                  <div style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>Mô tả dịch vụ</div>
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                    {service.description}
                  </p>
                </>
              )}
            </CardBody>
          </Card>

          {/* Procedure / preparation */}
          {(service.procedure || service.preparation || service.notes) && (
            <Card style={{ marginBottom: 20 }}>
              <CardHeader title="Thông tin chi tiết" />
              <CardBody>
                {service.procedure && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Quy trình thực hiện</div>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {service.procedure}
                    </p>
                  </div>
                )}
                {service.preparation && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Chuẩn bị trước khi thực hiện</div>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {service.preparation}
                    </p>
                  </div>
                )}
                {service.notes && (
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Lưu ý</div>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {service.notes}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* Doctors who offer this service */}
          {service.doctors?.length > 0 && (
            <Card>
              <CardHeader title={`Bác sĩ thực hiện (${service.doctors.length})`} />
              <CardBody>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {service.doctors.map((doc) => (
                    <div key={doc.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      transition: 'border-color var(--transition-fast), background var(--transition-fast)',
                    }}
                      onClick={() => navigate(`/doctors/${doc.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && navigate(`/doctors/${doc.id}`)}
                    >
                      <AvatarPlaceholder name={doc.fullName} size="sm" src={doc.avatarUrl} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{doc.fullName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-accent)' }}>{doc.specialty}</div>
                      </div>
                      <button className="btn btn-secondary btn-sm">Đặt lịch</button>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* ── Right: sidebar ── */}
        <div>
          {/* Booking card */}
          <Card style={{ marginBottom: 20 }}>
            <CardBody>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                  {service.price != null ? fmtCurrency(service.price) : 'Liên hệ'}
                </div>
                {service.durationMinutes && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2, display: 'flex', gap: 4, alignItems: 'center' }}>
                    <Icon name="clock" size={13} /> Thời gian: {service.durationMinutes} phút
                  </div>
                )}
              </div>

              <Btn style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate('/doctors', { state: { serviceId: id } })}>
                <Icon name="calendar" size={15} /> Đặt lịch ngay
              </Btn>
            </CardBody>
          </Card>

          {/* Meta */}
          <Card>
            <CardHeader title="Thông tin" />
            <CardBody>
              <DetailField label="Danh mục">{service.category}</DetailField>
              <DetailField label="Trạng thái">
                <span className={`badge badge-${service.is_active ? 'active' : 'inactive'}`}>
                  {service.is_active ? 'Đang hoạt động' : 'Tạm ngừng'}
                </span>
              </DetailField>
              {service.createdAt && (
                <DetailField label="Ngày tạo">{fmtDate(service.createdAt)}</DetailField>
              )}
              {service.updatedAt && (
                <DetailField label="Cập nhật lần cuối">{fmtDate(service.updatedAt)}</DetailField>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
