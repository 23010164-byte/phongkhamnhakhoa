import { useState, useCallback } from 'react';

/**
 * Generic async handler with loading + error state
 * Usage: const { execute, loading, error } = useAsync(myApiCall);
 */
export function useAsync(asyncFn) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFn(...args);
        return result;
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn]
  );

  return { execute, loading, error, clearError: () => setError(null) };
}

/**
 * Pagination helper
 */
export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    setPage,
    setTotal,
    goNext: () => setPage((p) => Math.min(p + 1, totalPages)),
    goPrev: () => setPage((p) => Math.max(p - 1, 1)),
  };
}
