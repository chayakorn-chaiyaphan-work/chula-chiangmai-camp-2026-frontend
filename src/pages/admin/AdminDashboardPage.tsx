import { useQuery } from "@tanstack/react-query";
import { Activity, BellRing, Medal, Sparkles, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { endpoints } from "../../api/endpoints";
import { PageIntro, QueryError, SectionHeader, StatusBadge } from "../../components/ui";
import { formatActivityDate, formatDateTime } from "../../lib/format";

export function AdminDashboardPage() {
  const groups = useQuery({ queryKey: ["admin", "groups"], queryFn: ({ signal }) => endpoints.admin.groups(signal) });
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: ({ signal }) => endpoints.admin.users(signal) });
  const activities = useQuery({ queryKey: ["admin", "activities"], queryFn: ({ signal }) => endpoints.admin.activities(signal) });
  const announcements = useQuery({ queryKey: ["admin", "announcements"], queryFn: ({ signal }) => endpoints.admin.announcements(signal) });
  const scores = useQuery({ queryKey: ["scoreboard"], queryFn: ({ signal }) => endpoints.scoreboard(signal) });
  const error = groups.error || users.error || activities.error || announcements.error || scores.error;
  const nextActivity = activities.data?.filter((item) => item.status === "published" && new Date(item.endsAt) >= new Date())[0];

  return (
    <div>
      <PageIntro eyebrow="Operations" title="Camp overview" description="A current snapshot of people, groups, programme, and communication." />
      {error && <QueryError error={error} />}
      <div className="metric-grid">
        <Link to="/admin/groups" className="metric"><span className="metric__icon metric__icon--pink"><UsersRound size={18} /></span><span className="metric__label">Groups</span><strong className="metric__value">{groups.data?.length ?? "—"}</strong></Link>
        <Link to="/admin/groups" className="metric"><span className="metric__icon metric__icon--green"><UsersRound size={18} /></span><span className="metric__label">Active users</span><strong className="metric__value">{users.data?.filter((user) => user.isActive).length ?? "—"}</strong></Link>
        <Link to="/admin/activities" className="metric"><span className="metric__icon metric__icon--blue"><Activity size={18} /></span><span className="metric__label">Published activities</span><strong className="metric__value">{activities.data?.filter((item) => item.status === "published").length ?? "—"}</strong></Link>
        <Link to="/admin/announcements" className="metric"><span className="metric__icon metric__icon--amber"><BellRing size={18} /></span><span className="metric__label">Announcements sent</span><strong className="metric__value">{announcements.data?.filter((item) => item.deliveryStatus === "sent").length ?? "—"}</strong></Link>
      </div>

      <div className="admin-dashboard-grid">
        <section>
          <SectionHeader title="Score leaders" action={<Link to="/admin/scores" className="text-link"><Medal size={15} /> Manage scores</Link>} />
          <div className="panel panel--flush">
            {(scores.data || []).slice(0, 5).map((entry) => <div className="compact-rank" key={entry.id}><span>#{entry.rank}</span><strong>{entry.name}</strong><b>{entry.totalScore.toLocaleString()} pts</b></div>)}
            {!scores.data?.length && <p className="table-empty">No score data yet.</p>}
          </div>
        </section>
        <section>
          <SectionHeader title="Next published activity" action={<Link to="/admin/activities" className="text-link"><Activity size={15} /> Programme</Link>} />
          <div className="panel admin-next-activity">
            {nextActivity ? <><StatusBadge tone="green">Published</StatusBadge><h2>{nextActivity.name}</h2><p>{formatActivityDate(nextActivity.startsAt, nextActivity.endsAt)}</p><small>{nextActivity.location || "Location not set"}</small></> : <p className="table-empty">No upcoming activity is published.</p>}
          </div>
        </section>
      </div>

      <SectionHeader title="Recent announcements" action={<Link to="/admin/announcements" className="text-link"><BellRing size={15} /> Compose</Link>} />
      <div className="data-table-wrap">
        <table className="data-table"><thead><tr><th>Announcement</th><th>Audience</th><th>Status</th><th>Created</th></tr></thead><tbody>
          {(announcements.data || []).slice(0, 5).map((item) => <tr key={item.id}><td><strong>{item.title}</strong><small>{item.message}</small></td><td>{item.audience}</td><td><StatusBadge tone={item.deliveryStatus === "sent" ? "green" : item.deliveryStatus === "failed" ? "red" : "amber"}>{item.deliveryStatus}</StatusBadge></td><td>{formatDateTime(item.createdAt)}</td></tr>)}
        </tbody></table>
        {!announcements.data?.length && <p className="table-empty"><Sparkles size={17} /> No announcements yet.</p>}
      </div>
    </div>
  );
}
