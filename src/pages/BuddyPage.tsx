import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { endpoints } from "../api/endpoints";
import { Avatar, EmptyState, LoadingState, PageIntro, QueryError, StatusBadge } from "../components/ui";
import { displayMemberName } from "../lib/format";

export function BuddyPage() {
  const query = useQuery({ queryKey: ["my-buddy"], queryFn: ({ signal }) => endpoints.myBuddy(signal) });
  if (query.isLoading) return <LoadingState label="Finding your buddy group" />;
  if (query.error) return <QueryError error={query.error} />;
  return (
    <div>
      <PageIntro eyebrow="Latest pairing" title="Buddy / Budder" description="A small circle to check in with and make camp feel a little closer." />
      {!query.data ? <EmptyState icon={<Sparkles size={24} />} title="Pairing has not been generated" description="Your latest buddy group will appear here after the camp team runs the draw." /> : (
        <div className="buddy-stage">
          <div className="buddy-stage__header"><Sparkles size={20} /><span>Current {query.data.scope} pairing</span><StatusBadge tone="pink">{query.data.members.length === 3 ? "Trio" : "Pair"}</StatusBadge></div>
          <div className="buddy-members">
            {query.data.members.map((member) => (
              <article className="buddy-member" key={member.userId}>
                <Avatar src={member.pictureUrl} name={displayMemberName(member)} size="large" />
                <h2>{displayMemberName(member)}</h2>
                <p>{member.nickname ? member.displayName : member.role}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
