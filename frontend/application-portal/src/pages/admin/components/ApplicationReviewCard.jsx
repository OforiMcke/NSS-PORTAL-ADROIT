import { useState } from "react";
import { Eye } from "lucide-react";

export default function ApplicationReviewCard({ application }) {
  const [previewUrl, setPreviewUrl] = useState(application?.cvUrl || "");
  const [prevId, setPrevId] = useState(application?._id);

  if (application?._id !== prevId) {
    setPrevId(application?._id);
    setPreviewUrl(application?.cvUrl || "");
  }

  const handleView = (url) => {
    if (url) setPreviewUrl(url);
  };

  const additionalDocs = application?.additionalDocs || [];

  return (
    <div className="jap-white-card">
      <div className="jap-resume-header">
        <span className="jap-section-title">Application Summary</span>

        <div className="jap-action-group">
          <button
            className={`jap-view-btn ${previewUrl === application?.cvUrl ? "active" : ""}`}
            type="button"
            onClick={() => handleView(application?.cvUrl)}
          >
            <Eye size={13} />
            View Resume
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
          </div>
        ))}
      </div>

      <h3>{application?.fullName}</h3>
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
