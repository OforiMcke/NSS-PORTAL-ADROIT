export default function WelcomeBanner({ userName, stats }) {
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="welcome-banner">
      <div className="welcome-avatar welcome-avatar--initials">{initials}</div>
      <div>
        <h1>Hello {userName.split(" ")[0] || "Recruiter"},</h1>
        <p>You have received {stats.totalApplications} responses</p>
      </div>
      <div>
        <div className="bund own" />
        <div className="bund pu" />
        <div className="bund go" />
      </div>
      <div className="bundled last" />
      <div className="welcome-badge">
        Total Number of Jobs Open : {stats.openJobsCount}
      </div>
    </section>
  );
}
