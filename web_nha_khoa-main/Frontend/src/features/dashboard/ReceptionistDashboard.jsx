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

const TODAY_COLUMNS = [
  { key: 'time', label: 'Giờ' },
  { key: 'patientName', label: 'Bệnh nhân' },
  { key: 'phone', label: 'SĐT' },
  { key: 'doctorName', label: 'Bác sĩ' },
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
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
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
  { key: 'doctorName', label: 'Bác sĩ' },
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
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {STATUS_LABEL[val] ?? val}
      </span>
    ),
  },
];

// Helper to map Sequelize appointment to table row
function mapAppt(a, includeDate = false) {
  const raw = a.dataValues || a;
  const patient = raw.patient?.dataValues || raw.patient || {};
  const doc = raw.doctor?.dataValues || raw.doctor || {};
  const docUser = doc.user?.dataValues || doc.user || {};
  const row = {
    id: raw.id,
    time: raw.appointment_time || '—',
    patientName: patient.full_name || '—',
    phone: patient.phone || '—',
    doctorName: docUser.full_name || '—',
    status: raw.status,
  };
  if (includeDate) {
    row.date = raw.appointment_date || '—';
  }
  return row;
}

function DashboardReceptionist() {
  const [stats, setStats] = useState(null);
  const [todayAppts, setTodayAppts] = useState([]);
  const [upcomingAppts, setUpcomingAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getReceptionistDashboard({ period: 'month' });
      const payload = res.data?.data || res.data || res || {};

      const period = payload.period || payload.today || {}; // Fallback to today for backwards compatibility
      setStats({
        totalPeriod: period.total ?? 0,
        pending: period.pending ?? 0,
        confirmed: period.confirmed ?? 0,
        checkedIn: period.checkedIn ?? 0,
        completed: period.completed ?? 0,
        cancelled: period.cancelled ?? 0,
        pendingTotal: payload.pendingTotal ?? 0,
        totalAllTime: payload.totalAllTime ?? 0,
      });

      // Map today's appointments
      const rawToday = payload.recentAppointments ?? [];
      setTodayAppts(rawToday.map((a) => mapAppt(a, false)));

      // Map upcoming appointments (next 7 days)
      const rawUpcoming = payload.upcomingAppointments ?? [];
      setUpcomingAppts(rawUpcoming.map((a) => mapAppt(a, true)));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchAll();
    }, 60_000);

    return () => clearInterval(interval);
  }, [fetchAll]);

  if (loading) return <LoadingSpinner text="Đang tải dashboard Lễ tân..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchAll} />;

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Dashboard Lễ tân</h1>
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
          label="Tổng lịch hẹn tháng này"
          value={stats?.totalPeriod}
          subtext={`${stats?.checkedIn ?? 0} đã check-in`}
          color="#2563eb"
          icon="📋"
        />
        <StatCard
          label="Chờ xác nhận"
          value={stats?.pending}
          subtext={`Tổng chờ: ${stats?.pendingTotal ?? 0}`}
          color="#d97706"
          icon="⏳"
        />
        <StatCard
          label="Đã xác nhận (chờ check-in)"
          value={stats?.confirmed}
          subtext="Cần check-in"
          color="#0891b2"
          icon="✋"
        />
        <StatCard
          label="Đã hoàn thành"
          value={stats?.completed}
          subtext={`Tổng tất cả: ${stats?.totalAllTime ?? 0}`}
          color="#059669"
          icon="✅"
        />
      </div>

      {/* Today appointments */}
      <section className="dashboard__section">
        <div className="section-header-row">
          <h2 className="section-title" style={{ margin: 0 }}>Lịch hẹn hôm nay</h2>
          <span className="section-hint">Tự động cập nhật mỗi 60 giây</span>
        </div>
        <DataTable
          columns={TODAY_COLUMNS}
          rows={todayAppts}
          emptyText="Không có lịch hẹn hôm nay"
        />
      </section>

      {/* Upcoming appointments */}
      <section className="dashboard__section">
        <h2 className="section-title">Lịch hẹn sắp tới (7 ngày tới)</h2>
        <DataTable
          columns={UPCOMING_COLUMNS}
          rows={upcomingAppts}
          emptyText="Không có lịch hẹn sắp tới"
        />
      </section>
    </div>
  );
}

export default DashboardReceptionist;
