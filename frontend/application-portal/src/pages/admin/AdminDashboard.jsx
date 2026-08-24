import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, Users2, Handshake } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import StatCard from "../../components/StatCard";
import { api } from "../../api/axiosInstance";
import "../admin/dashboard.css";

const chartColors = [
  "#96a7d2",
  "#629dd1",
  "#297fd5",
  "#7f8fa9",
  "#5aa2ae",
  "#9d90a0",
  "#4762a7",
  "#2a5f8e",
  "#194c80",
  "#3c485a",
];

const JOB_APPLICATIONS_GROUP = [
  "Job Applications",
  "All Applications",
  "All Jobs",
  "Create Job",
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState("Dashboard");
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    declinedApplications: 0,
    totalApplicants: 0,
    openJobsCount: 0,
    hiredApplications: 0,
  });
  const [timeRange, setTimeRange] = useState(10);

  const [recentActivity, setRecentActivity] = useState([]);
  const [userAvatarUrl, setUserAvatarUrl] = useState("");
  const [hiringData, setHiringData] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);

  const userRole = localStorage.getItem("userRole");
  const userName =
    userRole === "admin"
      ? "Recruiter"
      : localStorage.getItem("userName") || "Recruiter";

  const maxValue = Math.max(...hiringData.map((d) => d.value), 1);
  useEffect(() => {
    let isMounted = true;

    const loadAdminData = async () => {
      try {
        const [
          { data: statsData },
          { data: recentData },
          profileRes,
          { data: trendData },
          { data: interviewsData },
        ] = await Promise.all([
          api.get("/api/applications/admin/stats"),
          api.get("/api/applications/admin/recent"),
          api.get("/api/auth/profile"),
          api.get(`/api/applications/admin/hiring-trend?months=${timeRange}`),
          api.get("/api/applications/admin/upcoming-interviews"),
        ]);

        if (!isMounted) return;

        setHiringData(trendData.data || []);
        setUpcomingInterviews(interviewsData.data || []);
        setStats(statsData.data || {});
        setUserAvatarUrl(profileRes.data?.avatarUrl || "");
        setRecentActivity(
          (recentData.data || []).map((app) => ({
            name: app.applicant
              ? `${app.applicant.firstName} ${app.applicant.lastName}`
              : app.fullName || "Anonymous applicant",
            action: `applied for ${app.jobRole || "a role"}`,
            time: new Date(app.createdAt).toLocaleDateString(),
          })),
        );
      } catch (error) {
        console.error("Failed to load admin dashboard data:", error);
      }
    };

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, [timeRange]);

  const handleSidebarClick = (label) => {
    if (label === "Log Out") {
      const refreshToken = localStorage.getItem("refreshToken");
      api.post("/api/auth/logout", { refreshToken }).catch(() => {});
      localStorage.clear();
      api.defaults.headers.common.Authorization = "";
      navigate("/signin");
      return;
    }

    if (label === "Approved Candidates")
      return navigate("/admin/approved-candidates");
    if (label === "Interview Schedules")
      return navigate("/admin/interview-schedule");

    if (JOB_APPLICATIONS_GROUP.includes(label)) {
      setActiveLink(label);
      navigate("/admin/job-applications", { state: { initialView: label } });
      return;
    }

    if (label === "Create Admin") {
      setActiveLink(label);
      navigate("/admin/job-applications", {
        state: { initialView: "Create Admin" },
      });
      return;
    }

    if (label === "Job Roles") {
      setActiveLink(label);
      navigate("/admin/job-roles");
      return;
    }

    setActiveLink(label);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        role="admin"
        activeLink={activeLink}
        onLinkClick={handleSidebarClick}
      />

      <main className="dashboard-main">
        <TopBar userName={userName} avatarUrl={userAvatarUrl} />

        <section className="welcome-banner">
          <div className="welcome-avatar welcome-avatar--initials">
            {userName
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <h1>Hello {userName.split(" ")[0] || "Recruiter"},</h1>
            <p>You have received {stats.totalApplications} responses</p>
          </div>
          <div>
            <div className="bund own"></div>
            <div className="bund pu"></div>
            <div className="bund go"></div>
          </div>
          <div className="bundled last"></div>
          <div className="welcome-badge">
            Total Number of Jobs Open : {stats.openJobsCount}
          </div>
        </section>

        <section className="stats-row">
          <StatCard
            label="Open Jobs:"
            value={stats.openJobsCount}
            icon={Megaphone}
          />
          <StatCard
            label="Total Number of Applicants:"
            value={stats.totalApplicants}
            icon={Users2}
          />
          <StatCard
            label="Hires This Month:"
            value={stats.hiredApplications}
            icon={Handshake}
          />
        </section>

        <section className="content-row">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Hiring Chart</h3>
              <select
                className="chart-filter"
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
              >
                <option value={6}>Last 6 Months</option>
                <option value={10}>Last 10 Months</option>
                <option value={12}>Last 12 Months</option>
              </select>
            </div>
            <div className="bar-chart">
              {hiringData.map((d, i) => {
                const color = chartColors[i % chartColors.length];
                return (
                  <div className="bar-wrapper" key={i}>
                    <div
                      className="bar"
                      style={{
                        height: `${(d.value / maxValue) * 100}%`,
                        background: `${color}`,
                      }}
                    />
                    <span className="bar-label">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="activity-card">
            <h3>Recent Activity</h3>
            <ul className="activity-list">
              {recentActivity.length === 0 ? (
                <li className="activity-item">
                  <div>No recent activity.</div>
                </li>
              ) : (
                recentActivity.map((item, i) => (
                  <li key={i} className="activity-item">
                    <span className={`activity-dot dot-${i % 6}`} />
                    <div>
                      <p>
                        <strong>{item.name}</strong> {item.action}
                      </p>
                      <span className="activity-time">{item.time}</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>

        <section className="schedule-card">
          <h3>Current Schedule</h3>
          {upcomingInterviews.length === 0 ? (
            <p className="jobs-list-state">No interviews scheduled yet.</p>
          ) : (
            upcomingInterviews.map((interview) => (
              <div className="schedule-item" key={interview._id}>
                <span className="schedule-dot" />
                {interview.fullName} —{" "}
                {interview.job?.title || interview.jobRole || "a role"} on{" "}
                {new Date(interview.interviewDate).toLocaleString()}
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
