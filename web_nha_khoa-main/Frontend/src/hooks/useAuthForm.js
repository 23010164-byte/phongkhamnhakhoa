import { useState, useCallback } from 'react';

/**
 * useAuthForm
 *
 * Custom hook quản lý state form auth: values, errors, touched, submit.
 *
 * @param {object} initialValues
 * @param {function} validate  — (values) => errorObject
 * @param {function} onSubmit  — async (values) => void
 */
const useAuthForm = (initialValues, validate, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Xóa error khi user bắt đầu sửa
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Validate field đơn lẻ khi blur
      const fieldErrors = validate({ ...values });
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] || '' }));
    },
    [values, validate]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Mark tất cả fields là touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);

      // Full validate
      const validationErrors = validate(values);
      setErrors(validationErrors);

      if (Object.values(validationErrors).some(Boolean)) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
  };
};

export default useAuthForm;
