export default function UpcomingInterview({ interview }) {
  return (
    <section className="schedule-card">
      <h3>Upcoming Interview</h3>
      {interview ? (
        <div className="schedule-item">
          <span className="schedule-dot" />
          {interview.jobRole || "Your role"} —{" "}
          {new Date(interview.interviewDate).toLocaleString("default", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      ) : (
        <p className="jobs-list-state" style={{ padding: "12px 0" }}>
          No upcoming interviews scheduled.
        </p>
      )}
    </section>
  );
}
