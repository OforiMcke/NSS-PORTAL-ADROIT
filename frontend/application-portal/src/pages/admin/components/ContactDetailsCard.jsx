export default function ContactDetailsCard({ application }) {
  return (
    <div className="jap-white-card">
      <span className="jap-section-title">Contact Details</span>
      <div className="jap-insight-row">
        <strong>Email</strong>
        <p>{application.email}</p>
      </div>
      <div className="jap-insight-row">
        <strong>Position</strong>
        <p>{application.job?.title || "Unassigned"}</p>
        {/* was: <strong>Category</strong> / application.category?.name */}
      </div>
    </div>
  );
}
