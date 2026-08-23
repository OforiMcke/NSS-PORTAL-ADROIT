import { useState, useEffect } from "react";
import { CalendarClock } from "lucide-react";
import { api } from "../../api/axiosInstance";
import "./ApplicantInterviewSchedule.css";

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
    <div className="ais-wrapper">
      <h3>Interview Schedule</h3>

      {loading && (
        <p className="ais-status-text">Loading your interview schedule...</p>
      )}
      {!loading && error && <p className="ais-error-text">{error}</p>}

      {!loading && !error && scheduled.length === 0 && (
        <div className="ais-empty">
          <CalendarClock size={36} />
          <p>No interviews scheduled yet.</p>
        </div>
      )}

      {!loading && !error && scheduled.length > 0 && (
        <div className="ais-list">
          {scheduled.map((app) => {
            const date = new Date(app.interviewDate);
            const isHired = app.status === "hired";
            return (
              <div
                key={app._id}
                className={`ais-card ${isHired ? "ais-card--hired" : ""}`}
              >
                <div className="ais-date-block">
                  <span className="ais-date-day">{date.getDate()}</span>
                  <span className="ais-date-month">
                    {date.toLocaleString("default", { month: "short" })}
                  </span>
                </div>
                <div className="ais-details">
                  <div className="ais-role">
                    {app.job?.title || app.jobRole || "—"}
                  </div>
                  <div className="ais-time">
                    {date.toLocaleString("default", {
                      weekday: "long",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <span
                  className={`ais-badge ${isHired ? "ais-badge--hired" : "ais-badge--accepted"}`}
                >
                  {isHired ? "Hired 🎉" : "Interview Scheduled"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
