import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Megaphone, Users2, Handshake } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import StatCard from "../../components/StatCard";
import axios from "axios";
import "../admin/dashboard.css";

const hiringData = [
  { label: "1", value: 35 },
  { label: "2", value: 45 },
  { label: "3", value: 60 },
  { label: "4", value: 55 },
  { label: "5", value: 75 },
  { label: "6", value: 85 },
  { label: "7", value: 95 },
  { label: "8", value: 105 },
  { label: "9", value: 120 },
  { label: "10", value: 140 },
];

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
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const userRole = localStorage.getItem("userRole");
  const userName =
    userRole === "admin"
      ? "Recruiter"
      : localStorage.getItem("userName") || "Recruiter";
  const [userAvatarUrl, setUserAvatarUrl] = useState("");
  const maxValue = Math.max(...hiringData.map((d) => d.value));

  const displayedActivity = recentActivity;
  useEffect(() => {
    let isMounted = true;

    const loadAdminData = async () => {
      try {
        const [{ data: statsData }, { data: recentData }, profileRes] =
          await Promise.all([
            axios.get("/api/applications/admin/stats"),
            axios.get("/api/applications/admin/recent"),
            axios.get("/api/auth/profile"),
          ]);

        if (!isMounted) return;

        setStats(statsData.data);
        setRecentActivity(
          recentData.data.map((application) => ({
            name: `${application.applicant.firstName} ${application.applicant.lastName}`,
            action: `applied for ${application.job?.title || "a role"}`,
            time: new Date(application.createdAt).toLocaleDateString(),
            // categoryName: application.category?.name,
            // subCategoryName: application.subCategory?.name,
            jobTitle: application.job?.title,
            employmentType: application.job?.employmentType,
          })),
        );
        setUserAvatarUrl(profileRes.data.avatarUrl || "");
      } catch (error) {
        console.error("Failed to load admin dashboard data:", error);
      }
    };

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSidebarClick = (label) => {
    if (label === "Log Out") {
      localStorage.clear();
      axios.defaults.headers.common.Authorization = "";
      navigate("/signin");
      return;
    }

    if (JOB_APPLICATIONS_GROUP.includes(label)) {
      setActiveLink(label);
      const initialView =
        label === "Job Applications" ? "All Applications" : label;
      navigate("/admin/job-applications", { state: { initialView } });
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
            <div className="bundle down"></div>
            <div className="bundle up"></div>
            <div className="bundle good"></div>
          </div>
          <div className="welcome-badge">
            Total Number of Jobs Open : {stats.totalApplicants}
          </div>
        </section>

        <section className="stats-row">
          {/* <StatCard
            label="Interviews Scheduled:"
            value={stats.acceptedApplications}
            icon={CalendarDays}
          /> */}
          <StatCard
            label="Open Jobs:"
            value={stats.totalApplicants}
            icon={Megaphone}
          />
          <StatCard
            label="Total Number of Applicants:"
            value={stats.totalApplicants}
            icon={Users2}
          />
          <StatCard
            label="Hires This Month:"
            value={stats.acceptedApplications}
            icon={Handshake}
          />
        </section>

        <section className="content-row">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Hiring Chart</h3>
              <select className="chart-filter">
                <option>This month</option>
                <option>Last month</option>
                <option>This year</option>
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
              {displayedActivity.length === 0 ? (
                <li className="activity-item">
                  <div>No recent activity.</div>
                </li>
              ) : (
                displayedActivity.map((item, i) => (
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
          {/* <div className="schedule-item">
            <span className="schedule-dot" />
            Interview with Grace Nova today at 8:15 AM
          </div> */}
        </section>
      </main>
    </div>
  );
}
