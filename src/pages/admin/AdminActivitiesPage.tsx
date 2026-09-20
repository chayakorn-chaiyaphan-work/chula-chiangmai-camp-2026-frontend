import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Pencil, X } from "lucide-react";
import { useState } from "react";
import { endpoints } from "../../api/endpoints";
import type { Activity } from "../../api/types";
import { Button, IconButton, InlineAlert, PageIntro, QueryError, SectionHeader, StatusBadge } from "../../components/ui";
import { formatActivityDate } from "../../lib/format";

type ActivityForm = Pick<Activity, "name" | "description" | "location" | "status"> & { startsAt: string; endsAt: string };
const emptyForm: ActivityForm = { name: "", description: "", location: "", startsAt: "", endsAt: "", status: "draft" };
const toLocalInput = (value: string) => { const date = new Date(value); const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 16); };

export function AdminActivitiesPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["admin", "activities"], queryFn: ({ signal }) => endpoints.admin.activities(signal) });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ActivityForm>(emptyForm);
  const mutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt).toISOString() };
      return editingId ? endpoints.admin.updateActivity(editingId, payload) : endpoints.admin.createActivity(payload);
    },
    onSuccess: async () => { setEditingId(null); setForm(emptyForm); await Promise.all([queryClient.invalidateQueries({ queryKey: ["admin", "activities"] }), queryClient.invalidateQueries({ queryKey: ["activities"] })]); },
  });
  const edit = (activity: Activity) => { setEditingId(activity.id); setForm({ name: activity.name, description: activity.description, location: activity.location, startsAt: toLocalInput(activity.startsAt), endsAt: toLocalInput(activity.endsAt), status: activity.status }); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div>
      <PageIntro eyebrow="Programme" title="Activities" description="Draft the schedule, publish it to participants, or mark a changed activity as cancelled." />
      {query.error && <QueryError error={query.error} />}
      <form className="panel activity-editor" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
        <div className="split"><div><h2>{editingId ? "Edit activity" : "New activity"}</h2><p className="muted small">Times are entered in your local timezone.</p></div>{editingId && <IconButton type="button" label="Cancel editing" onClick={() => { setEditingId(null); setForm(emptyForm); }}><X size={18} /></IconButton>}</div>
        <div className="form-grid form-grid--two">
          <div className="field field--full"><label htmlFor="activity-name">Name</label><input id="activity-name" required maxLength={255} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
          <div className="field"><label htmlFor="activity-start">Starts</label><input id="activity-start" required type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} /></div>
          <div className="field"><label htmlFor="activity-end">Ends</label><input id="activity-end" required type="datetime-local" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} /></div>
          <div className="field"><label htmlFor="activity-location">Location</label><input id="activity-location" maxLength={255} value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></div>
          <div className="field"><label htmlFor="activity-status">Status</label><select id="activity-status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Activity["status"] })}><option value="draft">Draft</option><option value="published">Published</option><option value="cancelled">Cancelled</option></select></div>
          <div className="field field--full"><label htmlFor="activity-description">Description</label><textarea id="activity-description" maxLength={2000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div>
        </div>
        {mutation.error && <InlineAlert tone="danger">{mutation.error.message}</InlineAlert>}
        <div className="form-actions"><Button type="submit" icon={editingId ? <Pencil size={18} /> : <CalendarPlus size={18} />} loading={mutation.isPending} disabled={!form.name || !form.startsAt || !form.endsAt}>{editingId ? "Save activity" : "Create activity"}</Button></div>
      </form>
      <SectionHeader title="All activities" detail={`${query.data?.length || 0} scheduled`} />
      <div className="activity-admin-list">{query.data?.map((activity) => <article className="activity-admin-row" key={activity.id}><div><StatusBadge tone={activity.status === "published" ? "green" : activity.status === "cancelled" ? "red" : "amber"}>{activity.status}</StatusBadge><h2>{activity.name}</h2><p>{formatActivityDate(activity.startsAt, activity.endsAt)}{activity.location ? ` · ${activity.location}` : ""}</p></div><IconButton label={`Edit ${activity.name}`} onClick={() => edit(activity)}><Pencil size={17} /></IconButton></article>)}</div>
    </div>
  );
}
