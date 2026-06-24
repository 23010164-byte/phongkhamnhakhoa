import './StatusBadge.css';

export default function StatusBadge({ label, color }) {
  return (
    <span
      className="status-badge"
      style={{ '--badge-color': color }}
    >
      {label}
    </span>
  );
}
