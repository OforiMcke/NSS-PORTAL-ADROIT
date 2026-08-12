export default function CategoryTabs({ categories, activeTab, tabLabel, onTabChange }) {
  return (
    <>
      <div className="jap-tabs">
        {categories.map((category) => (
          <button
            key={category._id}
            className={`jap-tab ${activeTab === category._id ? "active" : ""}`}
            onClick={() => onTabChange(category._id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="jap-banner">
        <span>{tabLabel}</span>
        <div className="jap-banner-lines">
          <div className="jap-line down" />
          <div className="jap-line up" />
        </div>
      </div>
    </>
  );
}
