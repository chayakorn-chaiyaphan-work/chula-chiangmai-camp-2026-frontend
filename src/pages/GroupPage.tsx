import { useQuery } from "@tanstack/react-query";
import { UsersRound } from "lucide-react";
import { endpoints } from "../api/endpoints";
import type { GroupMember } from "../api/types";
import { Avatar, EmptyState, LoadingState, PageIntro, QueryError, SectionHeader, StatusBadge } from "../components/ui";
import { displayMemberName, normalizeColor } from "../lib/format";

function MemberRow({ member }: { member: GroupMember }) {
  return (
    <li className="member-row">
      <Avatar src={member.pictureUrl} name={displayMemberName(member)} size="medium" />
      <div><strong>{displayMemberName(member)}</strong><span>{member.nickname && member.displayName !== member.nickname ? member.displayName : member.role}</span></div>
      <StatusBadge tone={member.memberType === "mentor" ? "green" : "neutral"}>{member.memberType}</StatusBadge>
    </li>
  );
}

export function GroupPage() {
  const query = useQuery({ queryKey: ["my-group"], queryFn: ({ signal }) => endpoints.myGroup(signal) });
  if (query.isLoading) return <LoadingState label="Loading your group" />;
  if (query.error) return <QueryError error={query.error} />;
  if (!query.data) return <><PageIntro eyebrow="Your team" title="My group" /><EmptyState icon={<UsersRound size={24} />} title="Group assignment is on the way" description="Once the camp team assigns your group, members and mentors will appear here." /></>;

  const { group, mentors, participants } = query.data;
  return (
    <div>
      <PageIntro eyebrow={group.code} title={group.name} description={group.description || "Meet the people sharing your camp journey."} />
      <div className="group-color-band" style={{ backgroundColor: normalizeColor(group.color) }}><span>{participants.length}</span> participants · <span>{mentors.length}</span> mentors</div>
      <SectionHeader title="Group mentors" detail="Your first point of contact" />
      <ul className="member-list">{mentors.length ? mentors.map((member) => <MemberRow key={member.userId} member={member} />) : <li className="member-list__empty">Mentors have not been assigned yet.</li>}</ul>
      <SectionHeader title="Participants" detail={`${participants.length} group members`} />
      <ul className="member-list">{participants.map((member) => <MemberRow key={member.userId} member={member} />)}</ul>
    </div>
  );
}
