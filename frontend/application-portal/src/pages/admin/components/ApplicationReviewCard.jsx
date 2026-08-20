import { Download, Eye } from "lucide-react";
import { useState } from "react";

export default function ApplicationReviewCard({
  application,
  onViewResume,
  onViewAdditionalDoc,
}) {
  // 1. Initialize state safely
  const [previewUrl, setPreviewUrl] = useState(application?.cvUrl || "");

  // 2. Helper to switch views safely
  const handleView = (url) => {
    if (url) setPreviewUrl(url);
  };

  return (
    <div className="jap-white-card">
      <div className="jap-resume-header">
        <span className="jap-section-title">Application Summary</span>

        {/* Resume Actions */}
        <div className="jap-action-group">
          <button
            className={`jap-view-btn ${previewUrl === application.cvUrl ? "active" : ""}`}
            type="button"
            onClick={() => handleView(application.cvUrl)}
          >
            <Eye size={13} />
            View Resume
          </button>
          <button
            className="jap-download-btn"
            type="button"
            onClick={() => onViewResume(application.cvUrl)}
          >
            <Download size={13} />
            Download Resume
          </button>
        </div>

        {/* Additional Doc Actions */}
        {application.additionalDocUrl && (
          <div className="jap-action-group">
            <button
              className={`jap-view-btn ${previewUrl === application.additionalDocUrl ? "active" : ""}`}
              type="button"
              onClick={() => handleView(application.additionalDocUrl)}
            >
              <Eye size={13} />
              View Doc
            </button>
            <button
              className="jap-download-btn"
              type="button"
              onClick={() => onViewAdditionalDoc(application.additionalDocUrl)}
            >
              <Download size={13} />
              Download Doc
            </button>
          </div>
        )}
      </div>

      <h3>{application.fullName}</h3>

      {/* Document Display Preview Area */}
      {previewUrl ? (
        <div className="jap-document-preview">
          {/* Key prop forces iframe to recreate and reload when previewUrl changes */}
          <iframe
            key={previewUrl}
            src={previewUrl}
            title="Document Preview"
            width="100%"
            height="600px"
          />
        </div>
      ) : (
        <div className="jap-no-preview">No document selected for preview</div>
      )}
    </div>
  );
}
