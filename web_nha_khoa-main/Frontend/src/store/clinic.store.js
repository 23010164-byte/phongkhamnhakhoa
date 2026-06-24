import { create } from 'zustand';
import holidayApi from '../api/holiday.api';
import shiftApi from '../api/shift.api';
import rosterApi from '../api/roster.api';

const useClinicStore = create((set, get) => ({
  // --- HOLIDAYS ---
  holidays: [],
  holidayLoading: false,
  holidayError: null,
  holidayPagination: { total: 0, page: 1, limit: 10 },
  holidayFilters: { type: '', isActive: '', page: 1, limit: 10 },
  
  fetchHolidays: async () => {
    try {
      set({ holidayLoading: true, holidayError: null });
      const { holidayFilters } = get();
      const res = await holidayApi.getHolidays(holidayFilters);
      set({
        holidays: res.data?.data?.items || res.data?.data || [],
        holidayPagination: res.data?.meta || { total: 0, page: 1, limit: 10 },
        holidayLoading: false
      });
    } catch (error) {
      set({ holidayError: error.response?.data?.message || 'Lỗi khi tải danh sách ngày nghỉ', holidayLoading: false });
    }
  },
  
  setHolidayFilters: (filters) => {
    set((state) => ({ holidayFilters: { ...state.holidayFilters, ...filters } }));
    get().fetchHolidays();
  },

  createHoliday: async (data) => {
    set({ holidayLoading: true, holidayError: null });
    try {
      await holidayApi.createHoliday(data);
      await get().fetchHolidays();
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Lỗi khi tạo ngày nghỉ';
      set({ holidayError: msg, holidayLoading: false });
      return { success: false, message: msg };
    }
  },

  updateHoliday: async (id, data) => {
    set({ holidayLoading: true, holidayError: null });
    try {
      await holidayApi.updateHoliday(id, data);
      await get().fetchHolidays();
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Lỗi khi cập nhật ngày nghỉ';
      set({ holidayError: msg, holidayLoading: false });
      return { success: false, message: msg };
    }
  },

  deleteHoliday: async (id) => {
    set({ holidayLoading: true, holidayError: null });
    try {
      await holidayApi.deleteHoliday(id);
      await get().fetchHolidays();
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Lỗi khi xóa ngày nghỉ';
      set({ holidayError: msg, holidayLoading: false });
      return { success: false, message: msg };
    }
  },

  // --- SHIFTS ---
  shifts: [],
  shiftLoading: false,
  shiftError: null,
  shiftPagination: { total: 0, page: 1, limit: 10 },
  shiftFilters: { search: '', isActive: '', page: 1, limit: 10 },

  fetchShifts: async () => {
    try {
      set({ shiftLoading: true, shiftError: null });
      const { shiftFilters } = get();
      const res = await shiftApi.getShifts(shiftFilters);
      set({
        shifts: res.data?.data?.items || res.data?.data || [],
        shiftPagination: res.data?.meta || { total: 0, page: 1, limit: 10 },
        shiftLoading: false
      });
    } catch (error) {
      set({ shiftError: error.response?.data?.message || 'Lỗi khi tải danh sách ca', shiftLoading: false });
    }
  },

  setShiftFilters: (filters) => {
    set((state) => ({ shiftFilters: { ...state.shiftFilters, ...filters } }));
    get().fetchShifts();
  },

  createShift: async (data) => {
    set({ shiftLoading: true, shiftError: null });
    try {
      await shiftApi.createShift(data);
      await get().fetchShifts();
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Lỗi khi tạo ca làm việc';
      set({ shiftError: msg, shiftLoading: false });
      return { success: false, message: msg };
    }
  },

  updateShift: async (id, data) => {
    set({ shiftLoading: true, shiftError: null });
    try {
      await shiftApi.updateShift(id, data);
      await get().fetchShifts();
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Lỗi khi cập nhật ca làm việc';
      set({ shiftError: msg, shiftLoading: false });
      return { success: false, message: msg };
    }
  },

  deleteShift: async (id) => {
    set({ shiftLoading: true, shiftError: null });
    try {
      await shiftApi.deleteShift(id);
      await get().fetchShifts();
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Lỗi khi xóa ca làm việc';
      set({ shiftError: msg, shiftLoading: false });
      return { success: false, message: msg };
    }
  },

  // --- ROSTERS ---
  rosters: [],
  rosterLoading: false,
  rosterError: null,
  rosterPagination: { total: 0, page: 1, limit: 10 },
  rosterFilters: { shiftId: '', status: '', startDate: '', endDate: '', doctorProfileId: '', page: 1, limit: 10 },

  fetchRosters: async () => {
    try {
      set({ rosterLoading: true, rosterError: null });
      const { rosterFilters } = get();
      const res = await rosterApi.getRosters(rosterFilters);
      set({
        rosters: res.data?.data?.items || res.data?.data || [],
        rosterPagination: res.data?.meta || { total: 0, page: 1, limit: 10 },
        rosterLoading: false
      });
    } catch (error) {
      set({ rosterError: error.response?.data?.message || 'Lỗi khi tải lịch trực', rosterLoading: false });
    }
  },

  setRosterFilters: (filters) => {
    set((state) => ({ rosterFilters: { ...state.rosterFilters, ...filters } }));
    get().fetchRosters();
  },

  createRoster: async (data) => {
    set({ rosterLoading: true, rosterError: null });
    try {
      await rosterApi.createRoster(data);
      await get().fetchRosters();
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Lỗi khi tạo lịch trực';
      set({ rosterError: msg, rosterLoading: false });
      return { success: false, message: msg };
    }
  },

  approveRoster: async (id) => {
    set({ rosterLoading: true, rosterError: null });
    try {
      await rosterApi.approveRoster(id);
      await get().fetchRosters();
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Lỗi khi duyệt lịch trực';
      set({ rosterError: msg, rosterLoading: false });
      return { success: false, message: msg };
    }
  },

  rejectRoster: async (id) => {
    set({ rosterLoading: true, rosterError: null });
    try {
      await rosterApi.rejectRoster(id);
      await get().fetchRosters();
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Lỗi khi từ chối lịch trực';
      set({ rosterError: msg, rosterLoading: false });
      return { success: false, message: msg };
    }
  },

  deleteRoster: async (id) => {
    set({ rosterLoading: true, rosterError: null });
    try {
      await rosterApi.deleteRoster(id);
      await get().fetchRosters();
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Lỗi khi xóa lịch trực';
      set({ rosterError: msg, rosterLoading: false });
      return { success: false, message: msg };
    }
  },

  // --- LEAVES ---
  leaves: [],
  leaveLoading: false,
  leaveError: null,

  fetchLeaves: async () => {
    try {
      set({ leaveLoading: true, leaveError: null });
      const { default: leaveApi } = await import('../api/leave.api.js');
      const res = await leaveApi.getAll();
      set({ leaves: res.data?.data || [], leaveLoading: false });
    } catch (error) {
      set({ leaveError: error.response?.data?.message || 'Lỗi khi tải danh sách ngày nghỉ', leaveLoading: false });
    }
  },

  createLeave: async (data) => {
    set({ leaveLoading: true, leaveError: null });
    try {
      const { default: leaveApi } = await import('../api/leave.api.js');
      await leaveApi.create(data);
      await get().fetchLeaves();
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Lỗi khi xin nghỉ';
      set({ leaveError: msg, leaveLoading: false });
      return { success: false, message: msg };
    }
  },

  updateLeaveStatus: async (id, data) => {
    set({ leaveLoading: true, leaveError: null });
    try {
      const { default: leaveApi } = await import('../api/leave.api.js');
      await leaveApi.updateStatus(id, data);
      await get().fetchLeaves();
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Lỗi khi duyệt/từ chối';
      set({ leaveError: msg, leaveLoading: false });
      return { success: false, message: msg };
    }
  },

}));

export default useClinicStore;