const { Op } = require('sequelize');
const { SalaryConfig, SalarySlip } = require('./salary.model');
const Appointment = require('../appointment/appointment.model');
const DoctorProfile = require('../doctor/doctor.model');
const User = require('../user/user.model');
const Shift = require('../shift/shift.model');
const Roster = require('../roster/roster.model');
const { AppError } = require('../../middlewares/error.middleware');
const { APPOINTMENT_STATUS } = require('../../utils/constants');

// ========================
// HÀM TIỆN ÍCH
// ========================

/**
 * Lấy hệ số bác sĩ từ học hàm/học vị
 * Tìm prefix cao nhất trong chuỗi title (VD: "PGS.TS.BS." → PGS. = 2.5)
 */
function getDoctorCoefficient(title, doctorCoefficients) {
  if (!title) return 1.0;

  // Thứ tự ưu tiên từ cao đến thấp
  const priorityOrder = ['GS.', 'PGS.', 'TS.', 'ThS.', 'BS.'];

  // Kiểm tra alias tên đầy đủ
  const aliasMap = {
    'Giáo sư': 'GS.',
    'Phó giáo sư': 'PGS.',
    'Tiến sỹ': 'TS.',
    'Thạc sỹ': 'ThS.',
    'Đại học': 'BS.',
  };

  for (const [alias, key] of Object.entries(aliasMap)) {
    if (title.includes(alias)) {
      return doctorCoefficients[key] || 1.0;
    }
  }

  // Kiểm tra prefix viết tắt
  for (const prefix of priorityOrder) {
    if (title.includes(prefix)) {
      return doctorCoefficients[prefix] || 1.0;
    }
  }

  return 1.0;
}

/**
 * Tính số giờ giữa 2 chuỗi thời gian "HH:mm"
 */
function calculateHours(startTime, endTime) {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return (eh * 60 + em - sh * 60 - sm) / 60;
}

/**
 * Lấy tên ngày trong tuần từ chuỗi ngày (YYYY-MM-DD)
 */
function getDayOfWeek(dateStr) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const d = new Date(dateStr);
  return days[d.getDay()];
}

