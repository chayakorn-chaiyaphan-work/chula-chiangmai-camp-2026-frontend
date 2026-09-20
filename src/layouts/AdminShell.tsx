import { Activity, ArrowLeft, BellRing, LayoutDashboard, Medal, Sparkles, UsersRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useSession } from "../auth/SessionProvider";
import { Avatar, BrandMark } from "../components/ui";

const adminNavigation = [
  { to: "/admin", end: true, label: "Overview", icon: LayoutDashboard },
  { to: "/admin/groups", label: "Groups", icon: UsersRound },
  { to: "/admin/scores", label: "Scores", icon: Medal },
  { to: "/admin/buddy", label: "Buddy pairing", icon: Sparkles },
  { to: "/admin/activities", label: "Activities", icon: Activity },
  { to: "/admin/announcements", label: "Announcements", icon: BellRing },
];

export function AdminShell() {
  const { profile } = useSession();
  if (!profile) return null;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink to="/home" className="admin-sidebar__brand">
          <BrandMark compact />
          <span><strong>Camp Control</strong><small>Admin workspace</small></span>
        </NavLink>
        <nav aria-label="Admin navigation">
          {adminNavigation.map(({ to, end, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? "admin-nav__item is-active" : "admin-nav__item"}>
              <Icon size={19} /> <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <NavLink to="/home" className="admin-sidebar__back"><ArrowLeft size={18} /><span>Participant app</span></NavLink>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div><p>Camp operations</p><strong>Admin</strong></div>
          <NavLink to="/profile" aria-label="Open profile"><Avatar src={profile.user.pictureUrl} name={profile.user.displayName} size="small" /></NavLink>
        </header>
        <main className="admin-content"><Outlet /></main>
      </div>
    </div>
  );
}
