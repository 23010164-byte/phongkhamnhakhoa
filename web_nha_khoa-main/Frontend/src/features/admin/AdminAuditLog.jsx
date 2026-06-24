import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../api/axiosClient';
import './AdminPages.css';

/* ── Helpers ── */
const fmtDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const STATUS_MAP = {
  pending:     { label: 'Chờ xác nhận', color: '#f59e0b', bg: '#fef3c7' },
  confirmed:   { label: 'Đã xác nhận', color: '#3b82f6', bg: '#dbeafe' },
  checked_in:  { label: 'Đã check-in', color: '#8b5cf6', bg: '#ede9fe' },
  in_progress: { label: 'Đang khám',   color: '#06b6d4', bg: '#cffafe' },
  completed:   { label: 'Hoàn thành',   color: '#10b981', bg: '#d1fae5' },
  cancelled:   { label: 'Đã hủy',       color: '#ef4444', bg: '#fee2e2' },
  no_show:     { label: 'Vắng mặt',     color: '#6b7280', bg: '#f3f4f6' },
};

const ACTION_MAP = {
  pending:     { icon: '📋', action: 'Đặt lịch hẹn' },
  confirmed:   { icon: '✅', action: 'Xác nhận lịch hẹn' },
  checked_in:  { icon: '🏥', action: 'Check-in bệnh nhân' },
  in_progress: { icon: '🩺', action: 'Bắt đầu khám' },
  completed:   { icon: '✔️', action: 'Hoàn thành khám' },
  cancelled:   { icon: '❌', action: 'Hủy lịch hẹn' },
  no_show:     { icon: '👻', action: 'Đánh dấu vắng mặt' },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span
      className="audit-badge"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      {s.label}
    </span>
  );
}

/* ── Main Component ── */
export default function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const limit = 15;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (searchText.trim()) params.search = searchText.trim();

      const res = await axiosClient.get('/appointments', { params });
      const payload = res.data;
      const items = payload.data?.items ?? payload.data?.data ?? payload.data ?? [];
      const totalCount = payload.data?.total ?? payload.total ?? items.length;

      // Transform appointments into audit log entries
      const entries = (Array.isArray(items) ? items : []).map((apt) => {
        const patientName = apt.patient?.full_name || apt.patient_name || '—';
        const doctorName = apt.doctor?.user?.full_name || apt.doctor_name || '—';
        const actionInfo = ACTION_MAP[apt.status] || { icon: '📝', action: apt.status };
        const bookingCode = apt.booking_code || apt.id?.slice(0, 8);

        return {
          id: apt.id,
          timestamp: apt.updated_at || apt.created_at,
          icon: actionInfo.icon,
          action: actionInfo.action,
          description: `Lịch hẹn #${bookingCode} — ${patientName} khám với BS. ${doctorName}`,
          status: apt.status,
          user: patientName,
          appointmentDate: apt.appointment_date,
          appointmentTime: apt.appointment_time,
        };
      });

      setLogs(entries);
      setTotal(totalCount);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải nhật ký hệ thống.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchText]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchText]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">
            <span className="admin-page__title-icon">🛡️</span>
            Nhật ký hệ thống
          </h1>
          <p className="admin-page__subtitle">
            Theo dõi toàn bộ hoạt động trong hệ thống phòng khám
          </p>
        </div>
        <div className="admin-page__header-stats">
          <div className="header-stat">
            <span className="header-stat__value">{total}</span>
            <span className="header-stat__label">Tổng bản ghi</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-page__filters">
        <div className="filter-group">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm theo mã hoặc tên..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_MAP).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <button className="btn-refresh" onClick={fetchLogs} disabled={loading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Làm mới
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="admin-alert admin-alert--error">
          <span>⚠️ {error}</span>
          <button onClick={fetchLogs}>Thử lại</button>
        </div>
      )}

      {/* Timeline / Table */}
      <div className="audit-card">
        {loading && logs.length === 0 ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
            <span>Đang tải nhật ký...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="admin-empty">
            <span className="admin-empty__icon">📋</span>
            <p>Không có bản ghi nào.</p>
          </div>
        ) : (
          <>
            {loading && <div className="audit-loading-bar" />}
            <div className="audit-timeline">
              {logs.map((log, idx) => (
                <div key={log.id || idx} className="audit-entry">
                  <div className="audit-entry__icon">{log.icon}</div>
                  <div className="audit-entry__content">
                    <div className="audit-entry__header">
                      <span className="audit-entry__action">{log.action}</span>
                      <StatusBadge status={log.status} />
                    </div>
                    <p className="audit-entry__desc">{log.description}</p>
                    <div className="audit-entry__meta">
                      <span className="audit-entry__time">
                        🕐 {fmtDateTime(log.timestamp)}
                      </span>
                      {log.appointmentDate && (
                        <span className="audit-entry__date">
                          📅 {new Date(log.appointmentDate).toLocaleDateString('vi-VN')}
                          {log.appointmentTime ? ` lúc ${log.appointmentTime}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination">
            <button
              className="page-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Trước
            </button>
            <span className="page-info">
              Trang {page} / {totalPages}
            </span>
            <button
              className="page-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
