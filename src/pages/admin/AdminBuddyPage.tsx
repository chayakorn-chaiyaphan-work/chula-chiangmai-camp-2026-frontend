import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { endpoints } from "../../api/endpoints";
import { Avatar, Button, InlineAlert, PageIntro, QueryError, SectionHeader, StatusBadge } from "../../components/ui";
import { displayMemberName, formatDateTime } from "../../lib/format";

export function AdminBuddyPage() {
  const [scope, setScope] = useState<"participant" | "staff">("participant");
  const queryClient = useQueryClient();
  const history = useQuery({ queryKey: ["admin", "buddy-generations"], queryFn: ({ signal }) => endpoints.admin.buddyGenerations(signal) });
  const mutation = useMutation({ mutationFn: () => endpoints.admin.generateBuddy(scope), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["admin", "buddy-generations"] }); } });
  const scopeName = scope === "participant" ? "participants" : "staff and admins";

  return (
    <div>
      <PageIntro eyebrow="Random pairing" title="Buddy / Budder" description="Participants pair only with participants. Staff and admins pair in a separate pool. An odd pool creates one trio." />
      {history.error && <QueryError error={history.error} />}
      <section className="buddy-generator panel">
        <div><h2>Generate a new pairing</h2><p>This replaces what users see as their latest pairing for the selected pool.</p></div>
        <div className="segmented-control"><button className={scope === "participant" ? "is-active" : ""} onClick={() => setScope("participant")}>Participants</button><button className={scope === "staff" ? "is-active" : ""} onClick={() => setScope("staff")}>Staff / Admin</button></div>
        {mutation.error && <InlineAlert tone="danger">{mutation.error.message}</InlineAlert>}
        {mutation.isSuccess && <InlineAlert tone="success">Created {mutation.data.groups.length} buddy groups for {scopeName}.</InlineAlert>}
        <Button icon={mutation.isSuccess ? <RefreshCw size={18} /> : <Sparkles size={18} />} loading={mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isSuccess ? "Generate again" : "Generate pairing"}</Button>
      </section>
      <SectionHeader title="Generation history" detail="Latest 20 runs" />
      <div className="generation-list">{history.data?.map((generation) => <article className="generation" key={generation.generationId}><header><div><strong>{generation.scope === "participant" ? "Participant pool" : "Staff / Admin pool"}</strong><span>{formatDateTime(generation.createdAt)} · by {generation.generatedByName}</span></div><StatusBadge tone={generation.scope === "participant" ? "pink" : "green"}>{generation.groups.length} groups</StatusBadge></header><div className="generation__groups">{generation.groups.map((group, index) => <div className="generation-group" key={group.buddyGroupId}><span>Group {index + 1}</span><div>{group.members.map((member) => <div className="generation-member" key={member.userId}><Avatar src={member.pictureUrl} name={member.displayName} size="small" /><small>{displayMemberName(member)}</small></div>)}</div></div>)}</div></article>)}</div>
      {!history.data?.length && <p className="table-empty">No buddy generation has been run yet.</p>}
    </div>
  );
}
