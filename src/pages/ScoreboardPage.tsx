import { useQuery } from "@tanstack/react-query";
import { Medal } from "lucide-react";
import { endpoints } from "../api/endpoints";
import { useSession } from "../auth/SessionProvider";
import { EmptyState, LoadingState, PageIntro, QueryError } from "../components/ui";
import { normalizeColor } from "../lib/format";

export function ScoreboardPage() {
  const { profile } = useSession();
  const query = useQuery({ queryKey: ["scoreboard"], queryFn: ({ signal }) => endpoints.scoreboard(signal) });
  if (query.isLoading) return <LoadingState label="Loading the scoreboard" />;
  if (query.error) return <QueryError error={query.error} />;
  return (
    <div>
      <PageIntro eyebrow="Live standings" title="Scoreboard" description="Every score change is recorded by the camp team." />
      {!query.data?.length ? <EmptyState icon={<Medal size={24} />} title="No groups to rank yet" description="Standings will appear after groups are created." /> : (
        <ol className="scoreboard-list">
          {query.data.map((entry) => (
            <li key={entry.id} className={entry.id === profile?.group?.id ? "scoreboard-row is-mine" : "scoreboard-row"}>
              <span className="scoreboard-row__rank">{entry.rank}</span>
              <span className="scoreboard-row__color" style={{ backgroundColor: normalizeColor(entry.color) }} />
              <span className="scoreboard-row__name"><strong>{entry.name}</strong><small>{entry.code}{entry.id === profile?.group?.id ? " · Your group" : ""}</small></span>
              <span className="scoreboard-row__points">{entry.totalScore.toLocaleString()}<small>pts</small></span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
