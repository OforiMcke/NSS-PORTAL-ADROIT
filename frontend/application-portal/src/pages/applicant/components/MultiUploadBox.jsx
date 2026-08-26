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
        className={`upload-box multi-upload-box ${isDragging ? "dragging" : ""} ${values.length ? "has-file" : ""}`}
        onClick={openPicker}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {values.length > 0 ? (
          <div
            className="upload-file-list"
            onClick={(e) => e.stopPropagation()}
          >
            {values.map((f, i) => (
              <div key={`${f.name}-${f.size}-${i}`} className="upload-file-row">
                <FileText size={14} className="upload-file-icon" />
                <span className="upload-file-name" title={f.name}>
                  {f.name}
                </span>
                <span className="upload-file-size">
                  {(f.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <button
                  type="button"
                  className="upload-file-remove"
                  onClick={(e) => handleRemoveFile(e, i)}
                  aria-label={`Remove ${f.name}`}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="upload-add-more"
              onClick={openPicker}
            >
              + Add more files
            </button>
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
