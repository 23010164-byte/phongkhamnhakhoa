import { useCallback, useEffect, useState } from 'react';
import dashboardApi from '../../api/dashboard.api';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import './Dashboard.css';

const APPT_COLUMNS = [
  { key: 'date', label: 'Ngày' },
  { key: 'time', label: 'Giờ' },
  { key: 'doctorName', label: 'Bác sĩ' },
  { key: 'serviceName', label: 'Dịch vụ' },
  {
    key: 'status',
    label: 'Trạng thái',
    render: (val) => {
      const map = {
        pending: { label: 'Chờ xác nhận', color: '#d97706' },
        confirmed: { label: 'Đã xác nhận', color: '#059669' },
        checked_in: { label: 'Đã check-in', color: '#0891b2' },
        in_progress: { label: 'Đang khám', color: '#7c3aed' },
        completed: { label: 'Hoàn thành', color: '#059669' },
        cancelled: { label: 'Đã hủy', color: '#dc2626' },
      };
      const s = map[val] ?? { label: val, color: '#6b7280' };
      return <span style={{ color: s.color, fontWeight: 600 }}>{s.label}</span>;
    },
  },
];

function DashboardPatient() {
  const [stats, setStats] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getPatientDashboard();
      const payload = res.data?.data || {};

      // Backend returns: totalAppointments, completedAppointments,
      // upcomingAppointments (count), totalSpent, upcomingList (array)
      setStats({
        totalAppointments: payload.totalAppointments ?? 0,
        completedAppointments: payload.completedAppointments ?? 0,
        upcomingAppointments: payload.upcomingAppointments ?? 0,
        totalSpent: payload.totalSpent ?? 0,
      });

      // Map upcoming list from Sequelize model instances
      const rawList = payload.upcomingList ?? [];
      setUpcomingAppointments(
        rawList.map((a) => {
          const raw = a.dataValues || a;
          const doc = raw.doctor?.dataValues || raw.doctor || {};
          const docUser = doc.user?.dataValues || doc.user || {};
          const specialty = doc.specialty?.dataValues || doc.specialty || {};
          const service = raw.service?.dataValues || raw.service || {};
          return {
            date: raw.appointment_date || '—',
            time: raw.appointment_time || '—',
            doctorName: docUser.full_name || doc.title || '—',
            serviceName: service.name || specialty.name || '—',
            status: raw.status,
          };
        })
      );
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) return <LoadingSpinner text="Đang tải dashboard Bệnh nhân..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchAll} />;

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Dashboard Bệnh nhân</h1>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard
          label="Lịch hẹn sắp tới"
          value={stats?.upcomingAppointments}
          color="#2563eb"
          icon="📅"
        />
        <StatCard
          label="Tổng lần khám"
          value={stats?.completedAppointments}
          subtext={`Tổng ${stats?.totalAppointments ?? 0} lịch hẹn`}
          color="#7c3aed"
          icon="🏥"
        />
        <StatCard
          label="Tổng chi phí"
          value={
            stats?.totalSpent != null
              ? `${(stats.totalSpent / 1_000_000).toFixed(1)}M₫`
              : '0₫'
          }
          subtext="Đã thanh toán"
          color="#059669"
          icon="💰"
        />
      </div>

      {/* Next appointment highlight */}
      {upcomingAppointments.length > 0 && (
        <div className="next-appt-card">
          <div className="next-appt-card__label">Lịch hẹn tiếp theo</div>
          <div className="next-appt-card__main">
            <strong>{upcomingAppointments[0].doctorName}</strong>
            {' · '}
            {upcomingAppointments[0].serviceName}
          </div>
          <div className="next-appt-card__time">
            📅 {upcomingAppointments[0].date} — {upcomingAppointments[0].time}
          </div>
        </div>
      )}

      {/* Upcoming appointments table */}
      <section className="dashboard__section">
        <h2 className="section-title">Lịch hẹn sắp tới</h2>
        <DataTable
          columns={APPT_COLUMNS}
          rows={upcomingAppointments}
          emptyText="Không có lịch hẹn sắp tới"
        />
      </section>
    </div>
  );
}

export default DashboardPatient;
