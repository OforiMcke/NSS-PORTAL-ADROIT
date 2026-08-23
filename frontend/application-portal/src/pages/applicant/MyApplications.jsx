import { useState, useEffect } from "react";
import { FileText, X, ExternalLink } from "lucide-react";
import api from "../../api/axiosInstance";
import "../admin/dashboard.css";
import "./MyApplications.css";

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

const FILTERS = ["All", "Pending", "Accepted", "Declined", "Hired"];

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

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
            "Couldn't load your applications. Please try again.",
        );
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const visibleApplications =
    filter === "All"
      ? applications
      : applications.filter((app) => app.status === filter.toLowerCase());

  return (
    <div>
      <section className="applications-card">
        <div className="chart-header">
          <h3>My Applications</h3>
          <select
            className="chart-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {FILTERS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <p className="ma-status-text">Loading your applications...</p>
        )}

        {!loading && error && <p className="ma-error-text">{error}</p>}

        {!loading && !error && applications.length === 0 && (
          <div className="ma-empty-state">
            <FileText size={32} className="ma-empty-icon" />
            <p>You haven't submitted any applications yet.</p>
          </div>
        )}

        {!loading &&
          !error &&
          applications.length > 0 &&
          visibleApplications.length === 0 && (
            <p className="ma-status-text">No applications match this filter.</p>
          )}

        {!loading && !error && visibleApplications.length > 0 && (
          <table className="applications-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Status</th>
                <th>Date Applied</th>
              </tr>
            </thead>
            <tbody>
              {visibleApplications.map((app) => (
                <tr
                  key={app._id}
                  className="ma-row"
                  onClick={() => setSelected(app)}
                >
                  <td>{app.jobRole || "—"}</td>
                  <td>
                    <span
                      className={`status-badge ${statusColor[app.status] || ""}`}
                    >
                      {statusLabel[app.status] || app.status}
                    </span>
                  </td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td className="ma-view-link">View details</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
          className="ma-modal-overlay"
        >
          <div onClick={(e) => e.stopPropagation()} className="ma-modal">
            <div className="ma-modal-header">
              <div>
                <h3 className="ma-modal-title">
                  {selected.job?.title || "Application"}
                </h3>
                <p className="ma-modal-subtitle">
                  {selected.job?.employmentType}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="ma-modal-close"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <span
              className={`status-badge ma-modal-badge ${statusColor[selected.status] || ""}`}
            >
              {statusLabel[selected.status] || selected.status}
            </span>

            <div className="ma-modal-body">
              <p className="ma-detail-label">Submitted</p>
              <p className="ma-detail-value">
                {new Date(selected.createdAt).toLocaleString()}
              </p>

              {selected.cvUrl && (
                <a
                  href={selected.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ma-cv-link"
                >
                  View CV/Resume <ExternalLink size={14} />
                </a>
              )}
              {selected.additionalDocs?.length > 0 &&
                selected.additionalDocs.map((doc, i) => (
                  <a
                    key={doc.url || i}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ma-cv-link"
                  >
                    View Additional Document
                    {selected.additionalDocs?.length > 1 ? `${i + 1}` : ""}
                    {""}
                    <ExternalLink size={14} />
                  </a>
                ))}
              {selected.status === "declined" && selected.adminFeedback && (
                <div className="ma-feedback-box">
                  <p className="ma-box-label">Feedback</p>
                  <p className="ma-box-text">{selected.adminFeedback}</p>
                </div>
              )}

              {selected.status === "accepted" && selected.interviewDate && (
                <div className="ma-interview-box">
                  <p className="ma-box-label">Interview</p>
                  <p className="ma-box-text">
                    {new Date(selected.interviewDate).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
