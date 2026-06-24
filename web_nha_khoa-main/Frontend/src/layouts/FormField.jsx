/**
 * FormField — reusable input wrapper dùng trong tất cả auth forms
 * Props: label, name, type, value, onChange, onBlur, error, touched, ...rest
 */
const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  autoComplete,
  disabled = false,
}) => {
  const showError = touched && error;

  return (
    <div className="form-field">
      <label htmlFor={name} className="form-field__label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={showError ? 'true' : 'false'}
        aria-describedby={showError ? `${name}-error` : undefined}
        className={`form-field__input${showError ? ' form-field__input--error' : ''}`}
      />
      {showError && (
        <span id={`${name}-error`} className="form-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormField;
