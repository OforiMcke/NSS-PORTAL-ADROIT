import {
  LayoutDashboard,
  FileText,
  UserCheck,
  CalendarClock,
  Settings,
  Users,
  LogOut,
} from "lucide-react";

const adminLinks = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Job Applications", icon: FileText },
  { label: "Approved Candidates", icon: UserCheck },
  { label: "Interview Schedules", icon: CalendarClock },
];

const applicantLinks = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Apply", icon: FileText },
  { label: "My Applications", icon: FileText },
  { label: "Interview Schedule", icon: CalendarClock },
];

const bottomLinks = [
  { label: "Settings", icon: Settings },
  { label: "Manage Users", icon: Users, adminOnly: true },
  { label: "Log Out", icon: LogOut },
];

export default function Sidebar({ role = "admin", activeLink, onLinkClick }) {
  const links = role === "admin" ? adminLinks : applicantLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo"></div>

      <nav className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.label}
              className={`sidebar-link ${
                activeLink === link.label ? "active" : ""
              }`}
              onClick={() => onLinkClick && onLinkClick(link.label)}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-divider" />

      <div className="sidebar-bottom">
        {bottomLinks
          .filter((l) => !l.adminOnly || role === "admin")
          .map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                className={`sidebar-link ${
                  activeLink === link.label ? "active" : ""
                }`}
                onClick={() => onLinkClick && onLinkClick(link.label)}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </button>
            );
          })}
      </div>
    </aside>
  );
}
