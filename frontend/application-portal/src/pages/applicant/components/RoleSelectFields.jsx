export default function RoleSelectFields({
  roleOptions,
  loading,
  error,
  selectedRoleKey,
  onRoleChange,
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
            value={selectedRoleKey}
            className="af-select"
            disabled={loading || roleOptions.length === 0}
            onChange={(e) => onRoleChange(e.target.value)}
            required
          >
            <option value="">
              {loading
                ? "Loading jobs..."
                : roleOptions.length === 0
                  ? "No jobs available right now"
                  : "Select a job"}
            </option>
            {roleOptions &&
              roleOptions.map((opt) => (
                <option key={opt.key ?? opt.role} value={opt.key}>
                  {opt.role}
                </option>
              ))}
          </select>
        </div>
      </div>
    </>
  );
}
