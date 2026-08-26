export default function ActivityFeed({ recentActivity }) {
  return (
    <div className="activity-card">
      <h3>Recent Activity</h3>
      <ul className="activity-list">
        {recentActivity.length === 0 ? (
          <li className="activity-item">
            <div>No recent activity.</div>
          </li>
        ) : (
          recentActivity.map((item, i) => (
            <li key={i} className="activity-item">
              <span className={`activity-dot dot-${i % 6}`} />
              <div>
                <p>
                  <strong>{item.name}</strong> {item.action}
                </p>
                <span className="activity-time">{item.time}</span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
