import { useRef, useState } from "react";
import { FileText, CheckCircle2, Trash2 } from "lucide-react"; // Added icons for feedback

export function UploadBox({
  label,
  required,
  name,
  onChange,
  accept,
  value,
  subtext = "Support zip or rar files",
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const openPicker = () => fileInputRef.current?.click();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onChange({ target: { files: [file] } });
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.value = "";
    onChange({ target: { files: [] } });
  };

  return (
    <div className="upload-title">
      {label} {required && <span style={{ color: "#d33" }}>*</span>}
      <div
        className={`upload-box ${isDragging ? "dragging" : ""} ${value ? "has-file" : ""}`}
        onClick={openPicker}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ cursor: "pointer" }}
      >
        {value ? (
          <>
            <CheckCircle2
              className="upload-icon text-success"
              size={18}
              style={{ color: "#22c55e" }}
            />
            <div className="upload-text" style={{ fontWeight: "500" }}>
              {value.name}
            </div>
            <div className="upload-subtext">
              {(value.size / 1024 / 1024).toFixed(2)} MB
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="remove-file-btn"
              style={{
                background: "none",
                border: "none",
                marginTop: "5px",
                cursor: "pointer",
                color: "#ef4444",
              }}
            >
              <Trash2
                size={14}
                style={{
                  display: "inline",
                  marginRight: "4px",
                  verticalAlign: "middle",
                }}
              />
              Remove file
            </button>
          </>
        ) : (
          <>
            <FileText className="upload-icon" size={15} />
            <div className="upload-text">
              Drag and drop files, or{" "}
              <span
                className="upload-link"
                onClick={(e) => e.stopPropagation()}
              >
                Browse
              </span>
            </div>
            <div className="upload-subtext">{subtext}</div>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept={accept}
          onChange={onChange}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}

export default UploadBox;
