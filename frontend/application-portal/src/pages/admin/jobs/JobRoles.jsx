import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import {
  getJobRoles,
  createJobRole,
  deleteJobRole,
} from "../../../api/jobRoleService";
import "../jobs/JobRoles.css";

const JobRoles = () => {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchRoles = async () => {
    try {
      const responseData = await getJobRoles();
      const targetList = Array.isArray(responseData)
        ? responseData
        : responseData?.data || responseData?.jobs || responseData?.roles || [];
      setRoles(targetList);
    } catch (err) {
      console.error("Fetch roles error details:", err);
      setError("Failed to load job roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchRoles();
    })();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newRole.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const created = await createJobRole(newRole.trim());

      setRoles((prev) => {
        const nextList = [...prev, created];
        return nextList.sort((a, b) => {
          const nameA = a?.title ?? a?.name ?? "";
          const nameB = b?.title ?? b?.name ?? "";
          return nameA.localeCompare(nameB);
        });
      });
      setNewRole("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add role");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job role?")) return;
    try {
      await deleteJobRole(id);
      setRoles((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Deleting role error details:", err);
      setError("Failed to delete role");
    }
  };

  return (
    <div className="job-roles-page">
      <h1 className="job-roles-title">Job Roles</h1>

      <form onSubmit={handleAdd} className="job-roles-form">
        <input
          type="text"
          value={newRole}
          disabled={submitting}
          onChange={(e) => setNewRole(e.target.value)}
          placeholder="e.g. Frontend Developer"
          className="job-roles-input"
        />
        <button
          type="submit"
          disabled={submitting}
          className="job-roles-add-btn"
        >
          <Plus size={16} /> {submitting ? "Adding..." : "Add"}
        </button>
      </form>

      {error && <p className="job-roles-error">{error}</p>}

      {loading ? (
        <p>Loading roles...</p>
      ) : roles.length === 0 ? (
        <p className="job-roles-empty">No job roles yet. Add one above.</p>
      ) : (
        <ul className="job-roles-list">
          {roles.map((role) => (
            <li key={role._id} className="job-roles-list-item">
              <span>{role?.title ?? role?.name}</span>
              <button
                onClick={() => handleDelete(role._id)}
                className="job-roles-delete-btn"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JobRoles;
