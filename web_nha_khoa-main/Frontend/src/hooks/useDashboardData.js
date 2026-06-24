import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook for fetching dashboard data
 * @param {Function} fetchFn - async function returning data
 * @param {Array} deps - dependency array to re-trigger fetch
 */
export function useDashboardData(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || 'Đã xảy ra lỗi'
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook to fetch multiple dashboard data sources in parallel
 * @param {Object} fetchMap - { key: asyncFn }
 */
export function useMultipleDashboardData(fetchMap) {
  const keys = Object.keys(fetchMap);
  const initialState = keys.reduce((acc, k) => ({ ...acc, [k]: null }), {});

  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErrors({});

    const results = await Promise.allSettled(
      keys.map((k) => fetchMap[k]())
    );

    const newData = {};
    const newErrors = {};

    results.forEach((result, i) => {
      const key = keys[i];
      if (result.status === 'fulfilled') {
        newData[key] = result.value;
      } else {
        newData[key] = null;
        newErrors[key] =
          result.reason?.response?.data?.message ||
          result.reason?.message ||
          'Lỗi tải dữ liệu';
      }
    });

    setData(newData);
    setErrors(newErrors);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, loading, errors, refetch: fetchAll };
}
