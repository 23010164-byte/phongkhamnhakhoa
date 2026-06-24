import { useState, useEffect } from 'react';
import salaryApi from '../../../api/salary.api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const formatCurrency = (val) => Number(val).toLocaleString('vi-VN');

const MONTH_NAMES = [
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
  'T7', 'T8', 'T9', 'T10', 'T11', 'T12',
];

const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
  '#84cc16', '#e11d48', '#0ea5e9', '#a855f7', '#22c55e',
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e6f0', borderRadius: 10,
      padding: '12px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      maxWidth: 280,
    }}>
      <p style={{ fontWeight: 700, marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: '0.8rem', margin: '2px 0' }}>
          {p.name}: <strong>{formatCurrency(p.value)} đ</strong>
        </p>
      ))}
    </div>
  );
};

export default function AllDoctorsYearlyReport() {
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
      const { data } = await salaryApi.getAllDoctorsYearlyReport({ year });
      setReport(data.data || data);
    } catch (err) {
      setToast({ type: 'error', msg: 'Lỗi: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  // Extract doctors list
  const doctors = report?.doctors || report || [];
  const doctorList = Array.isArray(doctors) ? doctors : [];

  // Build chart data: one entry per month, each doctor as a key
  const chartData = MONTH_NAMES.map((name, monthIdx) => {
    const entry = { name };
    doctorList.forEach((doc) => {
      const docName = doc.doctor?.fullName || doc.doctor?.full_name || doc.doctor_name || doc.doctorName || doc.name || 'BS';
      const months = doc.monthlyData || doc.months || doc.monthly_data || [];
      const m = months.find((md) => (md.month || md.monthNumber) === monthIdx + 1) || {};
      entry[docName] = Number(m.total_amount || m.totalAmount || m.amount || 0);
    });
    return entry;
  });

  // Table data with totals
  const tableData = doctorList.map((doc) => {
    const docName = doc.doctor?.fullName || doc.doctor?.full_name || doc.doctor_name || doc.doctorName || doc.name || 'BS';
    const months = doc.monthlyData || doc.months || doc.monthly_data || [];
    const monthlyAmounts = MONTH_NAMES.map((_, idx) => {
      const m = months.find((md) => (md.month || md.monthNumber) === idx + 1) || {};
      return Number(m.total_amount || m.totalAmount || m.amount || 0);
    });
    const total = monthlyAmounts.reduce((sum, v) => sum + v, 0);
    return { name: docName, months: monthlyAmounts, total };
  });

  const grandTotal = tableData.reduce((sum, d) => sum + d.total, 0);

  // Doctor names for chart bars
  const doctorNames = doctorList.map(
    (doc) => doc.doctor?.fullName || doc.doctor?.full_name || doc.doctor_name || doc.doctorName || doc.name || 'BS'
  );

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
          Chọn năm báo cáo
        </div>
        <div className="salary-form-row" style={{ maxWidth: 400 }}>
          <div className="salary-form-group">
            <label>Năm</label>
            <select
              className="salary-select"
              value={year}
              onChange={(e) => { setYear(Number(e.target.value)); setReport(null); }}
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

      {/* ── Report ── */}
      {report && (
        <>
          {/* Grand total summary */}
          <div className="salary-result" style={{ marginBottom: 20 }}>
            <div className="salary-result-grid">
              <div className="salary-result-item">
                <span className="label">Tổng số bác sĩ</span>
                <span className="value">{doctorList.length}</span>
              </div>
              <div className="salary-result-item">
                <span className="label">Năm</span>
                <span className="value">{year}</span>
              </div>
            </div>
            <div className="salary-result-total">
              <span className="label">💰 Tổng chi lương năm {year}</span>
              <span className="value">{formatCurrency(grandTotal)} VNĐ</span>
            </div>
          </div>

          {/* Chart */}
          {doctorList.length > 0 && (
            <div className="salary-chart-wrap">
              <div className="salary-chart-title">📈 Biểu đồ lương tất cả bác sĩ — Năm {year}</div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e6f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis
                    tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : formatCurrency(v)}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '0.78rem', paddingTop: 10 }}
                    iconType="circle"
                  />
                  {doctorNames.map((name, idx) => (
                    <Bar
                      key={name}
                      dataKey={name}
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={35}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Table */}
          <div className="salary-card" style={{ marginTop: 20 }}>
            <div className="salary-card-title">
              <span className="card-icon">📋</span>
              Bảng lương chi tiết theo tháng — Năm {year}
            </div>
            {tableData.length > 0 ? (
              <div className="salary-table-wrap">
                <table className="salary-table">
                  <thead>
                    <tr>
                      <th style={{ position: 'sticky', left: 0, background: '#f8fafc', zIndex: 2 }}>
                        Bác sĩ
                      </th>
                      {MONTH_NAMES.map((m) => (
                        <th key={m} className="text-right">{m}</th>
                      ))}
                      <th className="text-right" style={{ minWidth: 110 }}>Tổng năm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((doc, idx) => (
                      <tr key={idx}>
                        <td style={{
                          fontWeight: 600,
                          position: 'sticky', left: 0,
                          background: idx % 2 === 0 ? '#fff' : 'rgba(248,250,252,0.5)',
                          zIndex: 1,
                        }}>
                          {doc.name}
                        </td>
                        {doc.months.map((amt, mi) => (
                          <td key={mi} className="text-right" style={{ fontSize: '0.8rem' }}>
                            {amt > 0 ? formatCurrency(amt) : '—'}
                          </td>
                        ))}
                        <td className="text-right font-bold">{formatCurrency(doc.total)} đ</td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td style={{
                        fontWeight: 700,
                        position: 'sticky', left: 0,
                        background: '#f0f9ff', zIndex: 1,
                      }}>
                        TỔNG
                      </td>
                      {MONTH_NAMES.map((_, mi) => {
                        const monthTotal = tableData.reduce((sum, d) => sum + d.months[mi], 0);
                        return (
                          <td key={mi} className="text-right font-bold" style={{ fontSize: '0.8rem' }}>
                            {monthTotal > 0 ? formatCurrency(monthTotal) : '—'}
                          </td>
                        );
                      })}
                      <td className="text-right font-bold">{formatCurrency(grandTotal)} đ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="salary-empty">
                <div className="empty-icon">📭</div>
                <p>Không có dữ liệu trong năm {year}</p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
