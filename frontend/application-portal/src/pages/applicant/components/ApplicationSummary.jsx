export default function ApplicationSummary({
  formValues,
  jobTitle,
  employmentType,
  files,
  loading,
  success,
  onBack,
  onPrint,
  onSubmit,
}) {
  return (
    <div className="af-summary-view">
      <section className="af-section">
        <h2>Personal &amp; Academic Details</h2>
        <table className="af-summary-table">
          <tbody>
            <tr>
              <td>Full Name</td>
              <td>{formValues.fullName}</td>
            </tr>
            <tr>
              <td>Email Address</td>
              <td>{formValues.email}</td>
            </tr>
            <tr>
              <td>Phone Number</td>
              <td>{formValues.phoneNumber}</td>
            </tr>
            <tr>
              <td>Current Location</td>
              <td>{formValues.location || "N/A"}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section className="af-section">
        <h2>Job Parameters &amp; Tracking</h2>
        <table className="af-summary-table">
          <tbody>
            <tr>
              <td>Employment Type</td>
              <td>{employmentType}</td>
            </tr>
            <tr>
              <td>Job Title</td>
              <td>{jobTitle || "N/A"}</td>
            </tr>
            <tr>
              <td>Job Role</td>
              <td>{formValues.jobRole || "N/A"}</td>
            </tr>
            <tr>
              <td>Experience Level</td>
              <td>{formValues.experienceLevel || "N/A"}</td>
            </tr>
            {/* <tr><td>Portfolio Link</td><td>{formValues.portfolio || "N/A"}</td></tr> */}
          </tbody>
        </table>
      </section>
      <section className="af-section">
        <h2>Uploaded Documents Attached</h2>
        <table className="af-summary-table">
          <tbody>
            <tr>
              <td>Resume (CV)</td>
              <td>Doc {files.resume?.name}</td>
            </tr>
            {/* <tr>
              <td>Cover Letter File</td>
              <td>
                {files.coverLetter
                  ? `Doc ${files.coverLetter.name}`
                  : "None Uploaded"}
              </td>
            </tr>
            <tr>
              <td>Passport Photograph</td>
              <td>
                {files.photo ? `Image ${files.photo.name}` : "None Uploaded"}
              </td>
            </tr>
            <tr>
              <td>Additional File Extra</td>
              <td>
                {files.additional
                  ? `Doc ${files.additional.name}`
                  : "None Uploaded"}
              </td>
            </tr> */}
          </tbody>
        </table>
      </section>
      {/* <section className="af-section">
        // <h2>Statement of Motivation</h2>
        //{" "}
        <div className="af-summary-box">{formValues.statementOfMotivation}</div>
        //{" "}
      </section> */}
      <div className="af-summary-actions">
        <button
          type="button"
          onClick={onBack}
          className="af-btn-secondary"
          disabled={loading || !!success}
        >
          ← Back to Edit
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="af-btn-secondary"
          style={{ background: "var(--af-field-bg)" }}
          disabled={!!success}
        >
          Print / Download Form PDF
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="af-submit"
          disabled={loading || !!success}
        >
          {loading ? "Processing..." : "Confirm & Submit Application"}
        </button>
      </div>
    </div>
  );
}
