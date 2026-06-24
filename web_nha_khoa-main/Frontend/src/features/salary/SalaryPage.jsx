import { useState } from 'react';
import './SalaryPage.css';
import SalaryConfigForm from './components/SalaryConfigForm';
import ShiftCalculatorDemo from './components/ShiftCalculatorDemo';
import MonthlySalarySlip from './components/MonthlySalarySlip';
import MonthlyAllDoctorsReport from './components/MonthlyAllDoctorsReport';
import DoctorYearlyReport from './components/DoctorYearlyReport';
import AllDoctorsYearlyReport from './components/AllDoctorsYearlyReport';

// ── Menu config ─────────────────────────────────────────────
const MENU_GROUPS = [
  {
    id: 'management',
    title: 'Quản lý Lương',
    icon: '📋',
    items: [
      { key: 'config',       label: 'Cấu hình lương' },
      { key: 'shift-demo',   label: 'Tính lương ca làm việc (Demo)' },
      { key: 'monthly-slip', label: 'Lập phiếu lương tháng' },
    ],
  },
  {
    id: 'reports',
    title: 'Báo cáo Lương',
    icon: '📊',
    items: [
      { key: 'report-month',      label: 'Báo cáo tháng (Tất cả BS)' },
      { key: 'report-year-doctor', label: 'Báo cáo năm (1 Bác sĩ)' },
      { key: 'report-year-all',   label: 'Báo cáo năm (Tất cả BS)' },
    ],
  },
];

const VIEW_TITLES = {
  'config':             { title: 'Cấu hình lương',              desc: 'Thiết lập lương cơ bản, hệ số ca và hệ số bác sĩ' },
  'shift-demo':         { title: 'Tính lương ca làm việc (Demo)', desc: 'Mô phỏng tính lương cho một ca làm việc' },
  'monthly-slip':       { title: 'Lập phiếu lương tháng',       desc: 'Tạo phiếu lương chi tiết cho bác sĩ theo tháng' },
  'report-month':       { title: 'Báo cáo tháng (Tất cả BS)',   desc: 'Tổng hợp lương tất cả bác sĩ trong tháng' },
  'report-year-doctor': { title: 'Báo cáo năm (1 Bác sĩ)',      desc: 'Thống kê lương theo năm cho một bác sĩ' },
  'report-year-all':    { title: 'Báo cáo năm (Tất cả BS)',     desc: 'Tổng hợp lương tất cả bác sĩ trong năm' },
};

// ── View renderer ───────────────────────────────────────────
function renderView(activeView) {
  switch (activeView) {
    case 'config':             return <SalaryConfigForm />;
    case 'shift-demo':         return <ShiftCalculatorDemo />;
    case 'monthly-slip':       return <MonthlySalarySlip />;
    case 'report-month':       return <MonthlyAllDoctorsReport />;
    case 'report-year-doctor': return <DoctorYearlyReport />;
    case 'report-year-all':    return <AllDoctorsYearlyReport />;
    default:                   return <SalaryConfigForm />;
  }
}

// ── Main Component ──────────────────────────────────────────
export default function SalaryPage() {
  const [activeView, setActiveView] = useState('config');
  const viewInfo = VIEW_TITLES[activeView] || VIEW_TITLES['config'];

  return (
    <div className="salary-page">
      {/* ── Left Sidebar ── */}
      <aside className="salary-sidebar">
        <div className="salary-sidebar-header">
          <h2>💰 Tính lương Bác sĩ</h2>
          <p>UC4 — Quản lý & Báo cáo</p>
        </div>

        {MENU_GROUPS.map((group) => (
          <div key={group.id} className="salary-menu-group">
            <div className="salary-menu-group-title">
              <span className="menu-icon">{group.icon}</span>
              {group.title}
            </div>
            {group.items.map((item) => (
              <button
                key={item.key}
                className={`salary-menu-item${activeView === item.key ? ' active' : ''}`}
                onClick={() => setActiveView(item.key)}
              >
                <span className="item-dot" />
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* ── Right Content ── */}
      <main className="salary-content" key={activeView}>
        <div className="salary-content-header">
          <h1>{viewInfo.title}</h1>
          <p>{viewInfo.desc}</p>
        </div>
        {renderView(activeView)}
      </main>
    </div>
  );
}
