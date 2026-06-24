import { create } from 'zustand';
import serviceApi from '../api/service.api';

const useServiceStore = create((set) => ({
  // ── List ──────────────────────────────────────────────────────────────────
  services: [],
  serviceTotal: 0,
  servicePage: 1,
  serviceLimit: 12,
  categories: [],
  listLoading: false,
  listError: null,

  fetchServices: async (params = {}) => {
    set({ listLoading: true, listError: null });
    try {
      const { page = 1, limit = 12, search = '', category = '', isActive } = params;
      const res = await serviceApi.getServices({ page, limit, search, category, isActive });
      set({
        services: res.data.items ?? res.data.data ?? res.data,
        serviceTotal: res.data.total ?? 0,
        servicePage: page,
        serviceLimit: limit,
        listLoading: false,
      });
    } catch (err) {
      set({
        listError: err.response?.data?.message ?? 'Không thể tải danh sách dịch vụ.',
        listLoading: false,
      });
    }
  },

  fetchCategories: async () => {
    try {
      const res = await serviceApi.getCategories();
      set({ categories: res.data?.data ?? res.data ?? [] });
    } catch (_) {}
  },

  clearListError: () => set({ listError: null }),

  // ── Detail ────────────────────────────────────────────────────────────────
  selectedService: null,
  selectedServiceLoading: false,
  selectedServiceError: null,

  fetchServiceById: async (id) => {
    set({ selectedServiceLoading: true, selectedServiceError: null, selectedService: null });
    try {
      const res = await serviceApi.getServiceById(id);
      set({ selectedService: res.data?.data ?? res.data, selectedServiceLoading: false });
    } catch (err) {
      set({
        selectedServiceError: err.response?.data?.message ?? 'Không thể tải thông tin dịch vụ.',
        selectedServiceLoading: false,
      });
    }
  },

  clearSelectedService: () =>
    set({ selectedService: null, selectedServiceError: null }),

  // ── Admin mutations ───────────────────────────────────────────────────────
  createService: async (data) => {
    try {
      await serviceApi.createService(data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message ?? 'Thêm mới thất bại.' };
    }
  },

  updateService: async (id, data) => {
    try {
      await serviceApi.updateService(id, data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message ?? 'Cập nhật thất bại.' };
    }
  },

  toggleServiceStatus: async (id) => {
    try {
      await serviceApi.toggleServiceStatus(id);
      set((state) => ({
        services: state.services.map((s) =>
          s.id === id
            ? { ...s, is_active: !s.is_active }
            : s
        ),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message ?? 'Thao tác thất bại.' };
    }
  },

  deleteService: async (id) => {
    try {
      await serviceApi.deleteService(id);
      set((state) => ({
        services: state.services.filter((s) => s.id !== id),
        serviceTotal: state.serviceTotal - 1,
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message ?? 'Xoá thất bại.' };
    }
  },
}));

export default useServiceStore;
