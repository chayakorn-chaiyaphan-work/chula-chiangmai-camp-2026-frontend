import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useState } from "react";
import { endpoints } from "../../api/endpoints";
import type { Announcement } from "../../api/types";
import { Button, InlineAlert, PageIntro, QueryError, SectionHeader, StatusBadge } from "../../components/ui";
import { formatDateTime } from "../../lib/format";

export function AdminAnnouncementsPage() {
  const queryClient = useQueryClient();
  const groups = useQuery({ queryKey: ["admin", "groups"], queryFn: ({ signal }) => endpoints.admin.groups(signal) });
  const history = useQuery({ queryKey: ["admin", "announcements"], queryFn: ({ signal }) => endpoints.admin.announcements(signal) });
  const [form, setForm] = useState<{ title: string; message: string; audience: Announcement["audience"]; targetGroupId: string }>({ title: "", message: "", audience: "all", targetGroupId: "" });
  const mutation = useMutation({
    mutationFn: () => endpoints.admin.publishAnnouncement({ title: form.title, message: form.message, audience: form.audience, targetGroupId: form.audience === "group" ? form.targetGroupId : undefined }),
    onSuccess: async () => { setForm({ title: "", message: "", audience: "all", targetGroupId: "" }); await Promise.all([queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] }), queryClient.invalidateQueries({ queryKey: ["announcements"] })]); },
  });
  const totalCharacters = form.title.length + form.message.length + 2;

  return (
    <div>
      <PageIntro eyebrow="LINE broadcast" title="Announcements" description="Send a targeted LINE message and keep a delivery record in the camp database." />
      {(groups.error || history.error) && <QueryError error={groups.error || history.error} />}
      <form className="announcement-composer panel" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
        <div className="form-grid form-grid--two">
          <div className="field field--full"><label htmlFor="announcement-title">Title</label><input id="announcement-title" required maxLength={200} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div>
          <div className="field"><label htmlFor="announcement-audience">Audience</label><select id="announcement-audience" value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value as Announcement["audience"], targetGroupId: "" })}><option value="all">Everyone</option><option value="participants">Participants</option><option value="staff">Staff and admins</option><option value="group">One group</option></select></div>
          {form.audience === "group" && <div className="field"><label htmlFor="announcement-group">Target group</label><select id="announcement-group" required value={form.targetGroupId} onChange={(event) => setForm({ ...form, targetGroupId: event.target.value })}><option value="">Select group</option>{groups.data?.map((group) => <option value={group.id} key={group.id}>{group.code} · {group.name}</option>)}</select></div>}
          <div className="field field--full"><div className="split"><label htmlFor="announcement-message">Message</label><span className={totalCharacters > 5000 ? "character-count is-over" : "character-count"}>{totalCharacters}/5000</span></div><textarea id="announcement-message" required rows={7} maxLength={4700} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Write the message exactly as recipients should receive it." /></div>
        </div>
        {mutation.error && <InlineAlert tone="danger">{mutation.error.message}</InlineAlert>}
        {mutation.isSuccess && <InlineAlert tone="success">Sent to {mutation.data.recipientCount} recipients.</InlineAlert>}
        <div className="form-actions"><Button type="submit" icon={<Send size={18} />} loading={mutation.isPending} disabled={!form.title.trim() || !form.message.trim() || totalCharacters > 5000 || (form.audience === "group" && !form.targetGroupId)}>Publish via LINE</Button></div>
      </form>
      <SectionHeader title="Delivery history" detail="Newest first" />
      <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Announcement</th><th>Audience</th><th>Delivery</th><th>Published</th></tr></thead><tbody>{history.data?.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><small>{item.message}</small></td><td>{item.audience}</td><td><StatusBadge tone={item.deliveryStatus === "sent" ? "green" : item.deliveryStatus === "failed" ? "red" : "amber"}>{item.deliveryStatus}</StatusBadge>{item.deliveryError && <small>{item.deliveryError}</small>}</td><td>{formatDateTime(item.publishedAt || item.createdAt)}</td></tr>)}</tbody></table>{!history.data?.length && <p className="table-empty">No announcement history yet.</p>}</div>
    </div>
  );
}
