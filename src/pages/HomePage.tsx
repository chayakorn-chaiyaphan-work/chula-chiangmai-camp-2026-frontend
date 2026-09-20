import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BellRing, CalendarDays, Medal, Sparkles, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { endpoints } from "../api/endpoints";
import { useSession } from "../auth/SessionProvider";
import { PageIntro, QueryError, SectionHeader, StatusBadge } from "../components/ui";
import { formatActivityDate } from "../lib/format";

const quickLinks = [
  { to: "/group", label: "My group", detail: "Members and mentors", icon: UsersRound, tone: "pink" },
  { to: "/scoreboard", label: "Scoreboard", detail: "Live camp standings", icon: Medal, tone: "green" },
  { to: "/buddy", label: "Buddy / Budder", detail: "See your latest pairing", icon: Sparkles, tone: "amber" },
  { to: "/activities", label: "Activities", detail: "Your camp schedule", icon: CalendarDays, tone: "blue" },
];

export function HomePage() {
  const { profile } = useSession();
  const activities = useQuery({ queryKey: ["activities"], queryFn: ({ signal }) => endpoints.activities(signal) });
  const scoreboard = useQuery({ queryKey: ["scoreboard"], queryFn: ({ signal }) => endpoints.scoreboard(signal) });
  const announcements = useQuery({ queryKey: ["announcements"], queryFn: ({ signal }) => endpoints.announcements(signal) });
  if (!profile) return null;

  const firstName = profile.participant?.nickname || profile.user.displayName.split(" ")[0] || "Camper";
  const upcoming = activities.data?.find((activity) => new Date(activity.endsAt) >= new Date());
  const groupScore = scoreboard.data?.find((entry) => entry.id === profile.group?.id);
  const latestAnnouncement = announcements.data?.[0];

  return (
    <div>
      <PageIntro eyebrow="Camp home" title={`Hello, ${firstName}`} description="Everything you need for camp, in one place." />

      <section className="home-banner" aria-label="Camp status">
        <div className="home-banner__copy">
          <StatusBadge tone={profile.group ? "green" : "amber"}>{profile.group ? "Group assigned" : "Awaiting group"}</StatusBadge>
          <h2>{profile.group ? `${profile.group.code} · ${profile.group.name}` : "Your camp journey starts here"}</h2>
          <p>{profile.group ? `You are joining as a ${profile.group.memberType}.` : "Your group will appear after the camp team completes assignments."}</p>
        </div>
        <div className="home-banner__score" aria-label="Current group score">
          <span>{groupScore ? `#${groupScore.rank}` : "—"}</span>
          <small>{groupScore ? `${groupScore.totalScore.toLocaleString()} pts` : "No score yet"}</small>
        </div>
      </section>

      <SectionHeader title="Explore" detail="Quick access" />
      <div className="quick-grid">
        {quickLinks.map(({ to, label, detail, icon: Icon, tone }) => (
          <Link className="quick-link" to={to} key={to}>
            <span className={`quick-link__icon quick-link__icon--${tone}`}><Icon size={20} /></span>
            <span><strong>{label}</strong><small>{detail}</small></span>
            <ArrowRight size={17} className="quick-link__arrow" />
          </Link>
        ))}
      </div>

      {(activities.error || announcements.error || scoreboard.error) && (
        <div className="home-query-error"><QueryError error={activities.error || announcements.error || scoreboard.error} /></div>
      )}

      <div className="home-columns">
        <section>
          <SectionHeader title="Up next" action={<Link className="text-link" to="/activities">Full schedule <ArrowRight size={15} /></Link>} />
          {upcoming ? (
            <article className="timeline-card">
              <span className="timeline-card__rail" />
              <div>
                <p className="timeline-card__time">{formatActivityDate(upcoming.startsAt, upcoming.endsAt)}</p>
                <h3>{upcoming.name}</h3>
                <p>{upcoming.location || "Location to be announced"}</p>
              </div>
            </article>
          ) : (
            <div className="compact-empty"><CalendarDays size={20} /><span>No upcoming activity has been published.</span></div>
          )}
        </section>

        <section>
          <SectionHeader title="Latest announcement" />
          {latestAnnouncement ? (
            <article className="announcement-preview">
              <BellRing size={20} />
              <div><h3>{latestAnnouncement.title}</h3><p>{latestAnnouncement.message}</p></div>
            </article>
          ) : (
            <div className="compact-empty"><BellRing size={20} /><span>No announcements yet.</span></div>
          )}
        </section>
      </div>
    </div>
  );
}
