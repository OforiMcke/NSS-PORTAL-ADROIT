import { useState } from "react";
import {
  Eye,
  ListChecks,
  XCircle,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";
import { initials, statusLabel } from "../utils/helpers";

export default function ApplicantProfileCard({
  application,
  isUpdating,
  onAccept,
  onDecline,
}) {
  const [clickedAction, setClickedAction] = useState(null);

  const handleAcceptClick = async () => {
    setClickedAction("accept");
    await onAccept();
    setClickedAction(null);
  };

  const handleDeclineClick = async () => {
    setClickedAction("decline");
    await onDecline();
    setClickedAction(null);
  };

  const isAccepted = application.status === "accepted";
  const isDeclined = application.status === "declined";

  return (
    <div className="jap-profile-card">
      <div className="jap-profile-stats">
        <span className="jap-stat-pill">
          <Eye size={13} /> {statusLabel(application.status)}
        </span>
        <span className="jap-stat-pill">
          <ListChecks size={13} /> {application.job?.title || "General"}
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
        <div className="jap-action-row">
          <button
            className="jap-action-btn accept"
            type="button"
            onClick={handleAcceptClick}
            disabled={
              (isUpdating && clickedAction !== "accept") ||
              isAccepted ||
              isDeclined
            }
          >
            {isUpdating && clickedAction === "accept" ? (
              <LoaderCircle className="jap-spinner" size={14} />
            ) : (
              <CheckCircle2 size={14} />
            )}
            Accept
          </button>

          <button
            className="jap-action-btn decline"
            type="button"
            onClick={handleDeclineClick}
            disabled={
              (isUpdating && clickedAction !== "decline") ||
              isDeclined ||
              isAccepted
            }
          >
            {isUpdating && clickedAction === "decline" ? (
              <LoaderCircle className="jap-spinner" size={14} />
            ) : (
              <XCircle size={14} />
            )}
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
