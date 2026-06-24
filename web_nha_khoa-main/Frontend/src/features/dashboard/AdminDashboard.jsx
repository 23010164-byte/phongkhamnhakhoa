import { useState, useEffect, useCallback } from 'react';
import dashboardApi from '../../api/dashboard.api';
import StatCard from '../../components/common/StatCard';
import { BarChart, LineChart } from '../../components/common/SimpleChart';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import './Dashboard.css';

const PERIOD_OPTIONS = [
  { value: 'week', label: '7 ngày' },
  { value: 'month', label: '30 ngày' },
  { value: 'quarter', label: 'Quý' },
  { value: 'year', label: 'Năm' },
];

const TOP_DOCTOR_COLUMNS = [
  { key: 'rank', label: '#' },
  { key: 'name', label: 'Bác sĩ' },
  { key: 'totalAppointments', label: 'Lịch hẹn' },
  {
    key: 'rating',
    label: 'Đánh giá',
    render: (val) => (val ? `⭐ ${val}` : '—'),
  },
];

const RECENT_COLUMNS = [
  { key: 'time', label: 'Thời gian' },
  { key: 'patientName', label: 'Bệnh nhân' },
  { key: 'doctorName', label: 'Bác sĩ' },
  {
    key: 'status',
    label: 'Trạng thái',
    render: (val) => {
      const map = {
        pending: { label: 'Chờ xác nhận', color: '#d97706' },
        confirmed: { label: 'Đã xác nhận', color: '#2563eb' },
        checked_in: { label: 'Đã check-in', color: '#0891b2' },
        in_progress: { label: 'Đang khám', color: '#7c3aed' },
        completed: { label: 'Hoàn thành', color: '#059669' },
        cancelled: { label: 'Đã hủy', color: '#dc2626' },
        no_show: { label: 'Không đến', color: '#6b7280' },
      };
      const s = map[val] ?? { label: val, color: '#6b7280' };
      return <span style={{ color: s.color, fontWeight: 600 }}>{s.label}</span>;
    },
  },
];

// Helper: convert period string to startDate/endDate query
function periodToDateRange(period) {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  let startDate;
  switch (period) {
    case 'week':
      startDate = new Date(now - 7 * 86400000).toISOString().split('T')[0];
      break;
    case 'quarter':
      startDate = new Date(now - 90 * 86400000).toISOString().split('T')[0];
      break;
    case 'year':
      startDate = new Date(now - 365 * 86400000).toISOString().split('T')[0];
      break;
    case 'month':
    default:
      startDate = new Date(now - 29 * 86400000).toISOString().split('T')[0];
      break;
  }
  return { startDate, endDate };
}

function fillDateGaps(dataMap, startDate, endDate) {
  const result = [];
  const curr = new Date(startDate);
  const end = new Date(endDate);
  while (curr <= end) {
    const label = curr.toISOString().split('T')[0];
    result.push({
      label,
      value: dataMap[label] || 0,
    });
    curr.setDate(curr.getDate() + 1);
  }
  return result;
}

