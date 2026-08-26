import { useEffect, useState } from "react";
import { api } from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import TopBar from "../../../components/TopBar";
import "../../admin/dashboard.css";
import "./InterviewSections.css";

export default function InterviewSchedule() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [dateDrafts, setDateDrafts] = useState({});
  const [hiringId, setHiringId] = useState(null);

  useEffect(() => {
    let mounted = true;

    api
      .get("/api/applications/admin/interviews")
      .then((res) => {
        if (!mounted) return;
        setApplications(res.data?.data || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(
          err.response?.data?.message || "Failed to load interview schedule.",
        );
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const loadData = () => {
    setLoading(true);
    api
      .get("/api/applications/admin/interviews")
      .then((res) => setApplications(res.data?.data || []))
      .catch((err) =>
        setError(
          err.response?.data?.message || "Failed to load interview schedule.",
        ),
      )
      .finally(() => setLoading(false));
  };

  const handleSchedule = async (id) => {
    const interviewDate = dateDrafts[id];
    if (!interviewDate) return;
    setSavingId(id);
    setError("");
    try {
      await api.put(`/api/applications/${id}/interview`, { interviewDate });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule interview.");
    } finally {
      setSavingId(null);
    }
  };

  const handleMarkHired = async (id) => {
    setHiringId(id);
    setError("");
    try {
      await api.put(`/api/applications/${id}/hire`);
      loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to mark candidate as hired.",
      );
    } finally {
      setHiringId(null);
    }
  };

  const handleSidebarClick = (label) => {
    if (label === "Log Out") {
      localStorage.clear();
      api.defaults.headers.common.Authorization = "";
      navigate("/signin");
      return;
    }
    if (label === "Dashboard") return navigate("/admin");
    if (label === "Approved Candidates")
      return navigate("/admin/approved-candidates");
    if (label === "Interview Schedules") return;
    navigate("/admin/job-applications", { state: { initialView: label } });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        role="admin"
        activeLink="Interview Schedules"
        onLinkClick={handleSidebarClick}
      />
      <main className="dashboard-main">
        <TopBar userName="Recruiter" />
        <div className="jobs-list-page">
          <h2>Interview Schedules</h2>
          {error && <p className="jobs-list-state jobs-list-error">{error}</p>}
          {loading && <p className="jobs-list-state">Loading...</p>}
          {!loading && applications.length === 0 && (
            <p className="jobs-list-state">No accepted candidates yet.</p>
          )}
          {!loading && applications.length > 0 && (
            <div className="iv-table">
              <div className="iv-row iv-header">
                <span>Name</span>
                <span>Job Role</span>
                <span>Interview Date</span>
                <span>Action</span>
              </div>
              {applications.map((app) => (
                <div className="iv-row" key={app._id}>
                  <span className="iv-name">{app.fullName}</span>
                  <span>{app.jobRole || "—"}</span>
                  <span>
                    {app.interviewDate
                      ? new Date(app.interviewDate).toLocaleString()
                      : "Not scheduled"}
                  </span>
                  <span className="iv-actions">
                    <input
                      type="datetime-local"
                      onChange={(e) =>
                        setDateDrafts((prev) => ({
                          ...prev,
                          [app._id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="iv-btn iv-btn-set"
                      onClick={() => handleSchedule(app._id)}
                      disabled={savingId === app._id}
                    >
                      {savingId === app._id ? "Saving..." : "Set"}
                    </button>
                    <button
                      type="button"
                      className="iv-btn iv-btn-hire"
                      onClick={() => handleMarkHired(app._id)}
                      disabled={hiringId === app._id || !app.interviewDate}
                      title={
                        !app.interviewDate ? "Schedule an interview first" : ""
                      }
                    >
                      {hiringId === app._id ? "Saving..." : "Mark Hired"}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
