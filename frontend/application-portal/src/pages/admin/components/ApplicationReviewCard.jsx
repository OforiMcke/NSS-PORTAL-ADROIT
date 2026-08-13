import { Download, LoaderCircle, CheckCircle2, XCircle } from "lucide-react";

export default function ApplicationReviewCard({
  application,
  isUpdating,
  onViewResume,
  onViewAdditionalDoc,
  onAccept,
  onDecline,
}) {
  return (
    <div className="jap-white-card">
      <div className="jap-resume-header">
        <span className="jap-section-title">Application Summary</span>
        <button
          className="jap-download-btn"
          type="button"
          onClick={() => onViewResume(application.cvUrl)}
        >
          <Download size={13} />
          Download Resume
        </button>
        {application.additionalDocUrl && (
          <button
            className="jap-download-btn"
            type="button"
            onClick={() => onViewAdditionalDoc(application.additionalDocUrl)}
          >
            <Download size={13} />
            Download Additional Document
          </button>
        )}
      </div>
      <h3>{application.fullName}</h3>
      {/* 
      <h4>Motivation</h4>
      <p>{application.statementOfMotivation || "No motivation statement provided."}</p> */}

      <div className="jap-action-row">
        <button
          className="jap-action-btn accept"
          type="button"
          onClick={onAccept}
          disabled={isUpdating || application.status === "accepted"}
        >
          {isUpdating ? (
            <LoaderCircle className="jap-spinner" size={14} />
          ) : (
            <CheckCircle2 size={14} />
          )}
          Accept
        </button>
        <button
          className="jap-action-btn decline"
          type="button"
          onClick={onDecline}
          disabled={isUpdating || application.status === "declined"}
        >
          {isUpdating ? (
            <LoaderCircle className="jap-spinner" size={14} />
          ) : (
            <XCircle size={14} />
          )}
          Decline
        </button>
      </div>
    </div>
  );
}
