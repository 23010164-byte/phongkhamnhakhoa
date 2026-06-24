import { useState, useEffect, useCallback } from 'react';
import salaryApi from '../../../api/salary.api';

// ── Helpers ─────────────────────────────────────────────────
const formatCurrency = (val) => {
  if (!val && val !== 0) return '';
  return Number(val).toLocaleString('vi-VN');
};

const parseCurrency = (str) => {
  return Number(String(str).replace(/[.,\s]/g, '')) || 0;
};

const DAYS_OF_WEEK = [
  { key: 'monday',    label: 'Thứ 2' },
  { key: 'tuesday',   label: 'Thứ 3' },
  { key: 'wednesday', label: 'Thứ 4' },
  { key: 'thursday',  label: 'Thứ 5' },
  { key: 'friday',    label: 'Thứ 6' },
  { key: 'saturday',  label: 'Thứ 7' },
  { key: 'sunday',    label: 'Chủ nhật' },
];

const DOCTOR_TITLES = [
  { key: 'BS',   label: 'BS. (Bác sĩ)',         defaultCoeff: 1.0 },
  { key: 'ThS',  label: 'ThS. (Thạc sĩ)',       defaultCoeff: 1.15 },
  { key: 'TS',   label: 'TS. (Tiến sĩ)',        defaultCoeff: 1.3 },
  { key: 'PGS',  label: 'PGS. (Phó Giáo sư)',   defaultCoeff: 1.5 },
  { key: 'GS',   label: 'GS. (Giáo sư)',        defaultCoeff: 1.7 },
];

// ── Component ───────────────────────────────────────────────
export default function SalaryConfigForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Form state
  const [baseHourlyRate, setBaseHourlyRate] = useState('210000');
  const [shiftCoefficients, setShiftCoefficients] = useState(
    Object.fromEntries(DAYS_OF_WEEK.map((d) => [d.key, d.key === 'sunday' ? '1.5' : d.key === 'saturday' ? '1.3' : '1.0']))
  );
  const [doctorCoefficients, setDoctorCoefficients] = useState(
    Object.fromEntries(DOCTOR_TITLES.map((t) => [t.key, String(t.defaultCoeff)]))
  );

  // ── Load config ──
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await salaryApi.getConfig();
      const cfg = data.data || data;
      if (cfg.base_hourly_rate) setBaseHourlyRate(String(cfg.base_hourly_rate));
      if (cfg.shift_coefficients) {
        setShiftCoefficients((prev) => ({ ...prev, ...cfg.shift_coefficients }));
      }
      if (cfg.doctor_coefficients) {
        setDoctorCoefficients((prev) => ({ ...prev, ...cfg.doctor_coefficients }));
      }
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  // ── Auto-dismiss toast ──
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ── Save ──
  const handleSave = async () => {
    try {
      setSaving(true);
      await salaryApi.updateConfig({
        base_hourly_rate: parseCurrency(baseHourlyRate),
        shift_coefficients: Object.fromEntries(
          Object.entries(shiftCoefficients).map(([k, v]) => [k, parseFloat(v) || 1])
        ),
        doctor_coefficients: Object.fromEntries(
          Object.entries(doctorCoefficients).map(([k, v]) => [k, parseFloat(v) || 1])
        ),
      });
      setToast({ type: 'success', msg: 'Đã lưu cấu hình thành công!' });
    } catch (err) {
      setToast({ type: 'error', msg: 'Lỗi khi lưu: ' + (err.response?.data?.message || err.message) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="salary-loading">
        <span className="spinner" />
        Đang tải cấu hình...
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div className={`salary-toast salary-toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* ── Base Hourly Rate ── */}
      <div className="salary-card">
        <div className="salary-card-title">
          <span className="card-icon">💵</span>
          Lương cơ bản theo giờ
        </div>
        <div className="salary-form-group">
          <label>Số tiền một giờ làm việc (VNĐ)</label>
          <input
            type="text"
            className="salary-input"
            value={formatCurrency(baseHourlyRate)}
            onChange={(e) => setBaseHourlyRate(String(parseCurrency(e.target.value)))}
            placeholder="Ví dụ: 210,000"
          />
        </div>
      </div>

      {/* ── Shift Coefficients ── */}
      <div className="salary-card">
        <div className="salary-card-title">
          <span className="card-icon">📅</span>
          Hệ số ca theo ngày trong tuần
        </div>
        <div className="salary-table-wrap">
          <table className="salary-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Hệ số</th>
                <th>Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {DAYS_OF_WEEK.map((day) => (
                <tr key={day.key}>
                  <td style={{ fontWeight: 600 }}>{day.label}</td>
                  <td style={{ width: 140 }}>
                    <input
                      type="number"
                      className="salary-input salary-input-sm"
                      value={shiftCoefficients[day.key]}
                      onChange={(e) =>
                        setShiftCoefficients((prev) => ({ ...prev, [day.key]: e.target.value }))
                      }
                      step="0.1"
                      min="0.5"
                      max="3.0"
                    />
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                    {parseFloat(shiftCoefficients[day.key]) > 1
                      ? `Tăng ${Math.round((parseFloat(shiftCoefficients[day.key]) - 1) * 100)}% so với ngày thường`
                      : 'Ngày thường'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Doctor Coefficients ── */}
      <div className="salary-card">
        <div className="salary-card-title">
          <span className="card-icon">🎓</span>
          Hệ số bác sĩ theo học vị / chức danh
        </div>
        <div className="salary-table-wrap">
          <table className="salary-table">
            <thead>
              <tr>
                <th>Học vị / Chức danh</th>
                <th>Hệ số</th>
                <th>Lương quy đổi / giờ</th>
              </tr>
            </thead>
            <tbody>
              {DOCTOR_TITLES.map((title) => {
                const coeff = parseFloat(doctorCoefficients[title.key]) || 1;
                const rate = parseCurrency(baseHourlyRate);
                return (
                  <tr key={title.key}>
                    <td style={{ fontWeight: 600 }}>{title.label}</td>
                    <td style={{ width: 140 }}>
                      <input
                        type="number"
                        className="salary-input salary-input-sm"
                        value={doctorCoefficients[title.key]}
                        onChange={(e) =>
                          setDoctorCoefficients((prev) => ({ ...prev, [title.key]: e.target.value }))
                        }
                        step="0.05"
                        min="0.5"
                        max="5.0"
                      />
                    </td>
                    <td>
                      <span className="salary-badge salary-badge-primary">
                        {formatCurrency(Math.round(rate * coeff))} VNĐ/giờ
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Save Button ── */}
      <div className="salary-btn-group">
        <button
          className="salary-btn salary-btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '⏳ Đang lưu...' : '💾 Lưu cấu hình'}
        </button>
        <button
          className="salary-btn salary-btn-secondary"
          onClick={loadConfig}
          disabled={saving}
        >
          🔄 Tải lại
        </button>
      </div>
    </>
  );
}
