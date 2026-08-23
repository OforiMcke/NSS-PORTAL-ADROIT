import { useEffect, useState } from "react";
import { api } from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import "../admin/dashboard.css";
import "./InterviewSections.css";

export default function ApprovedCandidates() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    api
      .get("/api/applications/admin/list", { params: { status: "accepted" } })
      .then((res) => {
        if (!mounted) return;
        setCandidates(res.data?.data || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(
          err.response?.data?.message || "Failed to load approved candidates.",
        );
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const handleSidebarClick = (label) => {
    if (label === "Log Out") {
      localStorage.clear();
      api.defaults.headers.common.Authorization = "";
      navigate("/signin");
      return;
    }
    if (label === "Dashboard") return navigate("/admin");
    if (label === "Interview Schedules")
      return navigate("/admin/interview-schedule");
    if (label === "Approved Candidates") return;
    navigate("/admin/job-applications", { state: { initialView: label } });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        role="admin"
        activeLink="Approved Candidates"
        onLinkClick={handleSidebarClick}
      />
      <main className="dashboard-main">
        <TopBar userName="Recruiter" />
        <div className="jobs-list-page">
          <h2>Approved Candidates</h2>
          {loading && <p className="jobs-list-state">Loading...</p>}
          {!loading && error && (
            <p className="jobs-list-state jobs-list-error">{error}</p>
          )}
          {!loading && !error && candidates.length === 0 && (
            <p className="jobs-list-state">No approved candidates yet.</p>
          )}
          {!loading && !error && candidates.length > 0 && (
            <div className="iv-table">
              <div className="iv-row iv-header">
                <span>Name</span>
                <span>Email</span>
                <span>Job Role</span>
                <span>Interview Date</span>
              </div>
              {candidates.map((c) => (
                <div className="iv-row" key={c._id}>
                  <span className="iv-name">{c.fullName}</span>
                  <span>{c.email}</span>
                  <span>{c.jobRole || c.jobTitle || c.job?.title || "—"}</span>
                  <span>
                    {c.interviewDate
                      ? new Date(c.interviewDate).toLocaleString()
                      : "Not scheduled"}
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
