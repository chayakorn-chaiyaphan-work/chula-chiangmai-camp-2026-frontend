import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Save } from "lucide-react";
import { useState } from "react";
import { endpoints } from "../../api/endpoints";
import { Button, InlineAlert, PageIntro, QueryError, SectionHeader, StatusBadge } from "../../components/ui";
import { formatDateTime } from "../../lib/format";

export function AdminScoresPage() {
  const queryClient = useQueryClient();
  const groups = useQuery({ queryKey: ["admin", "groups"], queryFn: ({ signal }) => endpoints.admin.groups(signal) });
  const activities = useQuery({ queryKey: ["admin", "activities"], queryFn: ({ signal }) => endpoints.admin.activities(signal) });
  const events = useQuery({ queryKey: ["admin", "score-events"], queryFn: ({ signal }) => endpoints.admin.scoreEvents(signal) });
  const [form, setForm] = useState({ groupId: "", points: 10, reason: "", activityId: "" });
  const mutation = useMutation({
    mutationFn: () => endpoints.admin.addScore({ groupId: form.groupId, points: form.points, reason: form.reason, activityId: form.activityId || undefined }),
    onSuccess: async () => { setForm((current) => ({ ...current, reason: "" })); await Promise.all([queryClient.invalidateQueries({ queryKey: ["admin", "score-events"] }), queryClient.invalidateQueries({ queryKey: ["scoreboard"] })]); },
  });

  return (
    <div>
      <PageIntro eyebrow="Audited scoring" title="Scores" description="Every adjustment creates an append-only score event and audit record." />
      {(groups.error || activities.error || events.error) && <QueryError error={groups.error || activities.error || events.error} />}
      <section className="admin-score-layout">
        <form className="panel form-grid" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
          <h2>Add score event</h2>
          <div className="field"><label htmlFor="score-group">Group</label><select id="score-group" required value={form.groupId} onChange={(event) => setForm({ ...form, groupId: event.target.value })}><option value="">Select group</option>{groups.data?.map((group) => <option value={group.id} key={group.id}>{group.code} · {group.name}</option>)}</select></div>
          <div className="field"><span className="field__label">Points</span><div className="number-stepper"><button type="button" title="Subtract ten points" onClick={() => setForm({ ...form, points: form.points - 10 })}><Minus size={17} /></button><input aria-label="Points" type="number" min={-1000000} max={1000000} value={form.points} onChange={(event) => setForm({ ...form, points: Number(event.target.value) })} /><button type="button" title="Add ten points" onClick={() => setForm({ ...form, points: form.points + 10 })}><Plus size={17} /></button></div></div>
          <div className="field"><label htmlFor="score-activity">Activity (optional)</label><select id="score-activity" value={form.activityId} onChange={(event) => setForm({ ...form, activityId: event.target.value })}><option value="">General score</option>{activities.data?.map((activity) => <option value={activity.id} key={activity.id}>{activity.name}</option>)}</select></div>
          <div className="field"><label htmlFor="score-reason">Reason</label><textarea id="score-reason" required maxLength={500} value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="What was this score awarded for?" /></div>
          {mutation.error && <InlineAlert tone="danger">{mutation.error.message}</InlineAlert>}
          {mutation.isSuccess && <InlineAlert tone="success">Score event recorded.</InlineAlert>}
          <Button type="submit" icon={<Save size={18} />} loading={mutation.isPending} disabled={!form.groupId || !form.reason.trim() || form.points === 0}>Record score</Button>
        </form>
        <section>
          <SectionHeader title="Recent events" detail="Newest first" />
          <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Group</th><th>Change</th><th>Reason</th><th>Created</th></tr></thead><tbody>{events.data?.map((event) => <tr key={event.id}><td><strong>{event.groupCode}</strong><small>{event.groupName}</small></td><td><span className={event.points > 0 ? "score-change is-positive" : "score-change is-negative"}>{event.points > 0 ? "+" : ""}{event.points}</span></td><td><strong>{event.reason}</strong><small>{event.activityName || `By ${event.createdByName}`}</small></td><td>{formatDateTime(event.createdAt)}{event.reversalOf && <StatusBadge tone="amber">Reversal</StatusBadge>}</td></tr>)}</tbody></table>{!events.data?.length && <p className="table-empty">No score events yet.</p>}</div>
        </section>
      </section>
    </div>
  );
}
