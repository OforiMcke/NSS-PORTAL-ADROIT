import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import TopBar from "../../../components/TopBar";
import "../../admin/dashboard.css";
import "./JobApplicationPage.css";
import CreateAdmin from "../CreateAdmin";
import { api } from "../../../api/axiosInstance";

import FilterBar from "../components/FilterBar";
import ApplicationList from "../components/ApplicationList";
import ApplicationDetailPanel from "../components/ApplicationDetailPanel";
import CreateJob from "../jobs/CreateJob";
import JobsList from "../jobs/JobsList";
import JobRoles from "../jobs/JobRoles";

export default function JobApplicationsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [applications, setApplications] = useState([]);

  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("Recruiter");
  const [userEmail, setUserEmail] = useState("recruiter@adroit360.com");
  const [activeLink, setActiveLink] = useState(
    location.state?.initialView || "All Applications",
  );
  <TopBar userName={userName} userEmail={userEmail} />;

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [applicationsRes, profileRes] = await Promise.all([
          api.get("/api/applications/admin/list"),
          api.get("/api/auth/profile"),
        ]);

        if (!isMounted) return;

        setApplications(applicationsRes.data?.data || []);

        const profile = profileRes.data || {};
        const nextName =
          [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
          "Recruiter";
        setUserName(nextName);
        setUserEmail(profile.email || "recruiter@adroit360.com");
      } catch (err) {
        if (!isMounted) return;
        setError(
          err.response?.data?.message ||
            "Unable to load applications right now.",
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [setUserEmail]);

  const list = applications.filter((application) => {
    const matchesFilter =
      activeFilter === "All" ||
      application.status?.toLowerCase() === activeFilter.toLowerCase();
    const searchValue =
      `${application.fullName || ""} ${application.email || ""} ${application.job?.title || ""}`.toLowerCase();
    const matchesSearch =
      !searchQuery || searchValue.includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const selected =
    list.find((application) => application._id === selectedId) ??
    list[0] ??
    null;

  const handleStatusAction = async (action, applicationId) => {
    try {
      setUpdatingId(applicationId);
      setError("");

      if (action === "accept") {
        await api.put(`/api/applications/${applicationId}/accept`);
      } else {
        await api.put(`/api/applications/${applicationId}/decline`);
      }

      setApplications((current) =>
        current.map((application) =>
          application._id === applicationId
            ? {
                ...application,
                status: action === "accept" ? "accepted" : "declined",
              }
            : application,
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Unable to ${action} this application right now.`,
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewResume = (url) => {
    if (!url) {
      setError("No resume/CV is attached to this application yet.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const handleViewAdditionalDoc = (url) => {
    if (!url) {
      setError("No additional document is attached to this application.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSidebarClick = (label) => {
    if (label === "Log Out") {
      localStorage.clear();
      api.defaults.headers.common.Authorization = "";
      navigate("/signin");
      return;
    }

    if (label === "Dashboard") {
      navigate("/admin");
      return;
    }

    if (label === "Approved Candidates") {
      navigate("/admin/approved-candidates");
      return;
    }

    if (label === "Interview Schedules") {
      navigate("/admin/interview-schedule");
      return;
    }

    setActiveLink(label === "Job Applications" ? "All Applications" : label);
  };

  const isCreateJobView = activeLink === "Create Job";
  const isAllJobsView = activeLink === "All Jobs";
  const isCreateAdminView = activeLink === "Create Admin";
  const isJobRolesView = activeLink === "Job Roles";
  return (
    <div className="dashboard-layout">
      <Sidebar
        role="admin"
        activeLink={activeLink}
        onLinkClick={handleSidebarClick}
      />

      <main className="dashboard-main">
        <TopBar userName={userName} />

        {isCreateJobView ? (
          <CreateJob />
        ) : isAllJobsView ? (
          <JobsList onCreateJob={() => setActiveLink("Create Job")} />
        ) : isCreateAdminView ? (
          <CreateAdmin />
        ) : isJobRolesView ? (
          <JobRoles />
        ) : (
          <>
            <div className="jap-content">
              <section className="jap-list-panel">
                <FilterBar
                  count={list.length}
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                />

                <ApplicationList
                  list={list}
                  loading={loading}
                  error={error}
                  selectedId={selected?._id}
                  onSelect={setSelectedId}
                />
              </section>
              {selected && (
                <ApplicationDetailPanel
                  application={selected}
                  isUpdating={updatingId === selected._id}
                  onViewResume={handleViewResume}
                  onViewAdditionalDoc={handleViewAdditionalDoc}
                  onAccept={() => handleStatusAction("accept", selected._id)}
                  onDecline={() => handleStatusAction("decline", selected._id)}
                />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
