import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import authApi from '../api/auth.api';
import {
  setTokens,
  removeTokens,
  getRefreshToken,
  getACCESS_TOKEN,
  setACCESS_TOKEN,
  extractErrorMessage,
} from '../utils/helpers';

/**
 * AUTH STORE
 *
 * Backend response format (successResponse):
 *   { success: true, message: '...', data: { ... } }
 *
 * Axios response:
 *   response.data = { success, message, data }
 *
 * Nên để lấy payload thực tế: response.data.data
 *
 * State shape:
 *   user          — object | null
 *   isAuth        — bool (có token hợp lệ không)
 *   loading       — bool (đang gọi API)
 *   error         — string | null
 *   initialized   — bool (đã bootstrap/getMe chưa)
 */

const useAuthStore = create(
  devtools(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────────────────────
      user: null,
      isAuth: false,
      loading: false,
      error: null,
      initialized: false,

      // ── Helpers nội bộ ───────────────────────────────────────────────────────
      _setLoading: (loading) => set({ loading }, false, 'setLoading'),
      _setError: (error) => set({ error }, false, 'setError'),
      clearError: () => set({ error: null }, false, 'clearError'),

      // ── Actions ──────────────────────────────────────────────────────────────

      /**
       * Login: gọi API → lưu token → set user vào store
       *
       * Backend login response.data:
       *   { success: true, message: '...', data: { ACCESS_TOKEN, expiresIn, user } }
       */
      login: async (credentials) => {
        const { _setLoading, _setError } = get();
        _setLoading(true);
        set({ error: null });

        try {
          const response = await authApi.login(credentials);
          // response.data = { success, message, data: { ACCESS_TOKEN, expiresIn, user } }
          const payload = response.data.data;
          const { ACCESS_TOKEN: accessToken, user } = payload;

          // Backend gửi refreshToken qua httpOnly cookie,
          // nhưng cũng có thể trả trong body nếu cần
          const refreshToken = payload.refreshToken;

          if (accessToken) {
            setTokens({ ACCESS_TOKEN: accessToken, refreshToken: refreshToken || '' });
          }

          set({ user, isAuth: true, error: null }, false, 'login/success');

          return { success: true, user };
        } catch (err) {
          const message = extractErrorMessage(err, 'Đăng nhập thất bại.');
          _setError(message);
          return { success: false, message };
        } finally {
          _setLoading(false);
        }
      },

      /**
       * Register: gọi API → không tự login (cần verify email)
       */
      register: async (formData) => {
        const { _setLoading, _setError } = get();
        _setLoading(true);
        set({ error: null });

        try {
          const response = await authApi.register(formData);
          return { success: true, message: response.data.message };
        } catch (err) {
          const message = extractErrorMessage(err, 'Đăng ký thất bại.');
          _setError(message);
          return { success: false, message };
        } finally {
          _setLoading(false);
        }
      },

      /**
       * Logout: gửi refreshToken lên server để blacklist → clear local state
       */
      logout: async () => {
        const refreshToken = getRefreshToken();

        // Fire-and-forget: dù server lỗi vẫn clear phía client
        try {
          if (refreshToken) {
            await authApi.logout({ refreshToken });
          }
        } catch {
          // intentionally ignored
        } finally {
          removeTokens();
          set(
            { user: null, isAuth: false, error: null },
            false,
            'logout'
          );
        }
      },

      /**
       * Forgot password: gửi email reset
       */
      forgotPassword: async (email) => {
        const { _setLoading, _setError } = get();
        _setLoading(true);
        set({ error: null });

        try {
          const response = await authApi.forgotPassword({ email });
          return { success: true, message: response.data.message };
        } catch (err) {
          const message = extractErrorMessage(
            err,
            'Không thể gửi email đặt lại mật khẩu.'
          );
          _setError(message);
          return { success: false, message };
        } finally {
          _setLoading(false);
        }
      },

      /**
       * Reset password bằng token từ email
       */
      resetPassword: async ({ token, password, confirmPassword }) => {
        const { _setLoading, _setError } = get();
        _setLoading(true);
        set({ error: null });

        try {
          const response = await authApi.resetPassword({
            token,
            newPassword: password,
          });
          return { success: true, message: response.data.message };
        } catch (err) {
          const message = extractErrorMessage(
            err,
            'Đặt lại mật khẩu thất bại.'
          );
          _setError(message);
          return { success: false, message };
        } finally {
          _setLoading(false);
        }
      },

      /**
       * Verify email bằng email + OTP
       */
      verifyEmail: async ({ email, otp }) => {
        const { _setLoading, _setError } = get();
        _setLoading(true);
        set({ error: null });

        try {
          const response = await authApi.verifyEmail({ email, otp });
          return { success: true, message: response.data.message };
        } catch (err) {
          const message = extractErrorMessage(err, 'Xác thực email thất bại.');
          _setError(message);
          return { success: false, message };
        } finally {
          _setLoading(false);
        }
      },

      /**
       * Resend verification email
       */
      resendVerification: async (email) => {
        const { _setLoading, _setError } = get();
        _setLoading(true);
        set({ error: null });

        try {
          const response = await authApi.resendVerification({ email });
          return { success: true, message: response.data.message };
        } catch (err) {
          const message = extractErrorMessage(err, 'Không thể gửi lại email.');
          _setError(message);
          return { success: false, message };
        } finally {
          _setLoading(false);
        }
      },

      /**
       * Bootstrap: gọi khi app mount, kiểm tra token còn hợp lệ không
       * → lấy user info từ server
       */
      initialize: async () => {
        // Nếu không có token → skip, không cần gọi API
        const hasToken = !!getACCESS_TOKEN();

        if (!hasToken) {
          set({ initialized: true }, false, 'initialize/noToken');
          return;
        }

        try {
          const response = await authApi.getMe();
          // response.data = { success: true, data: user }
          const user = response.data.data;
          set(
            { user, isAuth: true, initialized: true },
            false,
            'initialize/success'
          );
        } catch {
          // Token hết hạn hoặc không hợp lệ
          removeTokens();
          set(
            { user: null, isAuth: false, initialized: true },
            false,
            'initialize/failed'
          );
        }
      },

      // ── Selectors (computed getters) ─────────────────────────────────────────
      isAdmin: () => get().user?.role === 'admin',
    }),
    { name: 'AuthStore' }
  )
);

// ── Default export + Named export (cả hai đều hỗ trợ) ─────────────────────────
export default useAuthStore;
export { useAuthStore };

// ── Named selectors để tránh re-render thừa ───────────────────────────────────
export const selectUser = (state) => state.user;
export const selectIsAuth = (state) => state.isAuth;
export const selectAuthLoading = (state) => state.loading;
export const selectAuthError = (state) => state.error;
export const selectInitialized = (state) => state.initialized;
