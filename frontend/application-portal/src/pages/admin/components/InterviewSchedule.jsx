export default function InterviewSchedule({ upcomingInterviews }) {
  return (
    <section className="schedule-card">
      <h3>Current Schedule</h3>
      {upcomingInterviews.length === 0 ? (
        <p className="jobs-list-state">No interviews scheduled yet.</p>
      ) : (
        upcomingInterviews.map((interview) => (
          <div className="schedule-item" key={interview._id}>
            <span className="schedule-dot" />
            {interview.fullName} —{" "}
            {interview.job?.title || interview.jobRole || "a role"} on{" "}
            {new Date(interview.interviewDate).toLocaleString()}
          </div>
        ))
      )}
    </section>
  );
}
