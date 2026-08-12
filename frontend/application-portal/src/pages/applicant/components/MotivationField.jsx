export default function MotivationField({ value, onChange }) {
  return (
    <div style={{ marginTop: "12px" }}>
      <label>
        Statement of Motivation <span style={{ color: "#d33" }}>*</span>
      </label>
      <textarea
        placeholder="Describe your motivation..."
        name="statementOfMotivation"
        value={value}
        onChange={onChange}
        rows={4}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          background: "var(--af-field-bg)",
          border: "none",
          color: "var(--af-field-text)",
          fontSize: "13px",
          resize: "vertical",
          outline: "none",
          fontFamily: "inherit",
        }}
        required
      />
    </div>
  );
}
