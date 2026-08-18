const EMPLOYMENT_TYPES = [
  // "Intern",
  "National Service Personnel",
  // "Full-Time",
  // "Part-Time",
];
import "../ApplicationForm.css";
const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior Level"];

export default function JobDetailsFields({
  formValues,
  onChange,
  employmentType,
  onEmploymentTypeChange,
  job,
  rolePreselected = false,
}) {
  return (
    <>
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

      <h3 style={{ marginTop: "12px" }}>Job Details</h3>
      <div
        className={job ? "af-grid-2" : "af-grid-1"}
        style={{ marginTop: "12px" }}
      >
        {/* {job && (
          <div>
            <label>Job Title</label>
            <input
              type="text"
              className="af-input"
              value={job.title || ""}
              readOnly
              disabled
            />
          </div>
        )} */}

        <div>
          <label>Job Role</label>
          {rolePreselected ? (
            <input
              type="text"
              className="af-input"
              value={formValues.jobRole || "Not selected"}
              readOnly
              disabled
            />
          ) : job?.roles?.length > 0 ? (
            <select
              name="jobRole"
              className="af-select"
              value={formValues.jobRole}
              onChange={onChange}
              required
            >
              <option value="">Select Role</option>
              {job.roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="jobRole"
              className="af-input"
              value={formValues.jobRole}
              onChange={onChange}
            />
          )}
        </div>

        <div>
          <div>
            <label>Experience Level</label>
            <select
              name="experienceLevel"
              className="af-select"
              value={formValues.experienceLevel}
              onChange={onChange}
            >
              <option value="">Select Experience Level</option>
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

export { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS };
