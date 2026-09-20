import { CalendarDays, Home, Medal, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useSession } from "../auth/SessionProvider";
import { Avatar, BrandMark } from "../components/ui";

const navigation = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/group", label: "Group", icon: UsersRound },
  { to: "/scoreboard", label: "Scores", icon: Medal },
  { to: "/buddy", label: "Buddy", icon: Sparkles },
  { to: "/activities", label: "Schedule", icon: CalendarDays },
];

export function AppShell() {
  const { profile } = useSession();
  if (!profile) return null;

  return (
    <div className="participant-shell">
      <header className="app-header">
        <NavLink to="/home" className="app-header__brand" aria-label="Camp home">
          <BrandMark compact />
          <span><strong>Chula Chiang Mai</strong><small>Camp 2026</small></span>
        </NavLink>
        <div className="app-header__actions">
          {profile.user.role === "admin" && (
            <NavLink to="/admin" className="admin-entry"><ShieldCheck size={17} /> Admin</NavLink>
          )}
          <NavLink to="/profile" aria-label="Open profile">
            <Avatar src={profile.user.pictureUrl} name={profile.user.displayName} size="small" />
          </NavLink>
        </div>
      </header>

      <aside className="desktop-nav" aria-label="Main navigation">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => isActive ? "desktop-nav__item is-active" : "desktop-nav__item"}>
            <Icon size={19} /> <span>{label}</span>
          </NavLink>
        ))}
      </aside>

      <main className="app-content"><Outlet /></main>

      <nav className="bottom-nav" aria-label="Main navigation">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => isActive ? "bottom-nav__item is-active" : "bottom-nav__item"}>
            <Icon size={21} /> <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
