import "../ApplicationForm.css";

const EMPLOYMENT_TYPES = ["National Service Personnel"];

export default function JobDetailsFields({
  formValues,
  onChange,
  employmentType,
  onEmploymentTypeChange,
  // job,

  roleOptions = [],
  loading = false,
  error = null,
}) {
  return (
    <>
      {error && (
        <div className="af-error" style={{ marginBottom: 8, color: "#d33" }}>
          {error}
        </div>
      )}

      <div>
        <h3>Employment Type</h3>
        <div className="af-button-group">
          {EMPLOYMENT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`af-button ${employmentType === type ? "af-button--active" : ""}`}
              onClick={() => onEmploymentTypeChange(type)}
              aria-pressed={employmentType === type}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <h3 style={{ marginTop: "16px" }}>Job Details</h3>
      <div className="af-grid-2" style={{ marginTop: "12px" }}>
        <div>
          <label>Job Role</label>
          <select
            name="selectedJob"
            value={formValues.selectedJob || ""}
            className="af-select"
            disabled={loading || roleOptions.length === 0}
            onChange={onChange}
            required
          >
            <option value="">
              {loading
                ? "Loading roles..."
                : roleOptions.length === 0
                  ? "No roles available right now"
                  : "Select a role"}
            </option>
            {roleOptions &&
              roleOptions.map((opt) => (
                <option key={opt.key ?? opt.role} value={opt.key}>
                  {opt.role}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label>Years of experience</label>
          <input
            type="text"
            name="yearsOfExperience"
            className="af-input"
            value={formValues.yearsOfExperience}
            onChange={onChange}
          />
        </div>
      </div>
    </>
  );
}

export { EMPLOYMENT_TYPES };
