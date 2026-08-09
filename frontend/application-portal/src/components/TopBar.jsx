import { Search, Bell } from "lucide-react";

export default function TopBar({ userName = "Recruiter", avatarUrl }) {
  return (
    <div className="topbar">
      <div className="search-box">
        <Search size={16} />
        <input type="text" placeholder="Search" />
      </div>

      <div className="topbar-right">
        <Bell size={20} className="topbar-icon" />
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" className="topbar-avatar" />
        ) : (
          <div className="topbar-avatar-placeholder">{userName.charAt(0)}</div>
        )}
        <span className="topbar-username">{userName}</span>
      </div>
    </div>
  );
}
