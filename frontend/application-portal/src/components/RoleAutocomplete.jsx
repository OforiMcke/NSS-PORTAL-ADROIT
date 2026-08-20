import { useState, useEffect, useRef } from "react";
import { getJobRoles } from "../api/jobRoleService";
import "./RoleAutocomplete.css";

export default function RoleAutocomplete({ selectedRoles, onAdd, onRemove }) {
  const [allRoles, setAllRoles] = useState([]);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    getJobRoles()
      .then((data) => setAllRoles(data))
      .catch(() => setError("Couldn't load roles list"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = allRoles.filter(
    (r) =>
      r.name.toLowerCase().includes(input.trim().toLowerCase()) &&
      !selectedRoles.includes(r.name) &&
      input.trim().length > 0,
  );

  const handleSelect = (roleName) => {
    onAdd(roleName);
    setInput("");
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const exactMatch = allRoles.find(
        (r) => r.name.toLowerCase() === input.trim().toLowerCase(),
      );
      if (exactMatch && !selectedRoles.includes(exactMatch.name)) {
        handleSelect(exactMatch.name);
      } else if (filteredSuggestions.length > 0) {
        handleSelect(filteredSuggestions[0].name);
      }
    }
  };

  return (
    <div className="role-autocomplete" ref={wrapperRef}>
      <input
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder={loading ? "Loading roles..." : "Start typing a role..."}
        className="role-autocomplete-input"
        disabled={loading}
      />

      {error && <p className="role-autocomplete-error">{error}</p>}

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="role-autocomplete-suggestions">
          {filteredSuggestions.map((r) => (
            <li key={r._id} onClick={() => handleSelect(r.name)}>
              {r.name}
            </li>
          ))}
        </ul>
      )}

      {showSuggestions &&
        input.trim().length > 0 &&
        filteredSuggestions.length === 0 &&
        !loading && (
          <ul className="role-autocomplete-suggestions">
            <li className="role-autocomplete-no-match">
              No matching role found
            </li>
          </ul>
        )}

      <div className="role-chip-list">
        {selectedRoles.map((r) => (
          <span key={r} className="role-chip">
            {r}
            <button
              type="button"
              className="re-btn"
              onClick={() => onRemove(r)}
              aria-label={`Remove ${r}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
