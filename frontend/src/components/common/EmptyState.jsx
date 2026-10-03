export default function EmptyState({ message = "No records yet." }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
    </div>
  );
}
