export default function JobSelectFields({
  jobs,
  jobsLoading,
  jobsError,
  selectedJobId,
  onJobChange,
}) {
  return (
    <>
      {jobsError && (
        <div className="af-error" style={{ marginBottom: 8, color: "#d33" }}>
          {jobsError}
        </div>
      )}

      <div className="af-grid-1" style={{ marginTop: "12px" }}>
        <div>
          <label>Select Position</label>
          <select
            value={selectedJobId}
            name="jobId"
            className="af-select"
            disabled={jobsLoading || jobs.length === 0}
            onChange={(e) => onJobChange(e.target.value)}
            required
          >
            <option value="">
              {jobsLoading
                ? "Loading open positions..."
                : jobs.length === 0
                  ? "No open positions right now"
                  : "Select an open position"}
            </option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title} ({j.employmentType})
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
