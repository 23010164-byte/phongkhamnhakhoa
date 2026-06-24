import { useState, useEffect } from 'react';
import salaryApi from '../../../api/salary.api';

const formatCurrency = (val) => Number(val).toLocaleString('vi-VN');

export default function MonthlyAllDoctorsReport() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const { data } = await salaryApi.getMonthlyReport({ month, year });
      setReport(data.data || data);
    } catch (err) {
      setToast({ type: 'error', msg: 'Lỗi: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  const slips = report?.slips || report?.doctors || (Array.isArray(report) ? report : []);
  const grandTotal = Array.isArray(slips)
    ? slips.reduce((sum, d) => sum + Number(d.total_amount || d.totalAmount || 0), 0)
    : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {toast && (
        <div className={`salary-toast salary-toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="salary-card">
        <div className="salary-card-title">
          <span className="card-icon">🔍</span>
          Chọn tháng báo cáo
        </div>
        <div className="salary-form-row-3">
          <div className="salary-form-group">
            <label>Tháng</label>
            <select
              className="salary-select"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>
          </div>
          <div className="salary-form-group">
            <label>Năm</label>
            <select
              className="salary-select"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => {
                const y = new Date().getFullYear() - 2 + i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
          </div>
          <div className="salary-form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="salary-btn salary-btn-primary"
              onClick={fetchReport}
              disabled={loading}
            >
              {loading ? '⏳ Đang tải...' : '📊 Xem báo cáo'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Report Table ── */}
      {report && (
        <div className="salary-card">
          <div className="salary-card-title" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="card-icon">📋</span>
              Báo cáo lương tháng {month}/{year} — Tất cả Bác sĩ
            </div>
            <button className="salary-btn salary-btn-secondary salary-btn-sm" onClick={handlePrint}>
              🖨️ In báo cáo
            </button>
          </div>

          {Array.isArray(slips) && slips.length > 0 ? (
            <div className="salary-table-wrap">
              <table className="salary-table">
                <thead>
                  <tr>
                    <th className="text-center">STT</th>
                    <th>Họ và tên</th>
                    <th>Học vị</th>
                    <th className="text-right">Số ca</th>
                    <th className="text-right">Tổng giờ</th>
                    <th className="text-right">Tổng lương</th>
                  </tr>
                </thead>
                <tbody>
                  {slips.map((d, idx) => (
                    <tr key={d._id || d.id || idx}>
                      <td className="text-center">{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>
                        {d.doctor?.user?.full_name || d.doctor?.full_name || d.doctor_name || d.doctorName || d.name || '—'}
                      </td>
                      <td>
                        <span className="salary-badge salary-badge-primary">
                          {d.doctor?.title || d.doctor_title || d.title || '—'}
                        </span>
                      </td>
                      <td className="text-right">{d.total_shifts || d.totalShifts || 0}</td>
                      <td className="text-right">
                        {Number(d.total_hours || d.totalHours || 0).toFixed(1)}
                      </td>
                      <td className="text-right font-bold">
                        {formatCurrency(d.total_amount || d.totalAmount || 0)} đ
                      </td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan={3} style={{ fontWeight: 700 }}>TỔNG CỘNG</td>
                    <td className="text-right font-bold">
                      {slips.reduce((sum, d) => sum + (d.total_shifts || d.totalShifts || 0), 0)}
                    </td>
                    <td className="text-right font-bold">
                      {slips.reduce((sum, d) => sum + Number(d.total_hours || d.totalHours || 0), 0).toFixed(1)}
                    </td>
                    <td className="text-right font-bold">
                      {formatCurrency(grandTotal)} đ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="salary-empty">
              <div className="empty-icon">📭</div>
              <p>Không có dữ liệu trong tháng {month}/{year}</p>
            </div>
          )}

          {/* Summary cards */}
          {Array.isArray(slips) && slips.length > 0 && (
            <div className="salary-result" style={{ marginTop: 20 }}>
              <div className="salary-result-grid">
                <div className="salary-result-item">
                  <span className="label">Tổng số phiếu lương</span>
                  <span className="value">{slips.length}</span>
                </div>
                <div className="salary-result-item">
                  <span className="label">Tổng số ca</span>
                  <span className="value">
                    {slips.reduce((sum, d) => sum + (d.total_shifts || d.totalShifts || 0), 0)}
                  </span>
                </div>
                <div className="salary-result-item">
                  <span className="label">Tổng giờ làm việc</span>
                  <span className="value">
                    {slips.reduce((sum, d) => sum + Number(d.total_hours || d.totalHours || 0), 0).toFixed(1)} giờ
                  </span>
                </div>
              </div>
              <div className="salary-result-total">
                <span className="label">💰 Tổng chi lương tháng {month}/{year}</span>
                <span className="value">{formatCurrency(grandTotal)} VNĐ</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
