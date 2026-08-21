import { useRef, useState } from "react";
import { FileText, X } from "lucide-react";

export function MultiUploadBox({
  label,
  name,
  onChange,
  accept,
  values = [],
  subtext = "You can select multiple files",
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const openPicker = () => fileInputRef.current?.click();

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (incoming.length === 0) return;
    const merged = [...values];
    incoming.forEach((f) => {
      const isDupe = merged.some(
        (existing) => existing.name === f.name && existing.size === f.size,
      );
      if (!isDupe) merged.push(f);
    });
    onChange(merged);
  };

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
    addFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e) => {
    addFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (e, index) => {
    e.stopPropagation();
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="upload-title">
      {label}
      <div
        className={`upload-box ${isDragging ? "dragging" : ""} ${values.length ? "has-file" : ""}`}
        onClick={openPicker}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ cursor: "pointer" }}
      >
        {values.length > 0 ? (
          <div
            className="upload-file-list"
            onClick={(e) => e.stopPropagation()}
          >
            {values.map((f, i) => (
              <div
                key={`${f.name}-${f.size}-${i}`}
                className="upload-file-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  padding: "4px 0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    overflow: "hidden",
                  }}
                >
                  <FileText size={14} />
                  <span
                    style={{
                      fontSize: "13px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {f.name}
                  </span>
                  <span style={{ fontSize: "11px", color: "#888" }}>
                    ({(f.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleRemoveFile(e, i)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#ef4444",
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label={`Remove ${f.name}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <div
              className="upload-link"
              onClick={openPicker}
              style={{ fontSize: "12px", marginTop: "6px" }}
            >
              + Add more files
            </div>
          </div>
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
          multiple
          onChange={handleInputChange}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}

export default MultiUploadBox;
