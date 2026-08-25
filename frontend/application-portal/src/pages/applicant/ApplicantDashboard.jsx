import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, UserCheck, Clock, CalendarDays } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import StatCard from "../../components/StatCard";
import api from "../../api/axiosInstance";
import "../admin/dashboard.css";
import ApplicationForm from "./ApplicationForm.jsx";
import MyApplications from "./MyApplications.jsx";
import ApplicantInterviewSchedule from "./ApplicantInterviewSchedule.jsx";

const statusColor = {
  pending: "status-pending",
  accepted: "status-accepted",
  declined: "status-rejected",
  hired: "status-hired",
};

const statusLabel = {
  pending: "Under Review",
  accepted: "Accepted",
  declined: "Declined",
  hired: "Hired 🎉",
};

export default function ApplicantDashboard() {
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState("Dashboard");
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({
    firstName: "Applicant",
    lastName: "",
  });
  const [nextInterview, setNextInterview] = useState(null);

  const fetchApplicantData = async () => {
    try {
      const [profileRes, appsRes] = await Promise.all([
        api.get("/api/auth/profile"),
        api.get("/api/applications/me"), 
      ]);

      setProfile(profileRes.data);
      setApplications(appsRes.data.data);

      const now = new Date();
      const upcoming = (appsRes.data.data || [])
        .filter(
          (app) => app.interviewDate && new Date(app.interviewDate) >= now,
        )
        .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate));

      setNextInterview(upcoming[0] || null);
    } catch (error) {
      console.error("Failed to load applicant dashboard data:", error);
    }
  };

  useEffect(() => {
    const loadApplicantData = async () => {
      await fetchApplicantData();
    };

    loadApplicantData();
  }, []);

  const handleSidebarClick = (label) => {
    if (label === "Log Out") {
      const refreshToken = localStorage.getItem("refreshToken");
      api.post("/api/auth/logout", { refreshToken }).catch(() => {});

      localStorage.clear();
      api.defaults.headers.common.Authorization = "";
      navigate("/signin");
      return;
    }

    setActiveLink(label);
  };

  const submittedCount = applications.length;
  const acceptedCount = applications.filter(
    (app) => app.status === "accepted",
  ).length;
  const pendingCount = applications.filter(
    (app) => app.status === "pending",
  ).length;
  const interviewCount = applications.filter(
    (app) => !!app.interviewDate,
  ).length;

  return (
    <div className="dashboard-layout">
      <Sidebar
        role="applicant"
        activeLink={activeLink}
        onLinkClick={handleSidebarClick}
      />

      <main className="dashboard-main">
        {activeLink !== "Apply" && (
          <TopBar
            userName={`${profile.firstName} ${profile.lastName}`.trim()}
            avatarUrl={profile.avatarUrl}
          />
        )}

        {activeLink === "Apply" && (
          <div className="dashboard-apply-embed">
            <ApplicationForm
              embedded
              onSubmitSuccess={() => {
                setActiveLink("Dashboard");
                fetchApplicantData();
              }}
            />
          </div>
        )}

        {activeLink === "My Applications" && <MyApplications />}
        {activeLink === "Interview Schedule" && <ApplicantInterviewSchedule />}
        {activeLink === "Dashboard" && (
          <>
            <section className="welcome-banner">
              <div className="welcome-avatar welcome-avatar--initials">
                {profile.firstName
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <h1>Welcome back, {profile.firstName}</h1>
                <p>You have {submittedCount} active applications</p>
              </div>
              <div>
                <div className="bund own"></div>
                <div className="bund pu"></div>
                <div className="bund go"></div>
              </div>
              <div className="bundled last"></div>
              <div className="welcome-cta">
                <button
                  onClick={() => setActiveLink("Apply")}
                  className="welcome-cta-btn"
                >
                  Apply Now
                </button>
              </div>
              <div className="welcome-badge">
                {interviewCount} Interview{interviewCount === 1 ? "" : "s"} This
                Week
              </div>
            </section>

            <section className="stats-row">
              <StatCard
                label="Applications Submitted:"
                value={submittedCount}
                icon={FileText}
              />
              <StatCard
                label="Interviews Scheduled:"
                value={interviewCount}
                icon={CalendarDays}
              />
              <StatCard
                label="Accepted:"
                value={acceptedCount}
                icon={UserCheck}
              />
              <StatCard
                label="Pending Review:"
                value={pendingCount}
                icon={Clock}
              />
            </section>

            <section className="applications-card">
              <h3>My Applications</h3>
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Date Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, i) => (
                    <tr key={i}>
                      <td>{app.jobRole || "Unknown role"}</td>
                      <td>
                        <span
                          className={`status-badge ${statusColor[app.status]}`}
                        >
                          {statusLabel[app.status] || app.status}
                        </span>
                      </td>
                      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="schedule-card">
              <h3>Upcoming Interview</h3>
              {nextInterview ? (
                <div className="schedule-item">
                  <span className="schedule-dot" />
                  {nextInterview.jobRole || "Your role"} —{" "}
                  {new Date(nextInterview.interviewDate).toLocaleString(
                    "default",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    },
                  )}
                </div>
              ) : (
                <p className="jobs-list-state" style={{ padding: "12px 0" }}>
                  No upcoming interviews scheduled.
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
