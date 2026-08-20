export default function JobSelectFields({
  roleOptions,
  loading,
  error,
  selectedJob,
  onChange,
}) {
  return (
    <>
      {error && (
        <div className="af-error" style={{ marginBottom: 8, color: "#d33" }}>
          {error}
        </div>
      )}

      <div className="af-grid-1" style={{ marginTop: "12px" }}>
        <div>
          <label>Select Job</label>
          <select
            name="selectedJob"
            value={selectedJob}
            className="af-select"
            disabled={loading || roleOptions.length === 0}
            onChange={onChange}
            required
          >
            <option value="">
              {loading
                ? "Loading jobs..."
                : roleOptions.length === 0
                  ? "No jobs available right now"
                  : "Select a job"}
            </option>
            {roleOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.role}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
