import { useState, useEffect } from 'react';
import salaryApi from '../../../api/salary.api';

const formatCurrency = (val) => Number(val).toLocaleString('vi-VN');

const TITLE_OPTIONS = [
  { value: 'BS',  label: 'Đại học (BS.)',     coeff: 1.0 },
  { value: 'ThS', label: 'Thạc sỹ (ThS.)',    coeff: 1.15 },
  { value: 'TS',  label: 'Tiến sỹ (TS.)',     coeff: 1.3 },
  { value: 'PGS', label: 'Phó giáo sư (PGS.)', coeff: 1.5 },
  { value: 'GS',  label: 'Giáo sư (GS.)',     coeff: 1.7 },
];

function emptyPatient() {
  return { id: Date.now() + Math.random(), name: '', code: '', complexity: 0 };
}

export default function ShiftCalculatorDemo() {
  // Doctor info
  const [doctorName, setDoctorName] = useState('');
  const [doctorCode, setDoctorCode] = useState('');
  const [doctorTitle, setDoctorTitle] = useState('BS');

  // Shift info
  const [shiftName, setShiftName] = useState('Ca sáng');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [shiftCoeff, setShiftCoeff] = useState('1.0');

  // Patients
  const [patients, setPatients] = useState([emptyPatient()]);

  // Hourly rate
  const [hourlyRate, setHourlyRate] = useState('210000');

  // Results
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ── Patient management ──
  const addPatient = () => setPatients((prev) => [...prev, emptyPatient()]);

  const removePatient = (id) => {
    setPatients((prev) => prev.length > 1 ? prev.filter((p) => p.id !== id) : prev);
  };

  const updatePatient = (id, field, value) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (field === 'complexity') {
          return { ...p, complexity: Math.min(0.5, Math.max(0, parseFloat(value) || 0)) };
        }
        return { ...p, [field]: value };
      })
    );
  };

  // ── Calculate ──
  const handleCalculate = async () => {
    // Client-side calculation for demo
    const titleInfo = TITLE_OPTIONS.find((t) => t.value === doctorTitle) || TITLE_OPTIONS[0];
    const rate = Number(String(hourlyRate).replace(/[.,\s]/g, '')) || 210000;
    const sc = parseFloat(shiftCoeff) || 1;

    // Hours
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    let hours = (eh + em / 60) - (sh + sm / 60);
    if (hours <= 0) hours += 24;

    // Total patient complexity
    const totalComplexity = patients.reduce((sum, p) => sum + (p.complexity || 0), 0);

    // Converted hours: Số giờ quy đổi = Số giờ mỗi ca × (Hệ số ca làm việc + Tổng hệ số bệnh nhân)
    const convertedHours = hours * (sc + totalComplexity);

    // Total
    const total = convertedHours * titleInfo.coeff * rate;

    const localResult = {
      shiftHours: hours,
      shiftCoefficient: sc,
      totalPatientComplexity: totalComplexity,
      convertedHours: convertedHours,
      doctorCoefficient: titleInfo.coeff,
      hourlyRate: rate,
      totalAmount: Math.round(total),
    };

    // Also try server
    try {
      setCalculating(true);
      const { data } = await salaryApi.calculateShift({
        doctorTitle: doctorTitle,
        shiftStartTime: startTime,
        shiftEndTime: endTime,
        shiftCoefficient: sc,
        patients: patients.map((p) => ({
          name: p.name,
          code: p.code,
          complexityLevel: p.complexity,
        })),
        hourlyRate: rate,
      });
      const serverResult = data.data || data;
      setResult({
        shiftHours: serverResult.shiftHours ?? localResult.shiftHours,
        shiftCoefficient: serverResult.shiftCoefficient ?? localResult.shiftCoefficient,
        totalPatientComplexity: serverResult.totalPatientComplexity ?? localResult.totalPatientComplexity,
        convertedHours: serverResult.convertedHours ?? localResult.convertedHours,
        doctorCoefficient: serverResult.doctorCoefficient ?? localResult.doctorCoefficient,
        hourlyRate: serverResult.hourlyRate ?? localResult.hourlyRate,
        totalAmount: serverResult.amount ?? localResult.totalAmount,
      });
    } catch {
      // fallback to local calculation
      setResult(localResult);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <>
      {toast && (
        <div className={`salary-toast salary-toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Doctor Info ── */}
      <div className="salary-card">
        <div className="salary-card-title">
          <span className="card-icon">👨‍⚕️</span>
          Thông tin Bác sĩ
        </div>
        <div className="salary-form-row-3">
          <div className="salary-form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              className="salary-input"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
            />
          </div>
          <div className="salary-form-group">
            <label>Mã bác sĩ</label>
            <input
              type="text"
              className="salary-input"
              value={doctorCode}
              onChange={(e) => setDoctorCode(e.target.value)}
              placeholder="VD: BS001"
            />
          </div>
          <div className="salary-form-group">
            <label>Học vị / Chức danh</label>
            <select
              className="salary-select"
              value={doctorTitle}
              onChange={(e) => setDoctorTitle(e.target.value)}
            >
              {TITLE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} — hệ số {t.coeff}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Shift Info ── */}
      <div className="salary-card">
        <div className="salary-card-title">
          <span className="card-icon">⏱️</span>
          Thông tin Ca làm việc
        </div>
        <div className="salary-form-row-4">
          <div className="salary-form-group">
            <label>Tên ca</label>
            <input
              type="text"
              className="salary-input"
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              placeholder="VD: Ca sáng"
            />
          </div>
          <div className="salary-form-group">
            <label>Giờ bắt đầu</label>
            <input
              type="time"
              className="salary-input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="salary-form-group">
            <label>Giờ kết thúc</label>
            <input
              type="time"
              className="salary-input"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div className="salary-form-group">
            <label>Hệ số ca (1.0–1.5)</label>
            <input
              type="number"
              className="salary-input"
              value={shiftCoeff}
              onChange={(e) => setShiftCoeff(e.target.value)}
              step="0.1"
              min="1.0"
              max="1.5"
            />
          </div>
        </div>
      </div>

      {/* ── Patients ── */}
      <div className="salary-card">
        <div className="salary-card-title">
          <span className="card-icon">🏥</span>
          Danh sách Bệnh nhân trong ca
        </div>

        <div className="salary-form-group">
          <label>Số tiền một giờ (VNĐ)</label>
          <input
            type="text"
            className="salary-input"
            value={formatCurrency(hourlyRate)}
            onChange={(e) => setHourlyRate(String(Number(e.target.value.replace(/[.,\s]/g, '')) || 0))}
            style={{ maxWidth: 250 }}
          />
        </div>

        <div className="patient-list-header">
          <h4>Bệnh nhân ({patients.length})</h4>
          <button className="salary-btn salary-btn-success salary-btn-sm" onClick={addPatient}>
            ➕ Thêm bệnh nhân
          </button>
        </div>

        {patients.map((p, idx) => (
          <div key={p.id} className="patient-row">
            <input
              type="text"
              className="salary-input salary-input-sm"
              value={p.name}
              onChange={(e) => updatePatient(p.id, 'name', e.target.value)}
              placeholder={`Tên BN ${idx + 1}`}
            />
            <input
              type="text"
              className="salary-input salary-input-sm"
              value={p.code}
              onChange={(e) => updatePatient(p.id, 'code', e.target.value)}
              placeholder="Mã BN"
            />
            <input
              type="number"
              className="salary-input salary-input-sm"
              value={p.complexity}
              onChange={(e) => updatePatient(p.id, 'complexity', e.target.value)}
              step="0.05"
              min="0"
              max="0.5"
              placeholder="Độ khó"
            />
            <button
              className="salary-btn salary-btn-danger salary-btn-sm"
              onClick={() => removePatient(p.id)}
              title="Xóa bệnh nhân"
              style={{ padding: '6px 8px', minWidth: 32 }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* ── Calculate Button ── */}
      <div className="salary-btn-group">
        <button
          className="salary-btn salary-btn-primary"
          onClick={handleCalculate}
          disabled={calculating}
          style={{ fontSize: '0.95rem', padding: '12px 32px' }}
        >
          {calculating ? '⏳ Đang tính...' : '🧮 Tính lương ca làm việc'}
        </button>
      </div>

      {/* ── Results ── */}
      {result && (
        <div className="salary-result">
          <div className="salary-result-title">
            📊 Kết quả tính lương — {shiftName}
          </div>
          <div className="salary-result-grid">
            <div className="salary-result-item">
              <span className="label">Số giờ mỗi ca</span>
              <span className="value">{result.shiftHours.toFixed(2)} giờ</span>
            </div>
            <div className="salary-result-item">
              <span className="label">Hệ số ca làm việc</span>
              <span className="value">{result.shiftCoefficient}</span>
            </div>
            <div className="salary-result-item">
              <span className="label">Tổng hệ số bệnh nhân</span>
              <span className="value">{result.totalPatientComplexity.toFixed(2)}</span>
            </div>
            <div className="salary-result-item">
              <span className="label">Số giờ quy đổi</span>
              <span className="value">{result.convertedHours.toFixed(2)} giờ</span>
            </div>
            <div className="salary-result-item">
              <span className="label">Hệ số bác sĩ</span>
              <span className="value">{result.doctorCoefficient}</span>
            </div>
            <div className="salary-result-item">
              <span className="label">Số tiền một giờ</span>
              <span className="value">{formatCurrency(result.hourlyRate)} đ</span>
            </div>
          </div>
          <div className="salary-result-total">
            <span className="label">💰 Tổng tiền ca làm việc</span>
            <span className="value">{formatCurrency(result.totalAmount)} VNĐ</span>
          </div>
        </div>
      )}
    </>
  );
}
