import { initials } from "../utils/helpers";

export default function ApplicationCard({ application, selected, onSelect }) {
  return (
    <button
      className={`jap-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect(application._id)}
    >
      <div className="jap-card-top">
        <div className="jap-card-avatar" style={{ background: "#0a0a5c" }}>
          {initials(application.fullName)}
        </div>
        <div className="jap-card-name">
          <strong>{application.fullName}</strong>
          <span>{application.email}</span>
        </div>
        <span className="jap-card-date">
          {new Date(application.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="jap-card-role">
        {application.jobRole || "General application"}
      </div>
    </button>
  );
}
