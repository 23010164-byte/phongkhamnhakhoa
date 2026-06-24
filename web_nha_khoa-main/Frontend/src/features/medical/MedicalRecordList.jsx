import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import useAuthStore from '../../store/auth.store';
import './MedicalRecordList.css';

const LIMIT = 10;

const STATUS_META = {
  draft:     { label: 'Nháp',          color: '#6b7280', bg: '#f3f4f6' },
  active:    { label: 'Đang điều trị', color: '#3b82f6', bg: '#dbeafe' },
  completed: { label: 'Hoàn thành',    color: '#10b981', bg: '#d1fae5' },
  cancelled: { label: 'Đã huỷ',       color: '#ef4444', bg: '#fee2e2' },
};

const formatDate = (str) => {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function MedicalRecordList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isDoctor = user?.role === 'doctor';
  const role = user?.role;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const totalPages = Math.ceil(total / LIMIT);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await axiosClient.get('/medical-records', { params });
      const payload = res.data;
      const items = payload?.data?.items ?? payload?.data ?? payload?.records ?? [];
      const totalCount = payload?.data?.total ?? payload?.total ?? (Array.isArray(items) ? items.length : 0);
      setRecords(Array.isArray(items) ? items : []);
      setTotal(totalCount);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Không thể tải hồ sơ bệnh án');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Hồ sơ bệnh án</h1>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '4px 0 0' }}>
            {total > 0 ? `${total} bệnh án` : 'Chưa có bệnh án nào'}
          </p>
        </div>
        {isDoctor && (
          <button
            style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
            onClick={() => navigate(`/${role}/records/new`)}
          >
            + Tạo bệnh án
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <form style={{ display: 'flex', gap: 8, flex: 1 }} onSubmit={handleSearch}>
          <input
            type="text"
            style={{ flex: 1, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.88rem' }}
            placeholder="Tìm theo tên bệnh nhân, mã hồ sơ..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>
            Tìm
          </button>
          {search && (
            <button
              type="button"
              style={{ padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280' }}
              onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
            >
              Xoá lọc
            </button>
          )}
        </form>
        <select
          style={{ padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' }}
          value={statusFilter}
          onChange={handleStatusChange}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="draft">Nháp</option>
          <option value="active">Đang điều trị</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã huỷ</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#b91c1c', fontSize: '0.88rem' }}>
          <span>⚠️ {error}</span>
          <button style={{ border: '1px solid currentColor', borderRadius: 6, padding: '4px 12px', background: 'transparent', color: 'inherit', cursor: 'pointer' }} onClick={fetchRecords}>Thử lại</button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12, color: '#6b7280' }}>
          <div style={{ width: 24, height: 24, border: '2.5px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          Đang tải bệnh án...
        </div>
      ) : records.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🗂</div>
          <p>Không có bệnh án nào</p>
        </div>
      ) : (
        <>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={thStyle}>Mã hồ sơ</th>
                  <th style={thStyle}>Bệnh nhân</th>
                  <th style={thStyle}>Bác sĩ</th>
                  <th style={thStyle}>Ngày khám</th>
                  <th style={thStyle}>Chẩn đoán</th>
                  <th style={thStyle}>Trạng thái</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const statusMeta = STATUS_META[r.status] || { label: r.status || '—', color: '#6b7280', bg: '#f3f4f6' };
                  const patientName = r.patient?.full_name || r.patient?.fullName || '—';
                  const doctorName = r.doctor?.user?.full_name || r.doctor?.fullName || '—';
                  const code = r.code || r.id?.toString()?.slice(-8)?.toUpperCase() || '—';
                  return (
                    <tr key={r.id || r._id} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fafbfc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = ''}
                      onClick={() => navigate(`/${role}/records/${r.id || r._id}`)}
                    >
                      <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>{code}</span></td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 500 }}>{patientName}</div>
                        {r.patient?.phone && <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{r.patient.phone}</div>}
                      </td>
                      <td style={tdStyle}>{doctorName}</td>
                      <td style={tdStyle}>{formatDate(r.appointment?.appointment_date || r.visit_date || r.visitDate || r.created_at)}</td>
                      <td style={{ ...tdStyle, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.diagnosis || <span style={{ color: '#d1d5db' }}>Chưa có</span>}
                      </td>
                      <td style={tdStyle}>
                        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, color: statusMeta.color, background: statusMeta.bg }}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button
                          style={{ padding: '4px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', fontSize: '0.8rem', cursor: 'pointer', color: '#374151' }}
                          onClick={(e) => { e.stopPropagation(); navigate(`/${role}/records/${r.id || r._id}`); }}
                        >
                          Xem
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 0' }}>
              <button style={pageBtnStyle} disabled={page <= 1} onClick={() => setPage(page - 1)}>← Trước</button>
              <span style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: '32px' }}>Trang {page} / {totalPages}</span>
              <button style={pageBtnStyle} disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sau →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' };
const tdStyle = { padding: '12px 16px', fontSize: '0.88rem', color: '#111827' };
const pageBtnStyle = { padding: '6px 16px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', fontSize: '0.82rem', cursor: 'pointer', color: '#374151' };