// ========================
// SERVICE
// ========================
const salaryService = {
  /**
   * Lấy hoặc tạo cấu hình lương (singleton)
   */
  async getConfig() {
    let config = await SalaryConfig.findOne();
    if (!config) {
      config = await SalaryConfig.create({});
    }
    return config;
  },

  /**
   * Cập nhật cấu hình lương (UC4.1 & UC4.2)
   */
  async updateConfig(data) {
    let config = await SalaryConfig.findOne();
    if (!config) {
      config = await SalaryConfig.create(data);
      return config;
    }

    const updateFields = {};
    if (data.base_hourly_rate !== undefined) updateFields.base_hourly_rate = data.base_hourly_rate;
    if (data.shift_coefficients !== undefined) updateFields.shift_coefficients = data.shift_coefficients;
    if (data.doctor_coefficients !== undefined) updateFields.doctor_coefficients = data.doctor_coefficients;

    await config.update(updateFields);
    return config;
  },

  /**
   * Tính lương cho một ca (demo/test - KHÔNG lưu DB)
   * Input: { doctorTitle, shiftStartTime, shiftEndTime, shiftCoefficient, patients, hourlyRate }
   */
  async calculateShift(data) {
    const {
      doctorTitle,
      shiftStartTime,
      shiftEndTime,
      shiftCoefficient = 1.0,
      patients = [],
      hourlyRate,
    } = data;

    // Lấy config nếu không truyền hourlyRate
    let baseRate = hourlyRate;
    let doctorCoefficients;
    if (!baseRate) {
      const config = await this.getConfig();
      baseRate = parseFloat(config.base_hourly_rate);
      doctorCoefficients = config.doctor_coefficients;
    }

    if (!doctorCoefficients) {
      const config = await this.getConfig();
      doctorCoefficients = config.doctor_coefficients;
    }

    const hours = calculateHours(shiftStartTime, shiftEndTime);
    const doctorCoeff = getDoctorCoefficient(doctorTitle, doctorCoefficients);

    // Tổng hệ số bệnh nhân
    const totalPatientComplexity = patients.reduce(
      (sum, p) => sum + (parseFloat(p.complexityLevel) || 0),
      0
    );

    // Số giờ quy đổi = Số giờ mỗi ca × (Hệ số ca + Tổng hệ số bệnh nhân)
    const convertedHours = hours * (shiftCoefficient + totalPatientComplexity);

    // Tiền làm thêm = Số giờ quy đổi × Hệ số bác sĩ × Số tiền một giờ
    const amount = convertedHours * doctorCoeff * baseRate;

    return {
      doctorTitle,
      doctorCoefficient: doctorCoeff,
      shiftStartTime,
      shiftEndTime,
      shiftHours: hours,
      shiftCoefficient,
      patients: patients.map((p) => ({
        name: p.name || '',
        code: p.code || '',
        complexityLevel: parseFloat(p.complexityLevel) || 0,
      })),
      totalPatientComplexity,
      convertedHours: Math.round(convertedHours * 100) / 100,
      hourlyRate: baseRate,
      amount: Math.round(amount),
    };
  },

  /**
   * Lấy danh sách lịch hẹn của bác sĩ trong tháng (để chỉnh sửa hệ số phức tạp)
   */
  async getAppointments(query) {
    const { doctorProfileId, month, year } = query;

    if (!doctorProfileId || !month || !year) {
      throw new AppError('Vui lòng cung cấp doctorProfileId, month và year', 400);
    }

    // Tính khoảng ngày trong tháng
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const appointments = await Appointment.findAll({
      where: {
        doctor_profile_id: doctorProfileId,
        appointment_date: { [Op.between]: [startDate, endDate] },
      },
      include: [
        { model: User, as: 'patient', attributes: ['id', 'full_name', 'phone'] },
      ],
      order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']],
    });

    return appointments;
  },

  /**
   * Cập nhật hệ số phức tạp cho lịch hẹn (UC4.3)
   */
  async updateComplexity(appointmentId, complexityLevel) {
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      throw new AppError('Không tìm thấy lịch hẹn', 404);
    }

    const level = parseFloat(complexityLevel);
    if (isNaN(level) || level < 0 || level > 0.5) {
      throw new AppError('Hệ số phức tạp phải từ 0 đến 0.5', 400);
    }

    await appointment.update({ complexity_level: level });
    return appointment;
  },

  /**
   * Tạo phiếu lương tháng cho bác sĩ (UC4.4)
   */
  async generateSlip({ doctorProfileId, month, year }) {
    if (!doctorProfileId || !month || !year) {
      throw new AppError('Vui lòng cung cấp doctorProfileId, month và year', 400);
    }

    // 1. Lấy cấu hình lương
    const config = await this.getConfig();
    const baseRate = parseFloat(config.base_hourly_rate);
    const shiftCoefficients = config.shift_coefficients;
    const doctorCoefficients = config.doctor_coefficients;

    // 2. Lấy thông tin bác sĩ
    const doctorProfile = await DoctorProfile.findByPk(doctorProfileId, {
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }],
    });
    if (!doctorProfile) {
      throw new AppError('Không tìm thấy hồ sơ bác sĩ', 404);
    }

    const doctorCoeff = getDoctorCoefficient(doctorProfile.title, doctorCoefficients);

    // 3. Lấy tất cả roster đã duyệt trong tháng
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const rosters = await Roster.findAll({
      where: {
        doctor_profile_id: doctorProfileId,
        roster_date: { [Op.between]: [startDate, endDate] },
        status: 'approved',
      },
      include: [{ model: Shift, as: 'shift' }],
      order: [['roster_date', 'ASC']],
    });

    // 4. Tính lương cho từng ca
    const details = [];
    let totalAmount = 0;
    let totalHours = 0;

    for (const roster of rosters) {
      const shift = roster.shift;
      if (!shift) continue;

      // a. Tính số giờ ca
      const hours = calculateHours(shift.start_time, shift.end_time);

      // b. Lấy hệ số ngày
      const dayOfWeek = getDayOfWeek(roster.roster_date);
      const shiftCoeff = shiftCoefficients[dayOfWeek] || 1.0;

      // c. Lấy các lịch hẹn đã hoàn thành trong ngày đó
      const appointments = await Appointment.findAll({
        where: {
          doctor_profile_id: doctorProfileId,
          appointment_date: roster.roster_date,
          status: APPOINTMENT_STATUS.COMPLETED,
        },
        include: [
          { model: User, as: 'patient', attributes: ['id', 'full_name'] },
        ],
      });

      // d. Tổng hệ số phức tạp bệnh nhân
      const totalComplexity = appointments.reduce(
        (sum, apt) => sum + (parseFloat(apt.complexity_level) || 0),
        0
      );

      // e. Số giờ quy đổi = Số giờ × (Hệ số ca + Tổng hệ số bệnh nhân)
      const convertedHours = hours * (shiftCoeff + totalComplexity);

      // f. Tiền ca = Số giờ quy đổi × Hệ số bác sĩ × Số tiền một giờ
      const shiftAmount = convertedHours * doctorCoeff * baseRate;

      totalAmount += shiftAmount;
      totalHours += hours;

      details.push({
        rosterId: roster.id,
        rosterDate: roster.roster_date,
        shiftName: shift.name,
        shiftStartTime: shift.start_time,
        shiftEndTime: shift.end_time,
        shiftHours: hours,
        dayOfWeek,
        shiftCoefficient: shiftCoeff,
        doctorCoefficient: doctorCoeff,
        patients: appointments.map((apt) => ({
          appointmentId: apt.id,
          patientName: apt.patient ? apt.patient.full_name : '',
          complexityLevel: parseFloat(apt.complexity_level) || 0,
        })),
        totalPatientComplexity: totalComplexity,
        convertedHours: Math.round(convertedHours * 100) / 100,
        hourlyRate: baseRate,
        amount: Math.round(shiftAmount),
      });
    }

    // 5. Tạo hoặc cập nhật phiếu lương
    const [slip, created] = await SalarySlip.findOrCreate({
      where: {
        doctor_profile_id: doctorProfileId,
        month,
        year,
      },
      defaults: {
        total_shifts: rosters.length,
        total_hours: Math.round(totalHours * 100) / 100,
        total_amount: Math.round(totalAmount),
        details,
        status: 'draft',
      },
    });

    if (!created) {
      await slip.update({
        total_shifts: rosters.length,
        total_hours: Math.round(totalHours * 100) / 100,
        total_amount: Math.round(totalAmount),
        details,
        status: 'draft',
      });
    }

    // Trả về kèm thông tin bác sĩ
    const result = await SalarySlip.findByPk(slip.id, {
      include: [
        {
          model: DoctorProfile,
          as: 'doctor',
          include: [{ model: User, as: 'user', attributes: ['full_name', 'email'] }],
        },
      ],
    });

    return result;
  },

  /**
   * Báo cáo lương tháng — tất cả bác sĩ (UC4.5)
   */
  async getMonthlyReport({ month, year }) {
    if (!month || !year) {
      throw new AppError('Vui lòng cung cấp month và year', 400);
    }

    const slips = await SalarySlip.findAll({
      where: { month: parseInt(month), year: parseInt(year) },
      include: [
        {
          model: DoctorProfile,
          as: 'doctor',
          include: [{ model: User, as: 'user', attributes: ['full_name', 'email'] }],
        },
      ],
      order: [['total_amount', 'DESC']],
    });

    // Tổng cộng
    const totalAll = slips.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);

    return {
      month: parseInt(month),
      year: parseInt(year),
      totalDoctors: slips.length,
      totalAmount: Math.round(totalAll),
      slips,
    };
  },

  /**
   * Báo cáo lương năm của một bác sĩ (UC4.6)
   */
  async getDoctorYearlyReport({ doctorProfileId, year }) {
    if (!doctorProfileId || !year) {
      throw new AppError('Vui lòng cung cấp doctorProfileId và year', 400);
    }

    // Lấy thông tin bác sĩ
    const doctorProfile = await DoctorProfile.findByPk(doctorProfileId, {
      include: [{ model: User, as: 'user', attributes: ['full_name', 'email'] }],
    });
    if (!doctorProfile) {
      throw new AppError('Không tìm thấy hồ sơ bác sĩ', 404);
    }

    const slips = await SalarySlip.findAll({
      where: {
        doctor_profile_id: doctorProfileId,
        year: parseInt(year),
      },
      order: [['month', 'ASC']],
    });

    // Tạo mảng 12 tháng, fill 0 cho tháng chưa có dữ liệu
    const slipMap = {};
    slips.forEach((s) => { slipMap[s.month] = s; });

    const monthlyData = [];
    let yearTotal = 0;
    let yearShifts = 0;
    let yearHours = 0;

    for (let m = 1; m <= 12; m++) {
      const slip = slipMap[m];
      const amount = slip ? parseFloat(slip.total_amount || 0) : 0;
      const shifts = slip ? slip.total_shifts : 0;
      const hours = slip ? parseFloat(slip.total_hours || 0) : 0;

      yearTotal += amount;
      yearShifts += shifts;
      yearHours += hours;

      monthlyData.push({
        month: m,
        totalShifts: shifts,
        totalHours: Math.round(hours * 100) / 100,
        totalAmount: Math.round(amount),
        status: slip ? slip.status : null,
        slipId: slip ? slip.id : null,
      });
    }

    return {
      doctor: {
        id: doctorProfile.id,
        fullName: doctorProfile.user ? doctorProfile.user.full_name : '',
        email: doctorProfile.user ? doctorProfile.user.email : '',
        title: doctorProfile.title,
      },
      year: parseInt(year),
      yearTotalAmount: Math.round(yearTotal),
      yearTotalShifts: yearShifts,
      yearTotalHours: Math.round(yearHours * 100) / 100,
      monthlyData,
    };
  },

  /**
   * Báo cáo lương năm — tất cả bác sĩ (UC4.7)
   */
  async getAllDoctorsYearlyReport({ year }) {
    if (!year) {
      throw new AppError('Vui lòng cung cấp year', 400);
    }

    // Lấy tất cả phiếu lương trong năm
    const slips = await SalarySlip.findAll({
      where: { year: parseInt(year) },
      include: [
        {
          model: DoctorProfile,
          as: 'doctor',
          include: [{ model: User, as: 'user', attributes: ['full_name', 'email'] }],
        },
      ],
      order: [['doctor_profile_id', 'ASC'], ['month', 'ASC']],
    });

    // Nhóm theo bác sĩ
    const doctorMap = {};
    slips.forEach((slip) => {
      const dpId = slip.doctor_profile_id;
      if (!doctorMap[dpId]) {
        doctorMap[dpId] = {
          doctor: {
            id: dpId,
            fullName: slip.doctor && slip.doctor.user ? slip.doctor.user.full_name : '',
            email: slip.doctor && slip.doctor.user ? slip.doctor.user.email : '',
            title: slip.doctor ? slip.doctor.title : '',
          },
          monthlyData: {},
          yearTotalAmount: 0,
          yearTotalShifts: 0,
          yearTotalHours: 0,
        };
      }

      const amount = parseFloat(slip.total_amount || 0);
      const hours = parseFloat(slip.total_hours || 0);

      doctorMap[dpId].monthlyData[slip.month] = {
        month: slip.month,
        totalShifts: slip.total_shifts,
        totalHours: Math.round(hours * 100) / 100,
        totalAmount: Math.round(amount),
        status: slip.status,
      };
      doctorMap[dpId].yearTotalAmount += amount;
      doctorMap[dpId].yearTotalShifts += slip.total_shifts;
      doctorMap[dpId].yearTotalHours += hours;
    });

    // Chuyển sang mảng và fill đủ 12 tháng
    const doctors = Object.values(doctorMap).map((entry) => {
      const monthly = [];
      for (let m = 1; m <= 12; m++) {
        monthly.push(
          entry.monthlyData[m] || {
            month: m,
            totalShifts: 0,
            totalHours: 0,
            totalAmount: 0,
            status: null,
          }
        );
      }
      return {
        doctor: entry.doctor,
        yearTotalAmount: Math.round(entry.yearTotalAmount),
        yearTotalShifts: entry.yearTotalShifts,
        yearTotalHours: Math.round(entry.yearTotalHours * 100) / 100,
        monthlyData: monthly,
      };
    });

    // Sắp xếp theo tổng lương giảm dần
    doctors.sort((a, b) => b.yearTotalAmount - a.yearTotalAmount);

    const grandTotal = doctors.reduce((sum, d) => sum + d.yearTotalAmount, 0);

    return {
      year: parseInt(year),
      totalDoctors: doctors.length,
      grandTotalAmount: Math.round(grandTotal),
      doctors,
    };
  },
};

module.exports = salaryService;
