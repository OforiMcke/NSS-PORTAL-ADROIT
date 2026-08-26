import "./ApplicationForm.css";
import { useApplicationForm } from "./hooks/useApplicationForm";
import { StatusPage } from "./components/StatusPage";
import { SubmissionModal } from "./components/SubmissionModal";
import PersonalDetailsFields from "../components/PersonalDetailsFields";
import JobDetailsFields from "../components/JobDetailsFields";
import DocumentUploadFields from "../components/DocumentUploadFields";
import DeclarationCheckbox from "../components/DeclarationCheckbox";

export default function ApplicationForm({ embedded = false, onSubmitSuccess }) {
  const f = useApplicationForm({ embedded, onSubmitSuccess });

  if (f.linkedJobId && f.jobLoading) {
    return <StatusPage embedded={embedded}>Loading job details...</StatusPage>;
  }
  if (f.linkedJobId && f.jobError) {
    return (
      <StatusPage embedded={embedded} isError>
        {f.jobError}
      </StatusPage>
    );
  }

  return (
    <div className={`af-page ${embedded ? "af-embedded" : ""}`}>
      <div className="af-card">
        <header className="af-header">
          <div className="af-logo" />
          <div className="af-header-text">
            <h1>Application Form</h1>
          </div>
        </header>

        <form className="af-body" onSubmit={f.handleSubmit}>
          {f.error && <div className="af-error">{f.error}</div>}
          {f.success && <div className="af-success">{f.success}</div>}

          <PersonalDetailsFields
            formValues={f.formValues}
            onChange={f.handleInputChange}
          />

          <JobDetailsFields
            formValues={f.formValues}
            onChange={f.handleInputChange}
            employmentType={f.employmentType}
            onEmploymentTypeChange={f.setEmploymentType}
            roleOptions={f.roleOptions}
            isLocked={f.isLocked}
            selectedRoleKey={f.effectiveKey}
            onRoleChange={f.handleRoleChange}
            loading={f.linkedJobId ? f.jobLoading : f.openJobsLoading}
            error={f.linkedJobId ? f.jobError : f.openJobsError}
          />

          <DocumentUploadFields
            files={f.files}
            onFileChange={f.handleFileChange}
            onMultiFileChange={f.handleMultiFileChange}
          />
          <DeclarationCheckbox agreed={f.agreed} onChange={f.setAgreed} />

          <button type="submit" className="af-submit" disabled={f.loading}>
            {f.loading ? "Submitting..." : "Confirm & Submit Application"}
          </button>
        </form>
      </div>

      {f.showAccountPrompt && (
        <SubmissionModal isLoggedIn={f.isLoggedIn} onDone={f.handleDone} />
      )}
    </div>
  );
}
