import { Eye, ListChecks } from "lucide-react";
import { initials, statusLabel } from "../utils/helpers";

export default function ApplicantProfileCard({ application }) {
  return (
    <div className="jap-profile-card">
      <div className="jap-profile-stats">
        <span className="jap-stat-pill">
          <Eye size={13} /> {statusLabel(application.status)}
        </span>
        <span className="jap-stat-pill">
          <ListChecks size={13} /> {application.job?.title || "General"}
          {/* was: application.subCategory?.name */}
        </span>
      </div>

      <div className="jap-profile-main">
        <div className="jap-profile-avatar" style={{ background: "#0a0a5c" }}>
          {initials(application.fullName)}
        </div>
        <div className="jap-profile-text">
          <strong>{application.fullName}</strong>
          <span>{application.phoneNumber || "Phone not provided"}</span>
          <span className="jap-applied-ago">
            Applied {new Date(application.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
