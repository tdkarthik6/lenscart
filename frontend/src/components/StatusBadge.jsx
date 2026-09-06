export default function StatusBadge({ status }) {
  const map = {
    PENDING:   'badge badge-pending',
    CONFIRMED: 'badge badge-confirmed',
    CANCELLED: 'badge badge-cancelled',
    COMPLETED: 'badge badge-completed',
  };
  return (
    <span className={map[status] || 'badge'}>
      {status?.charAt(0) + status?.slice(1).toLowerCase()}
    </span>
  );
}
