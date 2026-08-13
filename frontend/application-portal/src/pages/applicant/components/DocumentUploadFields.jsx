import { UploadBox } from "../UploadBox";
export default function DocumentUploadFields({ onFileChange, files = {} }) {
  return (
    <div className="af-grid-4">
      <UploadBox
        label="Upload Resume / CV"
        required
        name="resume"
        onChange={onFileChange("resume")}
        value={files["resume"]}
      />
      {/* <UploadBox
        label="Upload Cover Letter"
        name="coverLetter"
        onChange={onFileChange("coverLetter")}
        value={files["coverLetter"]}
      />
      <UploadBox
        label="Upload Photo (optional)"
        name="photo"
        accept="image/*"
        onChange={onFileChange("photo")}
        value={files["photo"]}
      />
        */}
      <UploadBox
        label="Additional Doc.(Portfolio)"
        name="additional"
        onChange={onFileChange("additional")}
        value={files["additional"]}
      />
    </div>
  );
}
