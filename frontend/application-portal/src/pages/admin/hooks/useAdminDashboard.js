import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/axiosInstance";

export const chartColors = [
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

export function useAdminDashboard() {
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

  return {
    activeLink,
    stats,
    timeRange,
    setTimeRange,
    recentActivity,
    userAvatarUrl,
    hiringData,
    upcomingInterviews,
    userName,
    maxValue,
    handleSidebarClick,
  };
}
