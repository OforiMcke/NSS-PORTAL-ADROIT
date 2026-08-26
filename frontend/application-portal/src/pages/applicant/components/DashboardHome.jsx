import { FileText, UserCheck, Clock, CalendarDays } from "lucide-react";
import StatCard from "../../../components/StatCard";
import ApplicantWelcomeBanner from "./ApplicantWelcomeBanner";
import ApplicationsTable from "./ApplicationsTable";
import UpcomingInterview from "./UpcomingInterview";

export default function DashboardHome({ d, onApplyClick }) {
  return (
    <>
      <ApplicantWelcomeBanner
        profile={d.profile}
        submittedCount={d.submittedCount}
        interviewCount={d.interviewCount}
        onApplyClick={onApplyClick}
      />

      <section className="stats-row">
        <StatCard
          label="Applications Submitted:"
          value={d.submittedCount}
          icon={FileText}
        />
        <StatCard
          label="Interviews Scheduled:"
          value={d.interviewCount}
          icon={CalendarDays}
        />
        <StatCard label="Accepted:" value={d.acceptedCount} icon={UserCheck} />
        <StatCard label="Pending Review:" value={d.pendingCount} icon={Clock} />
      </section>

      <ApplicationsTable applications={d.applications} />
      <UpcomingInterview interview={d.nextInterview} />
    </>
  );
}
