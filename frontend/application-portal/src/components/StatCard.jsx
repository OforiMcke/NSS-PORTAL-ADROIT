export default function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-text">
        <p className="stat-label">{label}</p>
        <h2 className="stat-value">{value}</h2>
      </div>
      <div className="stat-icon">
        <Icon size={22} />
      </div>
    </div>
  );
}
