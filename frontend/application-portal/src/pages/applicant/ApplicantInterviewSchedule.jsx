import { useState, useEffect } from "react";
import { CalendarClock } from "lucide-react";
import { api } from "../../api/axiosInstance";
import "../admin/dashboard.css";

const statusColor = {
  pending: "status-pending",
  accepted: "status-accepted",
  declined: "status-rejected",
  hired: "status-hired",
};

const statusLabel = {
  pending: "Under Review",
  accepted: "Interview Scheduled",
  declined: "Declined",
  hired: "Hired 🎉",
};

export default function ApplicantInterviewSchedule() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    api
      .get("/api/applications/me")
      .then((res) => {
        if (!mounted) return;
        setApplications(res.data?.data || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(
          err.response?.data?.message ||
            "Couldn't load your interview schedule.",
        );
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const scheduled = applications.filter((app) => !!app.interviewDate);

  return (
    <section className="applications-card">
      <h3>Interview Schedule</h3>

      {loading && (
        <p className="ma-status-text">Loading your interview schedule...</p>
      )}
      {!loading && error && <p className="ma-error-text">{error}</p>}

      {!loading && !error && scheduled.length === 0 && (
        <div className="ma-empty-state">
          <CalendarClock size={32} className="ma-empty-icon" />
          <p>No interviews scheduled yet.</p>
        </div>
      )}

      {!loading && !error && scheduled.length > 0 && (
        <table className="applications-table">
          <thead>
            <tr>
              <th>Position</th>
              <th>Interview Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {scheduled.map((app) => (
              <tr key={app._id}>
                <td>{app.job?.title || app.jobTitle || "—"}</td>
                <td>{new Date(app.interviewDate).toLocaleString()}</td>
                <td>
                  <span
                    className={`status-badge ${statusColor[app.status] || ""}`}
                  >
                    {statusLabel[app.status] || app.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
