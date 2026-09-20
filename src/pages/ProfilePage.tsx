import { LogOut, Pencil, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useSession } from "../auth/SessionProvider";
import { Avatar, Button, PageIntro, SectionHeader, StatusBadge } from "../components/ui";

export function ProfilePage() {
  const { profile, logout } = useSession();
  if (!profile) return null;
  const participant = profile.participant;
  return (
    <div>
      <PageIntro eyebrow="Account" title="Profile" />
      <section className="profile-identity panel">
        <Avatar src={profile.user.pictureUrl} name={profile.user.displayName} size="large" />
        <div><h2>{participant ? `${participant.firstName} ${participant.lastName}` : profile.user.displayName}</h2><p>{participant?.nickname ? `Known as ${participant.nickname}` : "LINE account"}</p><StatusBadge tone={profile.user.role === "admin" ? "pink" : profile.user.role === "staff" ? "green" : "neutral"}>{profile.user.role}</StatusBadge></div>
      </section>

      {participant && <>
        <SectionHeader title="Participant details" action={<Link to="/register" className="text-link"><Pencil size={15} /> Edit</Link>} />
        <dl className="detail-list panel">
          <div><dt>Faculty</dt><dd>{participant.faculty}</dd></div><div><dt>Academic year</dt><dd>Year {participant.academicYear}</dd></div><div><dt>Phone</dt><dd>{participant.phone}</dd></div><div><dt>Emergency contact</dt><dd>{participant.emergencyContactName} · {participant.emergencyContactPhone}</dd></div><div><dt>Dietary requirements</dt><dd>{participant.dietaryRequirements || "None provided"}</dd></div><div><dt>Medical notes</dt><dd>{participant.medicalNotes || "None provided"}</dd></div>
        </dl>
      </>}

      {!!profile.staffRoles.length && <>
        <SectionHeader title="Camp responsibilities" />
        <div className="stack">{profile.staffRoles.map((role) => <div className="role-row panel" key={role.id}><ShieldCheck size={20} /><div><strong>{role.departmentName}</strong><span>{role.position || role.departmentCode}</span></div>{role.canJoinGroup && <StatusBadge tone="green">Group mentor</StatusBadge>}</div>)}</div>
      </>}

      {!participant && !profile.staffRoles.length && <div className="panel cluster"><UserRound size={20} /><span className="muted">No additional profile details.</span></div>}
      <div className="profile-actions"><Button variant="secondary" icon={<LogOut size={18} />} onClick={() => void logout()}>Sign out</Button></div>
    </div>
  );
}
