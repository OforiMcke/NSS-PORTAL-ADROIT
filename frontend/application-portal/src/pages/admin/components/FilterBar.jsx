const FILTERS = ["All", "Pending", "Accepted", "Declined"];

export default function FilterBar({ count, activeFilter, onFilterChange }) {
  return (
    <>
      <h1 className="jap-count">Applications ({count})</h1>

      <div className="jap-filters">
        <span className="jap-filters-label">Filter By:</span>
        {FILTERS.map((filter) => (
          <button
            key={filter}
            className={`jap-filter-pill ${activeFilter === filter ? "active" : ""}`}
            onClick={() => onFilterChange(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </>
  );
}

export { FILTERS };
