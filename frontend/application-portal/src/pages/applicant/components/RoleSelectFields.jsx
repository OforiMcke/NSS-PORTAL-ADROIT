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
          <label>Select Job Role</label>
          <select
            value={selectedRoleKey}
            className="af-select"
            disabled={loading || roleOptions.length === 0}
            onChange={(e) => onRoleChange(e.target.value)}
            required
          >
            <option value="">
              {loading
                ? "Loading roles..."
                : roleOptions.length === 0
                  ? "No roles available right now"
                  : "Select a role"}
            </option>
            {roleOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.role} — {opt.jobTitle}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
