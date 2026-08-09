import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Eye,
  ListChecks,
  Download,
  LoaderCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import "../admin/dashboard.css";
import "./JobApplicationPage.css";

const FILTERS = ["All", "Pending", "Accepted", "Declined"];

function initials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusLabel(status) {
  switch (status) {
    case "accepted":
      return "Accepted";
    case "declined":
      return "Declined";
    default:
      return "Pending";
  }
}

export default function JobApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("Recruiter");
  const [userEmail, setUserEmail] = useState("recruiter@adroit360.com");
  const [activeLink, setActiveLink] = useState("Job Applications");

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [categoriesRes, applicationsRes, profileRes] = await Promise.all([
          axios.get("/api/categories"),
          axios.get("/api/applications/admin/list"),
          axios.get("/api/auth/profile"),
        ]);

        if (!isMounted) return;

        const categoryList = categoriesRes.data?.data || [];
        setCategories(categoryList);
        setApplications(applicationsRes.data?.data || []);

        if (categoryList.length) {
          setActiveTab((current) => current || categoryList[0]._id);
        }

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
  }, []);

  useEffect(() => {
    if (!categories.length || !applications.length) {
      setSelectedId(null);
      return;
    }

    if (!activeTab) {
      setActiveTab(categories[0]._id);
      return;
    }

    const categoryExists = categories.some(
      (category) => category._id === activeTab,
    );
    if (!categoryExists) {
      setActiveTab(categories[0]._id);
      return;
    }

    const firstVisible = applications.find(
      (application) =>
        (application.category?._id || application.category) === activeTab,
    );

    setSelectedId((currentId) => {
      if (currentId && applications.some((app) => app._id === currentId)) {
        return currentId;
      }
      return firstVisible?._id || null;
    });
  }, [activeTab, applications, categories]);

  const list = applications.filter((application) => {
    const categoryId = application.category?._id || application.category;
    const matchesCategory = categoryId === activeTab;
    const matchesFilter =
      activeFilter === "All" ||
      application.status?.toLowerCase() === activeFilter.toLowerCase();
    const searchValue =
      `${application.fullName || ""} ${application.email || ""} ${application.category?.name || ""} ${application.subCategory?.name || ""}`.toLowerCase();
    const matchesSearch =
      !searchQuery || searchValue.includes(searchQuery.toLowerCase());

    return matchesCategory && matchesFilter && matchesSearch;
  });

  const selected =
    list.find((application) => application._id === selectedId) ??
    list[0] ??
    null;
  const tabLabel =
    categories.find((category) => category._id === activeTab)?.name ||
    "Applications";

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSelectedId(null);
  };

  const handleStatusAction = async (action, applicationId) => {
    try {
      setUpdatingId(applicationId);
      setError("");

      if (action === "accept") {
        await axios.put(`/api/applications/${applicationId}/accept`);
      } else {
        await axios.put(`/api/applications/${applicationId}/decline`);
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
      setError("No resume is attached to this application yet.");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSidebarClick = (label) => {
    if (label === "Log Out") {
      localStorage.clear();
      axios.defaults.headers.common.Authorization = "";
      navigate("/signin");
      return;
    }

    if (label === "Dashboard") {
      navigate("/admin");
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
        <TopBar userName={userName} />

        <div className="jap-tabs">
          {categories.map((category) => (
            <button
              key={category._id}
              className={`jap-tab ${activeTab === category._id ? "active" : ""}`}
              onClick={() => handleTabChange(category._id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="jap-banner">
          <span>{tabLabel}</span>
          <div className="jap-banner-lines">
            <div className="jap-line down" />
            <div className="jap-line up" />
          </div>
        </div>

        <div className="jap-content">
          <section className="jap-list-panel">
            <h1 className="jap-count">Applications ({list.length})</h1>

            <div className="jap-filters">
              <span className="jap-filters-label">Filter By:</span>
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  className={`jap-filter-pill ${
                    activeFilter === filter ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="jap-empty-state">
                <LoaderCircle className="jap-spinner" size={20} />
                Loading applications...
              </div>
            ) : error ? (
              <div className="jap-empty-state">{error}</div>
            ) : list.length === 0 ? (
              <div className="jap-empty-state">No applications found.</div>
            ) : (
              <div className="jap-list">
                {list.map((application) => (
                  <button
                    key={application._id}
                    className={`jap-card ${
                      selected?._id === application._id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedId(application._id)}
                  >
                    <div className="jap-card-top">
                      <div
                        className="jap-card-avatar"
                        style={{ background: "#0a0a5c" }}
                      >
                        {initials(application.fullName)}
                      </div>
                      <div className="jap-card-name">
                        <strong>{application.fullName}</strong>
                        <span>{application.email}</span>
                      </div>
                      <span className="jap-card-date">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="jap-card-role">
                      {application.subCategory?.name || "General application"}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {selected && (
            <section className="jap-detail-panel">
              <div className="jap-profile-card">
                <div className="jap-profile-stats">
                  <span className="jap-stat-pill">
                    <Eye size={13} /> {statusLabel(selected.status)}
                  </span>
                  <span className="jap-stat-pill">
                    <ListChecks size={13} />{" "}
                    {selected.subCategory?.name || "General"}
                  </span>
                </div>

                <div className="jap-profile-main">
                  <div
                    className="jap-profile-avatar"
                    style={{ background: "#0a0a5c" }}
                  >
                    {initials(selected.fullName)}
                  </div>
                  <div className="jap-profile-text">
                    <strong>{selected.fullName}</strong>
                    <span>{selected.phoneNumber || "Phone not provided"}</span>
                    <span className="jap-applied-ago">
                      Applied{" "}
                      {new Date(selected.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="jap-cover-letter">
                <span className="jap-section-title">Applicant Note</span>
                <button className="jap-download-pill" type="button">
                  <Download size={13} />
                  Review motivation
                </button>
              </div>

              <div className="jap-white-card">
                <span className="jap-section-title">Contact Details</span>
                <div className="jap-insight-row">
                  <strong>Email</strong>
                  <p>{selected.email}</p>
                </div>
                <div className="jap-insight-row">
                  <strong>Category</strong>
                  <p>{selected.category?.name || "Unassigned"}</p>
                </div>
              </div>

              <div className="jap-white-card">
                <div className="jap-resume-header">
                  <span className="jap-section-title">Application Summary</span>
                  <button
                    className="jap-download-btn"
                    type="button"
                    onClick={() => handleViewResume(selected.cvUrl)}
                  >
                    <Download size={13} />
                    Download Resume
                  </button>
                </div>

                <h3>{selected.fullName}</h3>

                <h4>Motivation</h4>
                <p>
                  {selected.statementOfMotivation ||
                    "No motivation statement provided."}
                </p>

                <div className="jap-action-row">
                  <button
                    className="jap-action-btn accept"
                    type="button"
                    onClick={() => handleStatusAction("accept", selected._id)}
                    disabled={
                      updatingId === selected._id ||
                      selected.status === "accepted"
                    }
                  >
                    {updatingId === selected._id ? (
                      <LoaderCircle className="jap-spinner" size={14} />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    Accept
                  </button>
                  <button
                    className="jap-action-btn decline"
                    type="button"
                    onClick={() => handleStatusAction("decline", selected._id)}
                    disabled={
                      updatingId === selected._id ||
                      selected.status === "declined"
                    }
                  >
                    {updatingId === selected._id ? (
                      <LoaderCircle className="jap-spinner" size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}
                    Decline
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
