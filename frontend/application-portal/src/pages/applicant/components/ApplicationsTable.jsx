const statusColor = {
  pending: "status-pending",
  accepted: "status-accepted",
  declined: "status-rejected",
  hired: "status-hired",
};
const statusLabel = {
  pending: "Under Review",
  accepted: "Accepted",
  declined: "Declined",
  hired: "Hired 🎉",
};

export default function ApplicationsTable({ applications }) {
  return (
    <section className="applications-card">
      <h3>My Applications</h3>
      <table className="applications-table">
        <thead>
          <tr>
            <th>Position</th>
            <th>Status</th>
            <th>Date Applied</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app, i) => (
            <tr key={i}>
              <td>{app.jobRole || "Unknown role"}</td>
              <td>
                <span className={`status-badge ${statusColor[app.status]}`}>
                  {statusLabel[app.status] || app.status}
                </span>
              </td>
              <td>{new Date(app.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
