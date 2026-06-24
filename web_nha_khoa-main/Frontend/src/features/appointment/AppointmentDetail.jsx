import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAppointmentStore from '../../store/appointment.store';
import useAuth from '../../hooks/useAuth';
import './AppointmentDetail.css';

const STATUS_CONFIG = {
  pending:   { label: 'Chờ xác nhận', color: '#f59e0b', bg: '#fef3c7' },
  confirmed: { label: 'Đã xác nhận',  color: '#3b82f6', bg: '#dbeafe' },
  checkin:   { label: 'Đã check-in',  color: '#8b5cf6', bg: '#ede9fe' },
  completed: { label: 'Hoàn thành',   color: '#10b981', bg: '#d1fae5' },
  cancelled: { label: 'Đã hủy',       color: '#ef4444', bg: '#fee2e2' },
};

const formatDateTime = (str) =>
  str ? new Date(str).toLocaleString('vi-VN') : '—';

const InfoRow = ({ label, value }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className="info-value">{value || '—'}</span>
  </div>
);

function CancelModal({ onConfirm, onClose, loading }) {
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const submit = () => {
    if (!reason.trim()) { setErr('Vui lòng nhập lý do hủy'); return; }
    onConfirm(reason.trim());
  };
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Hủy lịch hẹn</h3>
        <p>Vui lòng nhập lý do hủy lịch hẹn này.</p>
        <textarea
          rows={3}
          className={`field-textarea ${err ? 'error' : ''}`}
          placeholder="Lý do hủy..."
          value={reason}
          onChange={(e) => { setReason(e.target.value); setErr(''); }}
        />
        {err && <p className="field-error">{err}</p>}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Đóng</button>
          <button className="btn-danger" onClick={submit} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Xác nhận hủy'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CompleteModal({ onConfirm, onClose, loading }) {
  const [notes, setNotes] = useState('');
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Hoàn thành khám</h3>
        <textarea
          rows={4}
          className="field-textarea"
          placeholder="Ghi chú kết quả khám (tùy chọn)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Đóng</button>
          <button className="btn-primary" onClick={() => onConfirm(notes)} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Xác nhận hoàn thành'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, isDoctor, isPatient, isReceptionist, isAdmin } = useAuth();
  const { currentAppointment: appt, detailLoading, detailError,
    fetchAppointmentById, performAction, clearDetail } = useAppointmentStore();

  const [modal, setModal] = useState(null); // 'cancel' | 'complete'
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchAppointmentById(id);
    return () => clearDetail();
  }, [id]);

  const doAction = async (action, extra = {}) => {
    setActionError('');
    setActionSuccess('');
    const result = await performAction(action, id, extra);
    if (result.success) {
      setActionSuccess({ confirm: 'Đã xác nhận lịch hẹn', cancel: 'Đã hủy lịch hẹn', checkin: 'Check-in thành công', complete: 'Khám hoàn tất' }[action] || 'Thành công');
      setModal(null);
    } else {
      setActionError(result.error || 'Thao tác thất bại');
    }
  };

  // Determine which actions are available based on role + status
  const getAvailableActions = () => {
    if (!appt) return [];
    const { status } = appt;
    const actions = [];

    if (status === 'pending' && (isReceptionist || isAdmin))
      actions.push({ key: 'confirm', label: 'Xác nhận', variant: 'primary' });

    if (status === 'confirmed' && (isReceptionist || isAdmin))
      actions.push({ key: 'checkin', label: 'Check-in', variant: 'checkin' });

    if (status === 'checkin' && isDoctor)
      actions.push({ key: 'complete', label: 'Hoàn thành khám', variant: 'success' });

    if (['pending', 'confirmed'].includes(status) && (isPatient || isDoctor || isReceptionist || isAdmin))
      actions.push({ key: 'cancel', label: 'Hủy lịch', variant: 'danger' });

    return actions;
  };

  if (detailLoading && !appt) return <div className="detail-loading"><div className="loading-spinner" /></div>;

  if (detailError) return (
    <div className="detail-error">
      <p>{detailError}</p>
      <button className="btn-secondary" onClick={() => navigate(-1)}>Quay lại</button>
    </div>
  );

  if (!appt) return null;

  const statusMeta = STATUS_CONFIG[appt.status] || { label: appt.status, color: '#6b7280', bg: '#f3f4f6' };
  const actions = getAvailableActions();

  return (
    <div className="detail-container">
      <div className="detail-topbar">
        <button className="btn-back" onClick={() => navigate(-1)}>← Quay lại</button>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {appt.payment_status !== 'paid' && ['patient', 'receptionist'].includes(role) && (
            <Link 
              to={`/${role === 'patient' ? 'patient' : 'receptionist'}/billing/checkout?appointmentId=${id}`}
              className="btn-primary"
              style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              Thanh toán phí khám
            </Link>
          )}
          <span className="status-pill" style={{ color: statusMeta.color, background: statusMeta.bg }}>
            {statusMeta.label}
          </span>
        </div>
      </div>

      <h1 className="detail-title">Chi tiết lịch hẹn</h1>
      <p className="detail-id">#{appt.id || appt._id}</p>

      {actionSuccess && <div className="action-success">{actionSuccess}</div>}
      {actionError && <div className="action-error">{actionError}</div>}

      <div className="detail-grid">
        <section className="detail-section">
          <h2>Thông tin cuộc hẹn</h2>
          <InfoRow label="Bác sĩ" value={appt.doctor?.user?.full_name || appt.doctor?.fullName} />
          <InfoRow label="Chuyên khoa" value={appt.doctor?.specialty?.name || appt.doctor?.specialization} />
          <InfoRow label="Ngày khám" value={formatDateTime(appt.appointment_date || appt.date)} />
          <InfoRow label="Giờ khám" value={appt.appointment_time || appt.slotTime} />
          <InfoRow label="Lý do" value={appt.reason} />
          {appt.notes && <InfoRow label="Ghi chú" value={appt.notes} />}
        </section>

        {!isDoctor && (
          <section className="detail-section">
            <h2>Thông tin bệnh nhân</h2>
            <InfoRow label="Họ tên" value={appt.patient?.full_name || appt.patient?.fullName} />
            <InfoRow label="Ngày sinh" value={appt.patient?.date_of_birth ? new Date(appt.patient.date_of_birth).toLocaleDateString('vi-VN') : appt.patient?.dob} />
            <InfoRow label="Điện thoại" value={appt.patient?.phone} />
            <InfoRow label="Email" value={appt.patient?.email} />
          </section>
        )}

        {(appt.completedAt || appt.cancelledAt || appt.checkinAt) && (
          <section className="detail-section">
            <h2>Lịch sử</h2>
            {appt.confirmedAt && <InfoRow label="Xác nhận lúc" value={formatDateTime(appt.confirmedAt)} />}
            {appt.checkinAt && <InfoRow label="Check-in lúc" value={formatDateTime(appt.checkinAt)} />}
            {appt.completedAt && <InfoRow label="Hoàn thành lúc" value={formatDateTime(appt.completedAt)} />}
            {appt.cancelledAt && <InfoRow label="Hủy lúc" value={formatDateTime(appt.cancelledAt)} />}
            {appt.cancelReason && <InfoRow label="Lý do hủy" value={appt.cancelReason} />}
          </section>
        )}

        {appt.completionNotes && (
          <section className="detail-section full-width">
            <h2>Kết quả khám</h2>
            <p className="completion-notes">{appt.completionNotes}</p>
          </section>
        )}
      </div>

      {actions.length > 0 && (
        <div className="detail-actions">
          {detailLoading && <div className="loading-spinner small" />}
          {actions.map((a) => (
            <button
              key={a.key}
              className={`btn-action btn-${a.variant}`}
              disabled={detailLoading}
              onClick={() => {
                if (a.key === 'cancel') { setModal('cancel'); return; }
                if (a.key === 'complete') { setModal('complete'); return; }
                doAction(a.key);
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      {modal === 'cancel' && (
        <CancelModal
          loading={detailLoading}
          onClose={() => setModal(null)}
          onConfirm={(reason) => doAction('cancel', { reason })}
        />
      )}
      {modal === 'complete' && (
        <CompleteModal
          loading={detailLoading}
          onClose={() => setModal(null)}
          onConfirm={(notes) => doAction('complete', { notes })}
        />
      )}
    </div>
  );
}
