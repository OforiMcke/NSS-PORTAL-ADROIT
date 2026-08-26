import { UploadBox } from "./UploadBox";
import MultiUploadBox from "./MultiUploadBox";

export default function DocumentUploadFields({
  onFileChange,
  onMultiFileChange,
  files = {},
}) {
  return (
    <div className="af-grid-4">
      <UploadBox
        label="Upload Resume / CV"
        required
        name="resume"
        onChange={onFileChange("resume")}
        value={files["resume"]}
      />

      <MultiUploadBox
        label="Additional Docs (Portfolio)"
        name="additionalDocs"
        onChange={onMultiFileChange}
        values={files["additionalDocs"] || []}
      />
    </div>
  );
}
