import { useCallback, useEffect, useState } from 'react';
import dashboardApi from '../../api/dashboard.api';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import './Dashboard.css';

const STATUS_LABEL = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  checked_in: 'Đã check-in',
  in_progress: 'Đang khám',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  no_show: 'Không đến',
};

const STATUS_COLOR = {
  pending: '#d97706',
  confirmed: '#2563eb',
  checked_in: '#0891b2',
  in_progress: '#7c3aed',
  completed: '#059669',
  cancelled: '#dc2626',
  no_show: '#6b7280',
};

const SCHEDULE_COLUMNS = [
  { key: 'time', label: 'Giờ' },
  { key: 'patientName', label: 'Bệnh nhân' },
  { key: 'phone', label: 'SĐT' },
  {
    key: 'status',
    label: 'Trạng thái',
    render: (val) => (
      <span
        className="badge"
        style={{
          background: (STATUS_COLOR[val] || '#6b7280') + '18',
          color: STATUS_COLOR[val] || '#6b7280',
          border: `1px solid ${(STATUS_COLOR[val] || '#6b7280')}44`,
        }}
      >
        {STATUS_LABEL[val] ?? val}
      </span>
    ),
  },
];

const UPCOMING_COLUMNS = [
  { key: 'date', label: 'Ngày' },
  { key: 'time', label: 'Giờ' },
  { key: 'patientName', label: 'Bệnh nhân' },
  { key: 'phone', label: 'SĐT' },
  {
    key: 'status',
    label: 'Trạng thái',
    render: (val) => (
      <span
        className="badge"
        style={{
          background: (STATUS_COLOR[val] || '#6b7280') + '18',
          color: STATUS_COLOR[val] || '#6b7280',
          border: `1px solid ${(STATUS_COLOR[val] || '#6b7280')}44`,
        }}
      >
        {STATUS_LABEL[val] ?? val}
      </span>
    ),
  },
];

// Helper to map Sequelize appointment data to table row
function mapAppointmentRow(a, includeDate = false) {
  const raw = a.dataValues || a;
  const patient = raw.patient?.dataValues || raw.patient || {};
  const row = {
    time: raw.appointment_time || '—',
    patientName: patient.full_name || '—',
    phone: patient.phone || '—',
    status: raw.status,
  };
  if (includeDate) {
    row.date = raw.appointment_date || '—';
  }
  return row;
}

function DashboardDoctor() {
  const [stats, setStats] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [upcomingList, setUpcomingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getDoctorDashboard({ period: 'month' });
      const payload = res.data?.data || {};
      const s = payload.stats || {};

      setStats({
        totalAppointments: s.totalAppointments ?? 0,
        completedAppointments: s.completedAppointments ?? 0,
        cancelledAppointments: s.cancelledAppointments ?? 0,
        pendingAppointments: s.pendingAppointments ?? 0,
        totalPatients: s.totalPatients ?? 0,
        totalRevenue: s.totalRevenue ?? 0,
        avgRating: s.avgRating ?? 0,
        ratingCount: s.ratingCount ?? 0,
        completionRate: s.completionRate ?? 0,
        todayCount: Array.isArray(s.todayAppointments) ? s.todayAppointments.length : 0,
      });

      // Map today appointments
      const rawToday = Array.isArray(s.todayAppointments) ? s.todayAppointments : [];
      setTodaySchedule(rawToday.map((a) => mapAppointmentRow(a, false)));

      // Map upcoming appointments
      const rawUpcoming = Array.isArray(s.upcomingAppointments) ? s.upcomingAppointments : [];
      setUpcomingList(rawUpcoming.map((a) => mapAppointmentRow(a, true)));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) return <LoadingSpinner text="Đang tải dashboard Bác sĩ..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchAll} />;

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Dashboard Bác sĩ</h1>
        <div className="dashboard__date">
          {new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard
          label="Lịch hẹn hôm nay"
          value={stats?.todayCount}
          subtext={`${stats?.completedAppointments ?? 0} đã hoàn thành`}
          color="#2563eb"
          icon="📅"
        />
        <StatCard
          label="Tổng bệnh nhân"
          value={stats?.totalPatients?.toLocaleString()}
          subtext="Trong 30 ngày qua"
          color="#059669"
          icon="👥"
        />
        <StatCard
          label="Chờ xác nhận"
          value={stats?.pendingAppointments}
          subtext="Cần xử lý"
          color="#d97706"
          icon="⏳"
        />
        <StatCard
          label="Đánh giá trung bình"
          value={stats?.avgRating ? `${stats.avgRating}/5` : '—'}
          subtext={`${stats?.ratingCount ?? 0} lượt đánh giá`}
          color="#7c3aed"
          icon="⭐"
        />
      </div>

      {/* Additional Stats Row */}
      <div className="stat-grid" style={{ marginTop: 0 }}>
        <StatCard
          label="Tổng lịch hẹn"
          value={stats?.totalAppointments}
          subtext={`Tỉ lệ hoàn thành: ${stats?.completionRate ?? 0}%`}
          color="#0891b2"
          icon="📋"
        />
        <StatCard
          label="Doanh thu"
          value={
            stats?.totalRevenue != null
              ? `${(stats.totalRevenue / 1_000_000).toFixed(1)}M₫`
              : '0₫'
          }
          subtext="Trong 30 ngày qua"
          color="#be185d"
          icon="💰"
        />
      </div>

      {/* Today schedule */}
      <section className="dashboard__section">
        <h2 className="section-title">Lịch hôm nay ({stats?.todayCount ?? 0} lịch hẹn)</h2>
        <DataTable
          columns={SCHEDULE_COLUMNS}
          rows={todaySchedule}
          emptyText="Không có lịch hẹn hôm nay"
        />
      </section>

      {/* Upcoming appointments */}
      <section className="dashboard__section">
        <h2 className="section-title">Lịch hẹn sắp tới (7 ngày tới)</h2>
        <DataTable
          columns={UPCOMING_COLUMNS}
          rows={upcomingList}
          emptyText="Không có lịch hẹn sắp tới"
        />
      </section>
    </div>
  );
}

export default DashboardDoctor;
