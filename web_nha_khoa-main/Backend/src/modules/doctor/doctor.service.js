const doctorRepository = require('./doctor.repository');
const userRepository = require('../user/user.repository');
const DoctorSlot = require('./slot.model');
const { Op } = require('sequelize');
const { AppError } = require('../../middlewares/error.middleware');
const { getPagination } = require('../../utils/helpers');
const { ROLES } = require('../../utils/constants');

const doctorService = {
  async getAllDoctors(query) {
    const { page, limit, offset } = getPagination(query);
    const { specialtyId, isAvailable, search, day } = query;

    return doctorRepository.findAll({
      page, limit, offset,
      specialtyId,
      isAvailable: typeof isAvailable !== 'undefined' ? isAvailable === 'true' : undefined,
      search,
      day,
    });
  },

  async getDoctorById(id) {
    const doctor = await doctorRepository.findById(id);
    if (!doctor) throw new AppError('Không tìm thấy bác sĩ', 404);
    return doctor;
  },

  async getDoctorByUserId(userId) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) throw new AppError('Không tìm thấy hồ sơ bác sĩ', 404);
    return doctor;
  },

  async createDoctorProfile(data) {
    const { userId, specialtyId, title, bio, experienceYears, education, certificate,
      consultationFee, workingDays, workingStart, workingEnd, slotDurationMinutes, maxPatientsPerDay } = data;

    // Kiểm tra user tồn tại và là doctor
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('Không tìm thấy người dùng', 404);
    if (user.role !== ROLES.DOCTOR) throw new AppError('Người dùng này không phải bác sĩ', 400);

    // Kiểm tra đã có profile chưa
    const existing = await doctorRepository.findByUserId(userId);
    if (existing) throw new AppError('Bác sĩ này đã có hồ sơ', 409);

    return doctorRepository.create({
      user_id: userId,
      specialty_id: specialtyId,
      title,
      bio,
      experience_years: experienceYears,
      education,
      certificate,
      consultation_fee: consultationFee,
      working_days: workingDays || [],
      working_start: workingStart || '08:00',
      working_end: workingEnd || '17:00',
      slot_duration_minutes: slotDurationMinutes || 30,
      max_patients_per_day: maxPatientsPerDay,
      is_available: true,
    });
  },

  async updateDoctorProfile(id, data, requestUser) {
    const doctor = await doctorRepository.findById(id);
    if (!doctor) throw new AppError('Không tìm thấy hồ sơ bác sĩ', 404);

    // Doctor chỉ được sửa profile của chính mình
    if (requestUser.role === ROLES.DOCTOR && doctor.user_id !== requestUser.id) {
      throw new AppError('Bạn không có quyền sửa hồ sơ này', 403);
    }

    const { specialtyId, title, bio, experienceYears, education, certificate,
      consultationFee, workingDays, workingStart, workingEnd, slotDurationMinutes, maxPatientsPerDay } = data;

    return doctorRepository.update(id, {
      specialty_id: specialtyId,
      title,
      bio,
      experience_years: experienceYears,
      education,
      certificate,
      consultation_fee: consultationFee,
      working_days: workingDays,
      working_start: workingStart,
      working_end: workingEnd,
      slot_duration_minutes: slotDurationMinutes,
      max_patients_per_day: maxPatientsPerDay,
    });
  },

  // Bác sĩ tự cập nhật profile của mình
  async updateMyProfile(userId, data) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) throw new AppError('Không tìm thấy hồ sơ bác sĩ', 404);

    const { title, bio, experienceYears, education, certificate,
      consultationFee, workingDays, workingStart, workingEnd, slotDurationMinutes, maxPatientsPerDay } = data;

    return doctorRepository.updateByUserId(userId, {
      title,
      bio,
      experience_years: experienceYears,
      education,
      certificate,
      consultation_fee: consultationFee,
      working_days: workingDays,
      working_start: workingStart,
      working_end: workingEnd,
      slot_duration_minutes: slotDurationMinutes,
      max_patients_per_day: maxPatientsPerDay,
    });
  },

  async toggleAvailability(id) {
    const doctor = await doctorRepository.findById(id);
    if (!doctor) throw new AppError('Không tìm thấy bác sĩ', 404);
    return doctorRepository.update(id, { is_available: !doctor.is_available });
  },

  async getAvailableSlots(doctorProfileId, date) {
    if (!date) throw new AppError('Vui lòng cung cấp ngày khám', 400);

    const dayjs = require('dayjs');
    const today = dayjs().startOf('day');
    const targetDate = dayjs(date).startOf('day');
    if (targetDate.isBefore(today)) {
      throw new AppError('Không thể xem lịch trong quá khứ', 400);
    }

    const Roster = require('../roster/roster.model');
    const Shift = require('../shift/shift.model');
    const Appointment = require('../appointment/appointment.model');
    const { APPOINTMENT_STATUS } = require('../../utils/constants');

    // 1. Get approved rosters for this doctor on this date
    const rosters = await Roster.findAll({
      where: {
        doctor_profile_id: doctorProfileId,
        roster_date: date,
        status: 'approved'
      },
      include: [{ model: Shift, as: 'shift' }]
    });

    if (rosters.length === 0) {
      return []; // No shift registered for this day
    }

    // 2. Find booked appointments
    const booked = await Appointment.findAll({
      where: {
        doctor_profile_id: doctorProfileId,
        appointment_date: date,
        status: {
          [Op.notIn]: [
            APPOINTMENT_STATUS.CANCELLED,
            APPOINTMENT_STATUS.NO_SHOW,
          ],
        },
      },
      attributes: ['appointment_time'],
      raw: true,
    });
    const bookedTimes = new Set(booked.map((a) => a.appointment_time));

    // 3. Generate slots
    const doctor = await doctorRepository.findById(doctorProfileId);
    const slotDuration = doctor.slot_duration_minutes || 30;
    const { parseTime } = require('../../utils/helpers');

    const generatedSlots = [];
    for (const roster of rosters) {
      const shift = roster.shift;
      if (!shift || !shift.start_time || !shift.end_time) continue;

      const { hours: startH, minutes: startM } = parseTime(shift.start_time);
      const { hours: endH, minutes: endM } = parseTime(shift.end_time);
      let current = startH * 60 + startM;
      const end = endH * 60 + endM;

      while (current + slotDuration <= end) {
        const h = String(Math.floor(current / 60)).padStart(2, '0');
        const m = String(current % 60).padStart(2, '0');
        const timeStr = `${h}:${m}`;
        
        generatedSlots.push({
          time: timeStr,
          isBooked: bookedTimes.has(timeStr)
        });
        current += slotDuration;
      }
    }

    // Sort slots by time
    generatedSlots.sort((a, b) => a.time.localeCompare(b.time));

    return generatedSlots;
  },

  async getDoctorRosters(doctorProfileId, fromDate, toDate) {
    if (!fromDate || !toDate) {
      throw new AppError('Vui lòng cung cấp từ ngày và đến ngày', 400);
    }

    const Roster = require('../roster/roster.model');
    const Shift = require('../shift/shift.model');

    const rosters = await Roster.findAll({
      where: {
        doctor_profile_id: doctorProfileId,
        roster_date: {
          [Op.between]: [fromDate, toDate]
        },
        status: 'approved'
      },
      include: [{ model: Shift, as: 'shift' }],
      order: [['roster_date', 'ASC']]
    });

    // Group by date
    const grouped = {};
    for (const r of rosters) {
      if (!r.shift) continue;
      const date = r.roster_date;
      if (!grouped[date]) {
        grouped[date] = { date, shifts: [] };
      }
      grouped[date].shifts.push({
        name: r.shift.name,
        startTime: r.shift.start_time,
        endTime: r.shift.end_time
      });
    }

    return Object.values(grouped);
  },

  async getMySchedule(userId, from, to) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) throw new AppError('Không tìm thấy hồ sơ bác sĩ', 404);

    const slots = await DoctorSlot.findAll({
      where: {
        doctor_profile_id: doctor.id,
        date: { [Op.between]: [from, to] }
      },
      order: [['date', 'ASC'], ['start_time', 'ASC']]
    });

    const scheduleMap = {};
    slots.forEach(slot => {
      const d = slot.date;
      if (!scheduleMap[d]) {
        scheduleMap[d] = [];
      }
      scheduleMap[d].push({
        id: slot.id,
        startTime: slot.start_time,
        endTime: slot.end_time,
        maxPatients: slot.max_patients,
        status: slot.status
      });
    });

    const dayjs = require('dayjs');
    const result = [];
    let curr = dayjs(from);
    const end = dayjs(to);
    while (curr.isBefore(end) || curr.isSame(end)) {
      const dateStr = curr.format('YYYY-MM-DD');
      result.push({
        date: dateStr,
        slots: scheduleMap[dateStr] || []
      });
      curr = curr.add(1, 'day');
    }

    return result;
  },

  async upsertSchedule(userId, data) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) throw new AppError('Không tìm thấy hồ sơ bác sĩ', 404);

    const { date, slots } = data; // slots is [{ startTime, endTime, maxPatients }]
    if (!date) throw new AppError('Vui lòng cung cấp ngày', 400);
    
    const dayjs = require('dayjs');
    const isoWeek = require('dayjs/plugin/isoWeek');
    dayjs.extend(isoWeek);

    if (dayjs(date).format('dddd').toLowerCase() === 'sunday') {
      throw new AppError('Không thể đăng ký lịch làm việc vào Chủ Nhật vì phòng khám nghỉ', 400);
    }

    if (!Array.isArray(slots) || slots.length === 0) throw new AppError('slots phải là mảng và không được rỗng', 400);

    // 1. Kiểm tra giới hạn 56 giờ/tuần
    const startOfWeek = dayjs(date).startOf('isoWeek').format('YYYY-MM-DD');
    const endOfWeek = dayjs(date).endOf('isoWeek').format('YYYY-MM-DD');

    const weekSlots = await DoctorSlot.findAll({
      where: {
        doctor_profile_id: doctor.id,
        date: { [Op.between]: [startOfWeek, endOfWeek] }
      }
    });

    let currentHours = 0;
    for (const s of weekSlots) {
      // Nếu slot này đang được update (trùng startTime và date), bỏ qua để tính lại
      const isBeingUpdated = slots.some(newSlot => newSlot.startTime === s.start_time && date === s.date);
      if (!isBeingUpdated) {
        const start = dayjs(`2000-01-01 ${s.start_time}`);
        const end = dayjs(`2000-01-01 ${s.end_time}`);
        currentHours += end.diff(start, 'hour', true);
      }
    }

    let newHours = 0;
    for (const slot of slots) {
      const start = dayjs(`2000-01-01 ${slot.startTime}`);
      const end = dayjs(`2000-01-01 ${slot.endTime}`);
      newHours += end.diff(start, 'hour', true);
    }

    if (currentHours + newHours > 56) {
      throw new AppError(`Bạn đã vượt quá giới hạn 56 giờ làm việc/tuần. Tổng số giờ nếu thêm ca này sẽ là ${currentHours + newHours} giờ.`, 400);
    }

    // 2. Kiểm tra số lượng tối đa 3 bác sĩ trong 1 ca
    for (const slot of slots) {
      const overlappingDoctorsCount = await DoctorSlot.count({
        where: {
          date,
          doctor_profile_id: { [Op.ne]: doctor.id },
          start_time: { [Op.lt]: slot.endTime },
          end_time: { [Op.gt]: slot.startTime }
        },
        distinct: true,
        col: 'doctor_profile_id'
      });

      if (overlappingDoctorsCount >= 3) {
        let ca = 'Ca này';
        if (slot.startTime === '08:00' && slot.endTime === '14:00') ca = 'Ca Sáng';
        else if (slot.startTime === '14:00' && slot.endTime === '20:00') ca = 'Ca Chiều';
        else if (slot.startTime === '08:00' && slot.endTime === '20:00') ca = 'Ca Full ngày';

        throw new AppError(`${ca} ngày ${dayjs(date).format('DD/MM/YYYY')} đã đạt giới hạn tối đa 3 bác sĩ. Vui lòng chọn ca khác.`, 400);
      }
    }

    for (const slot of slots) {
      const [record, created] = await DoctorSlot.findOrCreate({
        where: {
          doctor_profile_id: doctor.id,
          date,
          start_time: slot.startTime
        },
        defaults: {
          end_time: slot.endTime,
          max_patients: slot.maxPatients || 1,
          status: 'available'
        }
      });
      
      if (!created) {
        if (record.status !== 'booked') {
          record.end_time = slot.endTime;
          record.max_patients = slot.maxPatients || 1;
          await record.save();
        }
      }
    }

    const allSlots = await DoctorSlot.findAll({
      where: { doctor_profile_id: doctor.id, date },
      order: [['start_time', 'ASC']]
    });

    return {
      date,
      slots: allSlots.map(s => ({
        id: s.id,
        startTime: s.start_time,
        endTime: s.end_time,
        maxPatients: s.max_patients,
        status: s.status
      }))
    };
  },

  async deleteSlot(userId, slotId) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) throw new AppError('Không tìm thấy hồ sơ bác sĩ', 404);

    const slot = await DoctorSlot.findOne({
      where: { id: slotId, doctor_profile_id: doctor.id }
    });
    if (!slot) throw new AppError('Không tìm thấy slot', 404);
    if (slot.status === 'booked') {
      throw new AppError('Không thể xoá slot đã được đặt hẹn', 400);
    }

    await slot.destroy();
    return true;
  },
};

module.exports = doctorService;