function DashboardAdmin() {
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [appointmentData, setAppointmentData] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setChartLoading(true);
    setError(null);
    try {
      const dateRange = periodToDateRange(period);
      const res = await dashboardApi.getAdminDashboard(dateRange);
      const payload = res.data?.data || {};

      // Map overview data — backend returns: totalUsers, newPatients, totalDoctors,
      // totalAppointments, completedAppointments, cancelledAppointments,
      // pendingAppointments, totalRevenue, completionRate, avgRating
      const ov = payload.overview || {};
      setStats({
        totalUsers: ov.totalUsers ?? 0,
        newPatients: ov.newPatients ?? 0,
        totalDoctors: ov.totalDoctors ?? 0,
        totalAppointments: ov.totalAppointments ?? 0,
        completedAppointments: ov.completedAppointments ?? 0,
        cancelledAppointments: ov.cancelledAppointments ?? 0,
        pendingAppointments: ov.pendingAppointments ?? 0,
        totalRevenue: ov.totalRevenue ?? 0,
        completionRate: ov.completionRate ?? 0,
        avgRating: ov.avgRating ?? 0,
      });

      // Map top doctors — backend returns Sequelize model with nested includes
      const rawDoctors = payload.topDoctors ?? [];
      setTopDoctors(
        rawDoctors.map((d, i) => {
          const raw = d.dataValues || d;
          const doc = raw.doctor?.dataValues || raw.doctor || {};
          const user = doc.user?.dataValues || doc.user || {};
          return {
            rank: i + 1,
            name: user.full_name || doc.title || '—',
            totalAppointments: parseInt(raw.total_appointments || raw.totalAppointments || 0),
            rating: doc.rating_avg ? parseFloat(doc.rating_avg).toFixed(1) : null,
          };
        })
      );

      // Map recent appointments — backend returns Sequelize model with patient/doctor includes
      const rawRecent = payload.recentAppointments ?? [];
      setRecentAppointments(
        rawRecent.map((a) => {
          const raw = a.dataValues || a;
          const patient = raw.patient?.dataValues || raw.patient || {};
          const doc = raw.doctor?.dataValues || raw.doctor || {};
          const docUser = doc.user?.dataValues || doc.user || {};
          return {
            time: `${raw.appointment_date || ''} ${raw.appointment_time || ''}`.trim(),
            patientName: patient.full_name || '—',
            doctorName: docUser.full_name || doc.title || '—',
            status: raw.status,
          };
        })
      );

      // Charts
      const revMap = {};
      (payload.charts?.revenue ?? []).forEach(r => {
        revMap[r.period] = parseFloat(r.revenue || 0) / 1000000;
      });
      setRevenueData(fillDateGaps(revMap, dateRange.startDate, dateRange.endDate));

      // Group appointment chart by date (aggregate counts across statuses)
      const apptRaw = payload.charts?.appointments ?? [];
      const apptMap = {};
      apptRaw.forEach((r) => {
        const date = r.date || r.appointment_date;
        if (!apptMap[date]) apptMap[date] = 0;
        apptMap[date] += parseInt(r.count || 0);
      });
      setAppointmentData(fillDateGaps(apptMap, dateRange.startDate, dateRange.endDate));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <LoadingSpinner text="Đang tải dashboard Admin..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchData} />;

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Dashboard Quản trị</h1>
        <div className="dashboard__period-selector">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`period-btn ${period === opt.value ? 'period-btn--active' : ''}`}
              onClick={() => setPeriod(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard
          label="Tổng người dùng"
          value={stats?.totalUsers?.toLocaleString()}
          subtext={`+${stats?.newPatients ?? 0} bệnh nhân mới`}
          color="#2563eb"
          icon="👥"
        />
        <StatCard
          label="Tổng bác sĩ"
          value={stats?.totalDoctors}
          subtext="Đang hoạt động"
          color="#7c3aed"
          icon="🩺"
        />
        <StatCard
          label="Tổng lịch hẹn"
          value={stats?.totalAppointments}
          subtext={`${stats?.pendingAppointments ?? 0} chờ xác nhận`}
          color="#059669"
          icon="📅"
        />
        <StatCard
          label="Doanh thu"
          value={
            stats?.totalRevenue != null
              ? `${(stats.totalRevenue / 1_000_000).toFixed(1)}M₫`
              : '0₫'
          }
          subtext="Trong khoảng thời gian"
          color="#d97706"
          icon="💰"
        />
        <StatCard
          label="Lịch hẹn hoàn thành"
          value={stats?.completedAppointments?.toLocaleString()}
          subtext={`Tỉ lệ: ${stats?.completionRate ?? 0}%`}
          color="#0891b2"
          icon="✅"
        />
        <StatCard
          label="Đánh giá trung bình"
          value={stats?.avgRating ? `${stats.avgRating}/5` : '—'}
          subtext="Tất cả bác sĩ"
          color="#be185d"
          icon="⭐"
        />
      </div>

      {/* Charts */}
      <div className="chart-grid">
        <div className="chart-grid__item">
          {chartLoading ? (
            <LoadingSpinner text="Đang tải biểu đồ..." />
          ) : (
            <LineChart
              title="Doanh thu theo thời gian"
              data={revenueData}
              color="#2563eb"
              unit="M₫"
            />
          )}
        </div>
        <div className="chart-grid__item">
          {chartLoading ? (
            <LoadingSpinner text="Đang tải biểu đồ..." />
          ) : (
            <BarChart
              title="Lịch hẹn theo thời gian"
              data={appointmentData}
              color="#7c3aed"
            />
          )}
        </div>
      </div>

      {/* Top Doctors */}
      <section className="dashboard__section">
        <h2 className="section-title">Bác sĩ nổi bật</h2>
        <DataTable
          columns={TOP_DOCTOR_COLUMNS}
          rows={topDoctors}
          emptyText="Chưa có dữ liệu bác sĩ"
        />
      </section>

      {/* Recent Appointments */}
      <section className="dashboard__section">
        <h2 className="section-title">Lịch hẹn gần đây</h2>
        <DataTable
          columns={RECENT_COLUMNS}
          rows={recentAppointments}
          emptyText="Chưa có lịch hẹn"
        />
      </section>
    </div>
  );
}

export default DashboardAdmin;
