import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Plus, Search, UserRoundPlus, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { endpoints } from "../../api/endpoints";
import { Avatar, Button, InlineAlert, PageIntro, QueryError, SectionHeader, StatusBadge } from "../../components/ui";
import { normalizeColor } from "../../lib/format";

type Mode = "groups" | "assign";

export function AdminGroupsPage() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>("groups");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const groups = useQuery({ queryKey: ["admin", "groups"], queryFn: ({ signal }) => endpoints.admin.groups(signal) });
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: ({ signal }) => endpoints.admin.users(signal) });
  const [groupForm, setGroupForm] = useState({ code: "", name: "", color: "#d4145a", description: "" });

  const createGroup = useMutation({
    mutationFn: endpoints.admin.createGroup,
    onSuccess: async () => { setGroupForm({ code: "", name: "", color: "#d4145a", description: "" }); await queryClient.invalidateQueries({ queryKey: ["admin", "groups"] }); },
  });
  const assign = useMutation({
    mutationFn: () => endpoints.admin.assignGroup(selectedGroup, selectedUsers),
    onSuccess: async () => { setSelectedUsers([]); await Promise.all([queryClient.invalidateQueries({ queryKey: ["admin", "users"] }), queryClient.invalidateQueries({ queryKey: ["admin", "groups"] })]); },
  });

  const eligibleUsers = useMemo(() => (users.data || []).filter((user) => {
    const eligible = user.isActive && (user.isRegisteredParticipant || user.isEligibleMentor);
    const term = search.trim().toLowerCase();
    return eligible && (!term || `${user.fullName} ${user.nickname} ${user.role} ${user.groupName}`.toLowerCase().includes(term));
  }), [users.data, search]);
  const toggleUser = (id: string) => setSelectedUsers((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);

  return (
    <div>
      <PageIntro eyebrow="People and teams" title="Groups" description="Create camp groups, then add or move eligible participants and mentors." />
      <div className="segmented-control" aria-label="Group management view"><button className={mode === "groups" ? "is-active" : ""} onClick={() => setMode("groups")}><UsersRound size={17} /> Groups</button><button className={mode === "assign" ? "is-active" : ""} onClick={() => setMode("assign")}><UserRoundPlus size={17} /> Assign members</button></div>
      {(groups.error || users.error) && <QueryError error={groups.error || users.error} />}

      {mode === "groups" ? <>
        <section className="admin-form-section">
          <SectionHeader title="Create group" detail="Codes are converted to uppercase" />
          <form className="panel form-grid form-grid--group" onSubmit={(event) => { event.preventDefault(); createGroup.mutate(groupForm); }}>
            <div className="field"><label htmlFor="group-code">Code</label><input id="group-code" value={groupForm.code} maxLength={50} required onChange={(event) => setGroupForm({ ...groupForm, code: event.target.value.toUpperCase() })} placeholder="PINK-01" /></div>
            <div className="field"><label htmlFor="group-name">Name</label><input id="group-name" value={groupForm.name} maxLength={255} required onChange={(event) => setGroupForm({ ...groupForm, name: event.target.value })} placeholder="Dok Rak" /></div>
            <div className="field field--color"><label htmlFor="group-color">Colour</label><div><input id="group-color" type="color" value={groupForm.color} onChange={(event) => setGroupForm({ ...groupForm, color: event.target.value })} /><span>{groupForm.color}</span></div></div>
            <div className="field field--full"><label htmlFor="group-description">Description</label><textarea id="group-description" value={groupForm.description} maxLength={2000} onChange={(event) => setGroupForm({ ...groupForm, description: event.target.value })} /></div>
            {createGroup.error && <InlineAlert className="field--full" tone="danger">{createGroup.error.message}</InlineAlert>}
            <div className="form-actions field--full"><Button type="submit" icon={<Plus size={18} />} loading={createGroup.isPending}>Create group</Button></div>
          </form>
        </section>
        <SectionHeader title="All groups" detail={`${groups.data?.length || 0} groups`} />
        <div className="admin-group-grid">{groups.data?.map((group) => <article className="admin-group-row" key={group.id}><span className="admin-group-row__swatch" style={{ backgroundColor: normalizeColor(group.color) }} /><div><strong>{group.name}</strong><span>{group.code}</span></div><dl><div><dt>Participants</dt><dd>{group.participantCount}</dd></div><div><dt>Mentors</dt><dd>{group.mentorCount}</dd></div></dl></article>)}</div>
        {!groups.data?.length && <p className="table-empty">No groups created yet.</p>}
      </> : <>
        <section className="assignment-toolbar">
          <div className="field"><label htmlFor="assign-group">Destination group</label><select id="assign-group" value={selectedGroup} onChange={(event) => setSelectedGroup(event.target.value)}><option value="">Select group</option>{groups.data?.map((group) => <option value={group.id} key={group.id}>{group.code} · {group.name}</option>)}</select></div>
          <div className="field"><label htmlFor="user-search">Find eligible people</label><div className="input-with-icon"><Search size={17} /><input id="user-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, role, or group" /></div></div>
        </section>
        <InlineAlert tone="info">Assignment moves a selected person from their current group when necessary. It does not remove unselected members.</InlineAlert>
        <div className="selection-list">
          {eligibleUsers.map((user) => { const checked = selectedUsers.includes(user.id); return <label className={checked ? "selection-row is-selected" : "selection-row"} key={user.id}><input type="checkbox" checked={checked} onChange={() => toggleUser(user.id)} /><Avatar src={user.pictureUrl} name={user.fullName} size="small" /><span><strong>{user.nickname || user.fullName}</strong><small>{user.role}{user.groupName ? ` · ${user.groupName}` : " · Unassigned"}</small></span><StatusBadge tone={user.role === "participant" ? "neutral" : "green"}>{user.role === "participant" ? "Participant" : "Mentor"}</StatusBadge>{checked && <Check size={18} className="selection-row__check" />}</label>; })}
        </div>
        {assign.error && <InlineAlert tone="danger">{assign.error.message}</InlineAlert>}
        {assign.isSuccess && <InlineAlert tone="success">Members assigned successfully.</InlineAlert>}
        <div className="sticky-actions"><span>{selectedUsers.length} selected</span><Button icon={<UserRoundPlus size={18} />} disabled={!selectedGroup || selectedUsers.length === 0} loading={assign.isPending} onClick={() => assign.mutate()}>Add or move members</Button></div>
      </>}
    </div>
  );
}
