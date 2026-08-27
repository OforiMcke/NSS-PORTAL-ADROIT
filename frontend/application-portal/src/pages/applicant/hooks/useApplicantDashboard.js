import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";

function computeNextInterview(apps) {
  const now = new Date();
  return (
    (apps || [])
      .filter((app) => app.interviewDate && new Date(app.interviewDate) >= now)
      .sort(
        (a, b) => new Date(a.interviewDate) - new Date(b.interviewDate),
      )[0] || null
  );
}

export function useApplicantDashboard() {
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState("Dashboard");
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({
    firstName: "Applicant",
    lastName: "",
  });
  const [nextInterview, setNextInterview] = useState(null);

  const fetchApplicantData = useCallback(async () => {
    try {
      const [profileRes, appsRes] = await Promise.all([
        api.get("/api/auth/profile"),
        api.get("/api/applications/me"),
      ]);
      setProfile(profileRes.data);
      setApplications(appsRes.data.data);
      setNextInterview(computeNextInterview(appsRes.data.data));
    } catch (error) {
      console.error("Failed to load applicant dashboard data:", error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    Promise.all([api.get("/api/auth/profile"), api.get("/api/applications/me")])
      .then(([profileRes, appsRes]) => {
        if (!isMounted) return;
        setProfile(profileRes.data);
        setApplications(appsRes.data.data);
        setNextInterview(computeNextInterview(appsRes.data.data));
      })
      .catch((error) =>
        console.error("Failed to load applicant dashboard data:", error),
      );

    return () => {
      isMounted = false;
    };
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

  return {
    activeLink,
    setActiveLink,
    applications,
    profile,
    nextInterview,
    handleSidebarClick,
    fetchApplicantData,
    submittedCount: applications.length,
    acceptedCount: applications.filter((a) => a.status === "accepted").length,
    pendingCount: applications.filter((a) => a.status === "pending").length,
    interviewCount: applications.filter((a) => !!a.interviewDate).length,
  };
}
