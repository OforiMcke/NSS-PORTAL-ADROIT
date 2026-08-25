import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  UserCheck,
  CalendarClock,
  LogOut,
  PlusCircle,
  Briefcase,
  UserPlus,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const adminLinks = [
  { label: "Dashboard", icon: LayoutDashboard },
  {
    label: "Job Applications",
    icon: FileText,
    children: [
      { label: "All Applications", icon: FileText },
      { label: "All Jobs", icon: Briefcase },
      { label: "Create Job", icon: PlusCircle },
      { label: "Job Roles", icon: Briefcase },
    ],
  },
  { label: "Create Admin", icon: UserPlus },
  { label: "Approved Candidates", icon: UserCheck },
  { label: "Interview Schedules", icon: CalendarClock },
];

const applicantLinks = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Apply", icon: FileText },
  { label: "My Applications", icon: FileText },
  { label: "Interview Schedule", icon: CalendarClock },
];

const bottomLinks = [{ label: "Log Out", icon: LogOut }];

export default function Sidebar({ role = "admin", activeLink, onLinkClick }) {
  const [isOpen, setIsOpen] = useState(false);

  const links = role === "admin" ? adminLinks : applicantLinks;

  const initiallyExpanded = links.find((l) =>
    l.children?.some((c) => c.label === activeLink),
  )?.label;

  const [expanded, setExpanded] = useState(initiallyExpanded || null);

  const toggleExpanded = (label) => {
    setExpanded((prev) => (prev === label ? null : label));
  };

  const handleLinkClick = (label) => {
    if (onLinkClick) onLinkClick(label);
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="mobile-hamburger-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Open Menu"
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`sidebar ${isOpen ? "mobile-open" : ""}`}>
        <button
          className="mobile-close-btn"
          onClick={() => setIsOpen(false)}
          aria-label="Close Menu"
        >
          <X size={24} />
        </button>

        <div className="sidebar-logo"></div>

        <nav className="sidebar-nav">
          {links.map((link) => {
            const Icon = link.icon;
            const hasChildren = Array.isArray(link.children);
            const isExpanded = expanded === link.label;
            const isParentActive =
              activeLink === link.label ||
              link.children?.some((c) => c.label === activeLink);

            return (
              <div key={link.label} className="sidebar-group">
                <button
                  className={`sidebar-link ${isParentActive ? "active" : ""}`}
                  onClick={() => {
                    if (hasChildren) {
                      toggleExpanded(link.label);
                    } else {
                      handleLinkClick(link.label);
                    }
                  }}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                  {hasChildren &&
                    (isExpanded ? (
                      <ChevronDown size={16} className="sidebar-chevron" />
                    ) : (
                      <ChevronRight size={16} className="sidebar-chevron" />
                    ))}
                </button>

                {hasChildren && isExpanded && (
                  <div className="sidebar-sublinks">
                    {link.children.map((child) => {
                      const ChildIcon = child.icon;
                      return (
                        <button
                          key={child.label}
                          className={`sidebar-link sidebar-sublink ${
                            activeLink === child.label ? "active" : ""
                          }`}
                          onClick={() => handleLinkClick(child.label)}
                        >
                          <ChildIcon size={16} />
                          <span>{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
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
                  onClick={() => handleLinkClick(link.label)}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </button>
              );
            })}
        </div>
      </aside>
    </>
  );
}
