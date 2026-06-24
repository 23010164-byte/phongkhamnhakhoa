import { create } from 'zustand';
import doctorApi from '../api/doctor.api';
import userApi from '../api/user.api';

const useDoctorStore = create((set, get) => ({
  // ── Public list ───────────────────────────────────────────────────────────
  doctors: [],
  doctorTotal: 0,
  doctorPage: 1,
  doctorLimit: 12,
  specialties: [],
  listLoading: false,
  listError: null,

  fetchDoctors: async (params = {}) => {
    set({ listLoading: true, listError: null });
    try {
      const { page = 1, limit = 12, search = '', specialtyId = '', specialty = '', status = '' } = params;
      const res = await doctorApi.getDoctors({
        page,
        limit,
        search,
        specialtyId: specialtyId || specialty,
        status,
      });
      set({
        doctors: Array.isArray(res.data.items)
          ? res.data.items
          : Array.isArray(res.data.data)
            ? res.data.data
            : Array.isArray(res.data)
              ? res.data
              : [],
        doctorTotal: res.data.meta?.total ?? res.data.total ?? 0,
        doctorPage: page,
        doctorLimit: limit,
        listLoading: false,
      });
    } catch (err) {
      set({ listError: err.response?.data?.message ?? 'Không thể tải danh sách bác sĩ.', listLoading: false });
    }
  },

  fetchSpecialties: async () => {
    try {
      const res = await doctorApi.getSpecialties();
      set({
        specialties: Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [],
      });
    } catch (_) {}
  },

  clearListError: () => set({ listError: null }),

  // ── Public detail + slots ─────────────────────────────────────────────────
  selectedDoctor: null,
  selectedDoctorLoading: false,
  selectedDoctorError: null,

  slots: [],            // available slots for a given date
  slotsLoading: false,
  slotsDate: null,

  fetchDoctorById: async (id) => {
    set({ selectedDoctorLoading: true, selectedDoctorError: null, selectedDoctor: null });
    try {
      const res = await doctorApi.getDoctorById(id);
      set({ selectedDoctor: res.data.data ?? res.data, selectedDoctorLoading: false });
    } catch (err) {
      set({
        selectedDoctorError: err.response?.data?.message ?? 'Không thể tải thông tin bác sĩ.',
        selectedDoctorLoading: false,
      });
    }
  },

  fetchSlots: async (doctorId, date) => {
    set({ slotsLoading: true, slotsDate: date, slots: [] });
    try {
      const res = await doctorApi.getDoctorSlots(doctorId, date);
      set({ slots: res.data ?? [], slotsLoading: false });
    } catch (_) {
      set({ slots: [], slotsLoading: false });
    }
  },

  clearSelectedDoctor: () =>
    set({ selectedDoctor: null, selectedDoctorError: null, slots: [], slotsDate: null }),

  // ── Doctor own profile ────────────────────────────────────────────────────
  myProfile: null,
  myProfileLoading: false,
  myProfileError: null,

  fetchMyProfile: async () => {
    set({ myProfileLoading: true, myProfileError: null });
    try {
      const res = await doctorApi.getMyProfile();
      set({ myProfile: res.data.data ?? res.data, myProfileLoading: false });
    } catch (err) {
      set({
        myProfileError: err.response?.data?.message ?? 'Không thể tải hồ sơ.',
        myProfileLoading: false,
      });
    }
  },

  updateMyProfile: async (data) => {
    set({ myProfileLoading: true, myProfileError: null });
    try {
      const res = await doctorApi.updateMyProfile(data);
      set({ myProfile: res.data.data ?? res.data, myProfileLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message ?? 'Cập nhật thất bại.';
      set({ myProfileError: message, myProfileLoading: false });
      return { success: false, message };
    }
  },

  clearMyProfileError: () => set({ myProfileError: null }),

  // ── Schedule ──────────────────────────────────────────────────────────────
  schedule: [],         // array of { date, slots: [] }
  scheduleLoading: false,
  scheduleError: null,
  scheduleRange: { from: null, to: null },

  fetchMySchedule: async (from, to) => {
    set({ scheduleLoading: true, scheduleError: null, scheduleRange: { from, to } });
    try {
      const res = await doctorApi.getMySchedule(from, to);
      const data = res.data?.data ?? res.data ?? [];
      set({ schedule: Array.isArray(data) ? data : [], scheduleLoading: false });
    } catch (err) {
      set({
        scheduleError: err.response?.data?.message ?? 'Không thể tải lịch làm việc.',
        scheduleLoading: false,
      });
    }
  },

  upsertSchedule: async (data) => {
    try {
      const res = await doctorApi.upsertSchedule(data);
      // Merge returned slots into local schedule
      const updated = res.data?.data ?? res.data; // { date, slots }
      set((state) => {
        const exists = state.schedule.find((s) => s.date === updated.date);
        return {
          schedule: exists
            ? state.schedule.map((s) => (s.date === updated.date ? updated : s))
            : [...state.schedule, updated],
        };
      });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message ?? 'Lưu lịch thất bại.' };
    }
  },

  deleteSlot: async (slotId, date) => {
    try {
      await doctorApi.deleteSlot(slotId);
      set((state) => ({
        schedule: state.schedule.map((s) =>
          s.date === date
            ? { ...s, slots: s.slots.filter((sl) => sl.id !== slotId) }
            : s
        ),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message ?? 'Xoá slot thất bại.' };
    }
  },

  clearScheduleError: () => set({ scheduleError: null }),

  createDoctor: async (data) => {
    try {
      // 1. Tạo tài khoản người dùng với vai trò là doctor
      const userRes = await userApi.createUser({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
        gender: data.gender || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        role: 'doctor',
      });
      
      const createdUser = userRes.data.data ?? userRes.data;
      const userId = createdUser.id;
      
      // 2. Tạo hồ sơ bác sĩ (doctor profile) liên kết với userId mới tạo
      const doctorRes = await doctorApi.createDoctorProfile({
        userId,
        specialtyId: data.specialtyId || undefined,
        title: data.title || undefined,
        experienceYears: data.experienceYears ? parseInt(data.experienceYears) : 0,
        education: data.education || undefined,
        certificate: data.certificate || undefined,
        consultationFee: data.consultationFee ? parseFloat(data.consultationFee) : 0,
        workingDays: data.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        workingStart: data.workingStart || '08:00',
        workingEnd: data.workingEnd || '17:00',
        slotDurationMinutes: data.slotDurationMinutes ? parseInt(data.slotDurationMinutes) : 30,
        maxPatientsPerDay: data.maxPatientsPerDay ? parseInt(data.maxPatientsPerDay) : 20,
      });

      // Refresh danh sách bác sĩ sau khi tạo
      const state = get();
      state.fetchDoctors({ page: state.doctorPage, limit: state.doctorLimit });
      
      return { success: true, data: doctorRes.data.data ?? doctorRes.data };
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      const message = apiErrors && Array.isArray(apiErrors)
        ? apiErrors.map(e => e.message || e.msg).join(', ')
        : (err.response?.data?.message ?? err.message ?? 'Tạo hồ sơ bác sĩ thất bại.');
      return { success: false, message };
    }
  },

  updateDoctor: async (id, data) => {
    try {
      // Gọi API cập nhật thông tin bác sĩ (bao gồm cả user info và doctor profile info)
      const res = await doctorApi.updateDoctorProfile(id, {
        fullName: data.fullName,
        phone: data.phone || undefined,
        gender: data.gender || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        specialtyId: data.specialtyId || undefined,
        title: data.title || undefined,
        experienceYears: data.experienceYears ? parseInt(data.experienceYears) : 0,
        consultationFee: data.consultationFee ? parseFloat(data.consultationFee) : 0,
      });

      // Refresh danh sách bác sĩ
      const state = get();
      state.fetchDoctors({ page: state.doctorPage, limit: state.doctorLimit });
      
      return { success: true, data: res.data.data ?? res.data };
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      const message = apiErrors && Array.isArray(apiErrors)
        ? apiErrors.map(e => e.message || e.msg).join(', ')
        : (err.response?.data?.message ?? err.message ?? 'Cập nhật hồ sơ bác sĩ thất bại.');
      return { success: false, message };
    }
  },
}));

export default useDoctorStore;
