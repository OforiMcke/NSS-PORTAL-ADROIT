import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import api from "../../api/axiosInstance";
import "./JobsList.css";

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    let mounted = true;

    api
      .get("/api/jobs")
      .then((res) => {
        if (!mounted) return;
        setJobs(res.data || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.response?.data?.message || "Failed to load jobs.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const buildLink = (jobId) => `${window.location.origin}/apply/${jobId}`;

  const handleCopy = async (jobId) => {
    try {
      await navigator.clipboard.writeText(buildLink(jobId));
      setCopiedId(jobId);
      setTimeout(
        () => setCopiedId((current) => (current === jobId ? null : current)),
        2000,
      );
    } catch {
      setError("Couldn't copy the link — copy it manually instead.");
    }
  };

  if (loading) {
    return <p className="jobs-list-state">Loading jobs...</p>;
  }

  if (error) {
    return <p className="jobs-list-state jobs-list-error">{error}</p>;
  }

  if (jobs.length === 0) {
    return <p className="jobs-list-state">No jobs created yet.</p>;
  }

  return (
    <div className="jobs-list-page">
      <h2>All Jobs</h2>

      <div className="jobs-list-table">
        <div className="jobs-list-row jobs-list-header">
          <span>Title</span>
          {/* <span>Category</span> */}
          <span>Type</span>
          <span>Status</span>
          <span>Link</span>
        </div>

        {jobs.map((job) => (
          <div className="jobs-list-row" key={job._id}>
            <span className="jobs-list-title">{job.title}</span>
            {/* <span>
              {job.category?.name || "—"}
              {job.subCategory?.name ? ` / ${job.subCategory.name}` : ""}
            </span> */}
            <span>{job.employmentType}</span>
            <span>
              <span
                className={`jobs-list-badge jobs-list-badge--${job.status}`}
              >
                {job.status}
              </span>
            </span>
            <span>
              <button
                type="button"
                className="jobs-list-copy-btn"
                onClick={() => handleCopy(job._id)}
              >
                {copiedId === job._id ? (
                  <>
                    <Check size={14} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy link
                  </>
                )}
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
