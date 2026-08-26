export default function ApplicantWelcomeBanner({
  profile,
  submittedCount,
  interviewCount,
  onApplyClick,
}) {
  const initials = profile.firstName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="welcome-banner">
      <div className="welcome-avatar welcome-avatar--initials">{initials}</div>
      <div>
        <h1>Welcome back, {profile.firstName}</h1>
        <p>
          You have {submittedCount} active application{" "}
          {submittedCount === 1 ? "" : "s"}
        </p>
      </div>
      <div>
        <div className="bund own" />
        <div className="bund pu" />
        <div className="bund go" />
      </div>
      <div className="bundled last" />
      <div className="welcome-cta">
        <button onClick={onApplyClick} className="welcome-cta-btn">
          Apply Now
        </button>
      </div>
      <div className="welcome-badge">
        {interviewCount} Interview{interviewCount === 1 ? "" : "s"} This Week
      </div>
    </section>
  );
}
