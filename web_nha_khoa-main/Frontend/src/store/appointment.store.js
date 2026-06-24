import { create } from 'zustand';
import appointmentApi from '../api/appointment.api';

const useAppointmentStore = create((set, get) => ({
  // List
  appointments: [],
  listLoading: false,
  listError: null,
  listFilters: { status: '', role: '', page: 1, limit: 10, search: '' },
  pagination: { total: 0, page: 1, totalPages: 1 },

  // Detail
  currentAppointment: null,
  detailLoading: false,
  detailError: null,

  // Booking
  doctors: [],
  doctorsLoading: false,
  doctorRosters: [],
  rostersLoading: false,
  slots: [],
  slotsLoading: false,
  bookingLoading: false,
  bookingError: null,

  // Actions
  setListFilters: (filters) =>
    set((s) => ({ listFilters: { ...s.listFilters, ...filters } })),

  fetchAppointments: async () => {
    set({ listLoading: true, listError: null });
    try {
      const res = await appointmentApi.getAppointments(get().listFilters);
      const payload = res.data;
      const items = payload?.data?.items ?? payload?.data ?? payload ?? [];
      const total = payload?.data?.total ?? payload?.total ?? (Array.isArray(items) ? items.length : 0);
      const page = get().listFilters.page;
      const limit = get().listFilters.limit;
      set({
        appointments: Array.isArray(items) ? items : [],
        pagination: { total, page, totalPages: Math.ceil(total / limit) || 1 },
        listLoading: false,
      });
    } catch (err) {
      set({ listLoading: false, listError: err?.response?.data?.message || err.message || 'Không thể tải danh sách lịch hẹn' });
    }
  },

  fetchAppointmentById: async (id) => {
    set({ detailLoading: true, detailError: null });
    try {
      const res = await appointmentApi.getAppointmentById(id);
      set({ currentAppointment: res.data?.data ?? res.data ?? res, detailLoading: false });
    } catch (err) {
      set({ detailLoading: false, detailError: err.message || 'Không thể tải thông tin lịch hẹn' });
    }
  },

  fetchDoctors: async (params) => {
    set({ doctorsLoading: true });
    try {
      const res = await appointmentApi.getDoctors(params);
      const payload = res.data?.data ?? res.data ?? res;
      const items = Array.isArray(payload) ? payload : (payload?.items ?? []);
      const mappedDoctors = items.map(d => ({
        ...d,
        id: d.id || d._id,
        fullName: d.user?.full_name || d.fullName || d.user?.fullName,
        specialization: d.specialty?.name || d.specialization,
        experience: d.experience_years || d.experience,
      }));
      set({ doctors: mappedDoctors, doctorsLoading: false });
    } catch {
      set({ doctorsLoading: false });
    }
  },

  fetchSlots: async (doctorId, date) => {
    set({ slotsLoading: true, slots: [] });
    try {
      const res = await appointmentApi.getDoctorSlots(doctorId, date);
      const payload = res.data?.data ?? res.data ?? res;
      const slotItems = Array.isArray(payload) ? payload : (payload?.items ?? []);
      const mappedSlots = slotItems.map(s => ({
        id: s.id || s._id || s.time,
        time: s.time,
        available: !s.isBooked && !s.is_booked
      }));
      set({ slots: mappedSlots, slotsLoading: false });
    } catch {
      set({ slotsLoading: false });
    }
  },

  fetchDoctorRosters: async (doctorId, from, to) => {
    set({ rostersLoading: true });
    try {
      const res = await appointmentApi.getDoctorRosters(doctorId, from, to);
      const data = res.data?.data ?? res.data ?? [];
      set({ doctorRosters: Array.isArray(data) ? data : [], rostersLoading: false });
    } catch {
      set({ doctorRosters: [], rostersLoading: false });
    }
  },

  createAppointment: async (payload) => {
    set({ bookingLoading: true, bookingError: null });
    try {
      const mappedPayload = {
        doctorProfileId: payload.doctorId,
        appointmentDate: payload.date,
        appointmentTime: payload.slotId || payload.time || payload.slotTime,
        reason: payload.reason,
        notes: payload.notes,
        patientId: payload.patientId,
      };
      const res = await appointmentApi.createAppointment(mappedPayload);
      set({ bookingLoading: false });
      return { success: true, data: res.data?.data ?? res.data ?? res };
    } catch (err) {
      set({ bookingLoading: false, bookingError: err?.response?.data?.message || err?.response?.data?.errors?.[0]?.msg || err.message || 'Đặt lịch thất bại' });
      return { success: false, error: err.message };
    }
  },

  performAction: async (action, id, extra = {}) => {
    set({ detailLoading: true });
    try {
      let res;
      switch (action) {
        case 'confirm': res = await appointmentApi.confirmAppointment(id); break;
        case 'cancel': res = await appointmentApi.cancelAppointment(id, extra.reason); break;
        case 'checkin': res = await appointmentApi.checkInAppointment(id); break;
        case 'complete': res = await appointmentApi.completeAppointment(id, extra.notes); break;
        default: throw new Error('Unknown action');
      }
      set({ currentAppointment: res.data?.data ?? res.data ?? res, detailLoading: false });
      return { success: true };
    } catch (err) {
      set({ detailLoading: false });
      return { success: false, error: err.response?.data?.message || err.message };
    }
  },

  clearBookingError: () => set({ bookingError: null }),
  clearDetail: () => set({ currentAppointment: null, detailError: null }),
}));

export default useAppointmentStore;
