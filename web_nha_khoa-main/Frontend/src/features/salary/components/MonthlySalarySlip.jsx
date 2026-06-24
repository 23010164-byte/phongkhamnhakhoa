import { useState, useEffect } from 'react';
import salaryApi from '../../../api/salary.api';

const formatCurrency = (val) => Number(val).toLocaleString('vi-VN');

export default function MonthlySalarySlip() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // ── Load doctors ──
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

  // ── Generate slip ──
  const handleGenerate = async () => {
    if (!selectedDoctor) {
      setToast({ type: 'error', msg: 'Vui lòng chọn bác sĩ!' });
      return;
    }
    try {
      setLoading(true);
      const { data } = await salaryApi.generateSlip({
        doctorProfileId: selectedDoctor,
        month,
        year,
      });
      setSlip(data.data || data);
    } catch (err) {
      setToast({ type: 'error', msg: 'Lỗi: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

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
          <span className="card-icon">📝</span>
          Lập phiếu lương
        </div>
        <div className="salary-form-row-3">
          <div className="salary-form-group">
            <label>Bác sĩ</label>
            <select
              className="salary-select"
              value={selectedDoctor}
              onChange={(e) => { setSelectedDoctor(e.target.value); setSlip(null); }}
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
            <label>Tháng</label>
            <select
              className="salary-select"
              value={month}
              onChange={(e) => { setMonth(Number(e.target.value)); setSlip(null); }}
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
              onChange={(e) => { setYear(Number(e.target.value)); setSlip(null); }}
            >
              {Array.from({ length: 5 }, (_, i) => {
                const y = new Date().getFullYear() - 2 + i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
          </div>
        </div>
        <div className="salary-btn-group">
          <button
            className="salary-btn salary-btn-primary"
            onClick={handleGenerate}
            disabled={loading || !selectedDoctor}
          >
            {loading ? '⏳ Đang lập phiếu...' : '📄 Lập phiếu lương'}
          </button>
        </div>
      </div>

      {/* ── Salary Slip ── */}
      {slip && (
        <div className="salary-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="salary-slip">
            <div className="salary-slip-header">
              <h2>PHIẾU LƯƠNG THÁNG</h2>
              <p>Phòng khám Nha khoa — Tháng {slip.month || month}/{slip.year || year}</p>
            </div>

            <div className="salary-slip-info">
              <div className="salary-slip-info-item">
                <span className="label">Bác sĩ:</span>
                <span className="value">
                  {slip.doctor?.user?.full_name || slip.doctor_name || selectedDoctorInfo?.user?.full_name || selectedDoctorInfo?.full_name || '—'}
                </span>
              </div>
              <div className="salary-slip-info-item">
                <span className="label">Học vị:</span>
                <span className="value">{slip.doctor?.title || slip.doctor_title || '—'}</span>
              </div>
              <div className="salary-slip-info-item">
                <span className="label">Tháng/Năm:</span>
                <span className="value">
                  {slip.month || month}/{slip.year || year}
                </span>
              </div>
              <div className="salary-slip-info-item">
                <span className="label">Hệ số BS:</span>
                <span className="value">{slip.details?.[0]?.doctorCoefficient || slip.doctor_coefficient || '—'}</span>
              </div>
            </div>

            <div className="salary-slip-body">
              {(slip.details || slip.shifts) && (slip.details || slip.shifts).length > 0 ? (
                <div className="salary-table-wrap">
                  <table className="salary-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Ngày</th>
                        <th>Ca làm việc</th>
                        <th className="text-right">Số giờ</th>
                        <th className="text-right">Hệ số ca</th>
                        <th className="text-right">HS BN</th>
                        <th className="text-right">Giờ quy đổi</th>
                        <th className="text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(slip.details || slip.shifts).map((s, idx) => (
                        <tr key={idx}>
                          <td className="text-center">{idx + 1}</td>
                          <td>{formatDate(s.rosterDate || s.date)}</td>
                          <td>{s.shiftName || s.shift_name || '—'}</td>
                          <td className="text-right">{(s.shiftHours || s.hours || 0).toFixed(1)}</td>
                          <td className="text-right">{s.shiftCoefficient || s.shift_coefficient || '—'}</td>
                          <td className="text-right">{(s.totalPatientComplexity || s.patient_complexity || 0).toFixed(2)}</td>
                          <td className="text-right">{(s.convertedHours || s.converted_hours || 0).toFixed(2)}</td>
                          <td className="text-right font-bold">
                            {formatCurrency(s.amount || s.totalAmount || 0)} đ
                          </td>
                        </tr>
                      ))}
                      <tr className="total-row">
                        <td colSpan={3} style={{ fontWeight: 700 }}>TỔNG CỘNG</td>
                        <td className="text-right font-bold">
                          {(slip.details || slip.shifts).reduce((sum, s) => sum + (s.hours || s.shiftHours || 0), 0).toFixed(1)}
                        </td>
                        <td></td>
                        <td></td>
                        <td className="text-right font-bold">
                          {(slip.details || slip.shifts).reduce((sum, s) => sum + (s.converted_hours || s.convertedHours || 0), 0).toFixed(2)}
                        </td>
                        <td className="text-right font-bold">
                          {formatCurrency(
                            slip.total_amount || slip.totalAmount ||
                            (slip.details || slip.shifts).reduce((sum, s) => sum + (s.amount || s.totalAmount || 0), 0)
                          )} đ
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="salary-empty">
                  <div className="empty-icon">📭</div>
                  <p>Không có ca làm việc trong tháng này</p>
                </div>
              )}
            </div>

            {(slip.details || slip.shifts) && (slip.details || slip.shifts).length > 0 && (
              <div className="salary-slip-total">
                <span className="label">💰 TỔNG LƯƠNG THÁNG {slip.month || month}/{slip.year || year}</span>
                <span className="value">
                  {formatCurrency(
                    slip.total_amount || slip.totalAmount ||
                    (slip.details || slip.shifts).reduce((sum, s) => sum + (s.amount || s.totalAmount || 0), 0)
                  )} VNĐ
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
