import './StatCard.css';

/**
 * @param {string} label
 * @param {string|number} value
 * @param {string} [subtext]
 * @param {string} [color] - css var name or hex
 * @param {string} [icon] - emoji or text icon
 */
function StatCard({ label, value, subtext, color = '#2563eb', icon }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-card__header">
        {icon && <span className="stat-card__icon">{icon}</span>}
        <span className="stat-card__label">{label}</span>
      </div>
      <div className="stat-card__value" style={{ color }}>
        {value ?? '—'}
      </div>
      {subtext && <div className="stat-card__subtext">{subtext}</div>}
    </div>
  );
}

export default StatCard;
