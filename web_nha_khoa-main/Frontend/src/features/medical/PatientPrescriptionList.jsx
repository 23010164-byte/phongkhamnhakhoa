import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import useAuthStore from '../../store/auth.store';

const LIMIT = 10;

const formatDate = (str) => {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function PatientPrescriptionList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / LIMIT);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: LIMIT };
      const res = await axiosClient.get('/medical-records', { params });
      const payload = res.data;
      let items = payload?.data?.items ?? payload?.data ?? payload?.records ?? [];
      if (!Array.isArray(items)) items = [];
      
      setRecords(items);
      setTotal(payload?.data?.total ?? payload?.total ?? items.length);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Không thể tải đơn thuốc');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>
            Đơn thuốc của tôi
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '4px 0 0' }}>
            {total > 0 ? `${total} bệnh án` : 'Chưa có dữ liệu'}
          </p>
        </div>
      </div>

      {error && (
        <div style={errorStyle}>
          <span>{error}</span>
          <button style={retryStyle} onClick={fetchRecords}>Thử lại</button>
        </div>
      )}

      {loading ? (
        <div style={loadingStyle}>
          <div style={{ width: 24, height: 24, border: '2.5px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          Đang tải đơn thuốc...
        </div>
      ) : records.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>💊</div>
          <p>Không có đơn thuốc nào</p>
        </div>
      ) : (
        <>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={thStyle}>Mã hồ sơ</th>
                  <th style={thStyle}>Ngày khám</th>
                  <th style={thStyle}>Bác sĩ</th>
                  <th style={thStyle}>Đơn thuốc</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const doctorName = r.doctor?.user?.full_name || r.doctor?.fullName || '—';
                  const code = r.code || r.id?.toString()?.slice(-8)?.toUpperCase() || '—';
                  const prescriptionCount = (r.prescriptions || []).length;
                  const hasPrescription = prescriptionCount > 0;
                  
                  return (
                    <tr key={r.id || r._id} style={{ borderBottom: '1px solid #f3f4f6', cursor: hasPrescription ? 'pointer' : 'default', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => hasPrescription && (e.currentTarget.style.background = '#fafbfc')}
                      onMouseLeave={(e) => e.currentTarget.style.background = ''}
                      onClick={() => {
                        if (hasPrescription) {
                          navigate(`/${role}/records/${r.id || r._id}/prescription`);
                        }
                      }}
                    >
                      <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>{code}</span></td>
                      <td style={tdStyle}>{formatDate(r.appointment?.appointment_date || r.visit_date || r.visitDate || r.created_at)}</td>
                      <td style={tdStyle}>{doctorName}</td>
                      <td style={tdStyle}>
                        {hasPrescription ? (
                          <span style={{ fontWeight: 500, color: '#059669' }}>
                            {prescriptionCount} loại thuốc
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>Không kê đơn</span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        {hasPrescription && (
                          <button
                            style={{ padding: '4px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', fontSize: '0.8rem', cursor: 'pointer', color: '#374151' }}
                            onClick={(e) => { e.stopPropagation(); navigate(`/${role}/records/${r.id || r._id}/prescription`); }}
                          >
                            Xem đơn thuốc
                          </button>
                        )}
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

const filterStyle = { padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' };
const errorStyle = { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#b91c1c', fontSize: '0.88rem' };
const retryStyle = { border: '1px solid currentColor', borderRadius: 6, padding: '4px 12px', background: 'transparent', color: 'inherit', cursor: 'pointer' };
const loadingStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12, color: '#6b7280' };
const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' };
const tdStyle = { padding: '12px 16px', fontSize: '0.88rem', color: '#111827' };
const pageBtnStyle = { padding: '6px 16px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', fontSize: '0.82rem', cursor: 'pointer', color: '#374151' };
