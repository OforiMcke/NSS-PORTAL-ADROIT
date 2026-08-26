import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import "../admin/dashboard.css";
import ApplicationForm from "./application/ApplicationForm.jsx";
import MyApplications from "./application/MyApplications.jsx";
import ApplicantInterviewSchedule from "./ApplicantInterviewSchedule.jsx";
import DashboardHome from "./components/DashboardHome.jsx";
import { useApplicantDashboard } from "./hooks/useApplicantDashboard";

export default function ApplicantDashboard() {
  const d = useApplicantDashboard();

  return (
    <div className="dashboard-layout">
      <Sidebar
        role="applicant"
        activeLink={d.activeLink}
        onLinkClick={d.handleSidebarClick}
      />

      <main className="dashboard-main">
        {d.activeLink !== "Apply" && (
          <TopBar
            userName={`${d.profile.firstName} ${d.profile.lastName}`.trim()}
            avatarUrl={d.profile.avatarUrl}
          />
        )}

        {d.activeLink === "Apply" && (
          <div className="dashboard-apply-embed">
            <ApplicationForm
              embedded
              onSubmitSuccess={() => {
                d.setActiveLink("Dashboard");
                d.fetchApplicantData();
              }}
            />
          </div>
        )}

        {d.activeLink === "My Applications" && <MyApplications />}
        {d.activeLink === "Interview Schedule" && (
          <ApplicantInterviewSchedule />
        )}
        {d.activeLink === "Dashboard" && (
          <DashboardHome d={d} onApplyClick={() => d.setActiveLink("Apply")} />
        )}
      </main>
    </div>
  );
}
