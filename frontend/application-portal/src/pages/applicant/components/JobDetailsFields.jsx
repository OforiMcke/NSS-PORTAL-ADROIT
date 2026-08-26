import "../application/ApplicationForm.css";

const EMPLOYMENT_TYPES = ["National Service Personnel"];

export default function JobDetailsFields({
  formValues,
  onChange,
  employmentType,
  onEmploymentTypeChange,
  roleOptions,
  isLocked,
  selectedRoleKey,
  onRoleChange,
  loading,
  error,
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
          {loading ? (
            <input
              type="text"
              className="af-input"
              value="Loading roles..."
              readOnly
              disabled
            />
          ) : roleOptions.length === 0 ? (
            <input
              type="text"
              className="af-input"
              value="No roles available right now"
              readOnly
              disabled
            />
          ) : isLocked ? (
            <input
              type="text"
              className="af-input"
              value={roleOptions[0]?.label || ""}
              readOnly
              disabled
            />
          ) : (
            <select
              name="jobRole"
              value={selectedRoleKey}
              className="af-select"
              onChange={onRoleChange}
              required
            >
              <option value="">Select a role</option>
              {roleOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
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
