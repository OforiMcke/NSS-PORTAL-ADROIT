export default function CategorySelectFields({
  categories,
  categoriesLoading,
  categoriesError,
  selectedCategory,
  subCategories,
  subCategoryId,
  onCategoryChange,
  onSubCategoryChange,
}) {
  return (
    <>
      {categoriesError && (
        <div className="af-error" style={{ marginBottom: 8, color: "#d33" }}>
          {categoriesError}
        </div>
      )}

      <div className="af-grid-2" style={{ marginTop: "12px" }}>
        <div>
          <label>Category Group</label>
          <select
            value={selectedCategory}
            name="categoryId"
            className="af-select"
            disabled={categoriesLoading}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">Select Category Group</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Sub-Category Position</label>
          <select
            value={subCategoryId}
            name="subCategoryId"
            className="af-select"
            disabled={subCategories.length === 0}
            onChange={onSubCategoryChange}
          >
            <option value="">Select Sub-Category Role</option>
            {subCategories.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
