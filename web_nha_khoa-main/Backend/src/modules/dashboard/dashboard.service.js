const dashboardRepository = require('./dashboard.repository');
const doctorRepository = require('../doctor/doctor.repository');
const { AppError } = require('../../middlewares/error.middleware');
const { ROLES } = require('../../utils/constants');
const dayjs = require('dayjs');

const getDefaultDateRange = (query = {}) => {
  let startDate = query.startDate;
  let endDate = query.endDate;
  const groupBy = query.groupBy || 'day';

  if (!startDate || !endDate) {
    if (query.period === 'month') {
      startDate = dayjs().startOf('month').format('YYYY-MM-DD');
      endDate = dayjs().endOf('month').format('YYYY-MM-DD');
    } else if (query.period === 'week') {
      startDate = dayjs().startOf('week').format('YYYY-MM-DD');
      endDate = dayjs().endOf('week').format('YYYY-MM-DD');
    } else if (query.period === 'year') {
      startDate = dayjs().startOf('year').format('YYYY-MM-DD');
      endDate = dayjs().endOf('year').format('YYYY-MM-DD');
    } else {
      // Default to last 30 days up to today if nothing specified
      endDate = dayjs().format('YYYY-MM-DD');
      startDate = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
    }
  }

  return { startDate, endDate, groupBy };
};

const dashboardService = {
  // --------------------
  // ADMIN DASHBOARD
  // --------------------
  async getAdminDashboard(query) {
    const { startDate, endDate, groupBy } = getDefaultDateRange(query);

    const [overview, revenueChart, appointmentChart, topDoctors, specialtyDistribution, recentAppointments] =
      await Promise.all([
        dashboardRepository.getAdminOverview({ startDate, endDate }),
        dashboardRepository.getRevenueChart({ startDate, endDate, groupBy }),
        dashboardRepository.getAppointmentChart({ startDate, endDate }),
        dashboardRepository.getTopDoctors({ startDate, endDate, limit: 5 }),
        dashboardRepository.getSpecialtyDistribution({ startDate, endDate }),
        dashboardRepository.getRecentAppointments(10),
      ]);

    return {
      period: { startDate, endDate },
      overview,
      charts: {
        revenue: revenueChart,
        appointments: appointmentChart,
        specialtyDistribution,
      },
      topDoctors,
      recentAppointments,
    };
  },

  // --------------------
  // DOCTOR DASHBOARD
  // --------------------
  async getDoctorDashboard(userId, query) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) throw new AppError('Không tìm thấy hồ sơ bác sĩ', 404);

    const { startDate, endDate } = getDefaultDateRange(query);

    const stats = await dashboardRepository.getDoctorStats(doctor.id, { startDate, endDate });

    return {
      period: { startDate, endDate },
      doctorProfile: {
        id: doctor.id,
        title: doctor.title,
        ratingAvg: doctor.rating_avg,
        ratingCount: doctor.rating_count,
        isAvailable: doctor.is_available,
      },
      stats,
    };
  },

  // --------------------
  // RECEPTIONIST DASHBOARD
  // --------------------
  async getReceptionistDashboard(query) {
    const { startDate, endDate } = getDefaultDateRange(query);
    return dashboardRepository.getReceptionistStats({ startDate, endDate });
  },

  // --------------------
  // PATIENT DASHBOARD
  // --------------------
  async getPatientDashboard(userId) {
    return dashboardRepository.getPatientStats(userId);
  },

  // --------------------
  // ROUTE theo role
  // --------------------
  async getDashboard(requestUser, query) {
    switch (requestUser.role) {
      case ROLES.ADMIN:
        return this.getAdminDashboard(query);
      case ROLES.DOCTOR:
        return this.getDoctorDashboard(requestUser.id, query);
      case ROLES.RECEPTIONIST:
        return this.getReceptionistDashboard(query);
      case ROLES.PATIENT:
        return this.getPatientDashboard(requestUser.id);
      default:
        throw new AppError('Role không hợp lệ', 403);
    }
  },
};

module.exports = dashboardService;
