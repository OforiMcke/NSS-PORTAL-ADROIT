import { Megaphone, Users2, Handshake } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import StatCard from "../../components/StatCard";
import WelcomeBanner from "./components/WelcomeBanner";
import HiringChart from "./components/HiringChart";
import ActivityFeed from "./components/ActivityFeed";
import InterviewSchedule from "./components/InterviewSchedule";
import { useAdminDashboard } from "./hooks/useAdminDashboard";
import "../admin/dashboard.css";

export default function AdminDashboard() {
  const d = useAdminDashboard();

  return (
    <div className="dashboard-layout">
      <Sidebar
        role="admin"
        activeLink={d.activeLink}
        onLinkClick={d.handleSidebarClick}
      />

      <main className="dashboard-main">
        <TopBar userName={d.userName} avatarUrl={d.userAvatarUrl} />
        <WelcomeBanner userName={d.userName} stats={d.stats} />

        <section className="stats-row">
          <StatCard
            label="Open Jobs:"
            value={d.stats.openJobsCount}
            icon={Megaphone}
          />
          <StatCard
            label="Total Number of Applicants:"
            value={d.stats.totalApplicants}
            icon={Users2}
          />
          <StatCard
            label="Hires This Month:"
            value={d.stats.hiredApplications}
            icon={Handshake}
          />
        </section>

        <section className="content-row">
          <HiringChart
            hiringData={d.hiringData}
            maxValue={d.maxValue}
            timeRange={d.timeRange}
            onTimeRangeChange={d.setTimeRange}
          />
          <ActivityFeed recentActivity={d.recentActivity} />
        </section>

        <InterviewSchedule upcomingInterviews={d.upcomingInterviews} />
      </main>
    </div>
  );
}
