import { Download, Eye } from "lucide-react";
import { useState } from "react";

export default function ApplicationReviewCard({
  application,
  onViewResume,
  onViewAdditionalDoc,
}) {
  const [previewUrl, setPreviewUrl] = useState(application?.cvUrl || "");

  const handleView = (url) => {
    if (url) setPreviewUrl(url);
  };

  const additionalDocs = application.additionalDocs || [];

  return (
    <div className="jap-white-card">
      <div className="jap-resume-header">
        <span className="jap-section-title">Application Summary</span>

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

        {additionalDocs.map((doc, i) => (
          <div className="jap-action-group" key={doc.url || i}>
            <button
              className={`jap-view-btn ${previewUrl === doc.url ? "active" : ""}`}
              type="button"
              onClick={() => handleView(doc.url)}
            >
              <Eye size={13} />
              View Doc {additionalDocs.length > 1 ? i + 1 : ""}
            </button>
            <button
              className="jap-download-btn"
              type="button"
              onClick={() => onViewAdditionalDoc(doc.url)}
            >
              <Download size={13} />
              Download Doc {additionalDocs.length > 1 ? i + 1 : ""}
            </button>
          </div>
        ))}
      </div>

      <h3>{application.fullName}</h3>

      {previewUrl ? (
        <div className="jap-document-preview">
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
