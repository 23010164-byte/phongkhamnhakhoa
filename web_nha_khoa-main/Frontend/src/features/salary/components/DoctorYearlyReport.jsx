import { useState, useEffect } from 'react';
import salaryApi from '../../../api/salary.api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const formatCurrency = (val) => Number(val).toLocaleString('vi-VN');

const MONTH_NAMES = [
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
  'T7', 'T8', 'T9', 'T10', 'T11', 'T12',
];

const CHART_COLORS = [
  '#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171',
  '#2dd4bf', '#818cf8', '#fb923c', '#e879f9', '#4ade80',
  '#38bdf8', '#facc15',
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e6f0', borderRadius: 10,
      padding: '12px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    }}>
      <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: '0.85rem' }}>
          {p.name}: <strong>{formatCurrency(p.value)} VNĐ</strong>
        </p>
      ))}
    </div>
  );
};

export default function DoctorYearlyReport() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await salaryApi.getDoctors();
        setDoctors(data.data || data || []);
      } catch {
        setDoctors([]);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchReport = async () => {
    if (!selectedDoctor) {
      setToast({ type: 'error', msg: 'Vui lòng chọn bác sĩ!' });
      return;
    }
    try {
      setLoading(true);
      const { data } = await salaryApi.getDoctorYearlyReport({
        doctorProfileId: selectedDoctor,
        year,
      });
      setReport(data.data || data);
    } catch (err) {
      setToast({ type: 'error', msg: 'Lỗi: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  // Build chart data
  const months = report?.monthlyData || report?.months || report?.monthly_data || [];
  const chartData = MONTH_NAMES.map((name, idx) => {
    const m = months.find((md) => (md.month || md.monthNumber) === idx + 1) || {};
    return {
      name,
      amount: Number(m.total_amount || m.totalAmount || m.amount || 0),
      shifts: Number(m.total_shifts || m.totalShifts || 0),
    };
  });

  const yearTotal = chartData.reduce((sum, d) => sum + d.amount, 0);
  const totalShifts = chartData.reduce((sum, d) => sum + d.shifts, 0);

  const selectedDoctorInfo = doctors.find((d) => (d._id || d.id) === selectedDoctor);

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
          Chọn bác sĩ và năm
        </div>
        <div className="salary-form-row-3">
          <div className="salary-form-group">
            <label>Bác sĩ</label>
            <select
              className="salary-select"
              value={selectedDoctor}
              onChange={(e) => { setSelectedDoctor(e.target.value); setReport(null); }}
            >
              <option value="">-- Chọn bác sĩ --</option>
              {doctors.map((d) => (
                <option key={d._id || d.id} value={d._id || d.id}>
                  {d.user?.full_name || d.full_name || d.name || `BS #${d._id || d.id}`}
                </option>
              ))}
            </select>
          </div>
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
              disabled={loading || !selectedDoctor}
            >
              {loading ? '⏳ Đang tải...' : '📊 Xem báo cáo'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Report ── */}
      {report && (
        <>
          {/* Doctor info */}
          <div className="salary-result" style={{ marginBottom: 20 }}>
            <div className="salary-result-grid">
              <div className="salary-result-item">
                <span className="label">Bác sĩ</span>
                <span className="value">
                  {report.doctor_name || selectedDoctorInfo?.user?.full_name || selectedDoctorInfo?.full_name || '—'}
                </span>
              </div>
              <div className="salary-result-item">
                <span className="label">Năm</span>
                <span className="value">{year}</span>
              </div>
              <div className="salary-result-item">
                <span className="label">Tổng ca</span>
                <span className="value">{totalShifts}</span>
              </div>
            </div>
            <div className="salary-result-total">
              <span className="label">💰 Tổng lương năm {year}</span>
              <span className="value">{formatCurrency(yearTotal)} VNĐ</span>
            </div>
          </div>

          {/* Chart */}
          <div className="salary-chart-wrap">
            <div className="salary-chart-title">📈 Biểu đồ lương theo tháng — Năm {year}</div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e6f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis
                  tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : formatCurrency(v)}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" name="Lương" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {chartData.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="salary-card" style={{ marginTop: 20 }}>
            <div className="salary-card-title">
              <span className="card-icon">📋</span>
              Chi tiết theo tháng
            </div>
            <div className="salary-table-wrap">
              <table className="salary-table">
                <thead>
                  <tr>
                    <th>Tháng</th>
                    <th className="text-right">Số ca</th>
                    <th className="text-right">Tổng lương</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((d, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>Tháng {idx + 1}</td>
                      <td className="text-right">{d.shifts}</td>
                      <td className="text-right font-bold">{formatCurrency(d.amount)} đ</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td style={{ fontWeight: 700 }}>TỔNG NĂM {year}</td>
                    <td className="text-right font-bold">{totalShifts}</td>
                    <td className="text-right font-bold">{formatCurrency(yearTotal)} đ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
