import { useEffect, useRef } from 'react';

/**
 * Calls `callback` when the observed element enters the viewport.
 * Used for infinite-scroll / load-more patterns.
 *
 * @param {Function} callback - Function to call on intersection
 * @param {Object}   options  - IntersectionObserver options
 */
const useIntersectionObserver = (callback, options = {}) => {
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
          }
        });
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [callback, options]);

  return targetRef;
};

export default useIntersectionObserver;
