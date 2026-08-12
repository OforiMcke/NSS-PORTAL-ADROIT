export default function DeclarationCheckbox({ agreed, onChange }) {
  return (
    <div style={{ marginTop: "16px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
      <input
        type="checkbox"
        id="af-agree"
        checked={agreed}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor="af-agree" style={{ fontSize: "13px" }}>
        I confirm that the information provided is accurate to the best of my knowledge.
      </label>
    </div>
  );
}
