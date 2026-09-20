import { createServer } from "node:http";

const now = new Date();
const hoursFromNow = (hours) => new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
const group = { id: "group-pink", code: "PINK-01", name: "Dok Rak", color: "#d4145a", description: "Curious minds, kind hearts, and a shared Chiang Mai adventure.", createdBy: "admin-1", createdAt: now.toISOString(), updatedAt: now.toISOString(), participantCount: 18, mentorCount: 3 };
const activities = [
  { id: "activity-1", name: "Welcome Assembly", description: "Opening, camp briefing, and group introductions.", location: "Main Hall", startsAt: hoursFromNow(2), endsAt: hoursFromNow(3.5), status: "published", createdBy: "admin-1", createdAt: now.toISOString(), updatedAt: now.toISOString() },
  { id: "activity-2", name: "Lanna Culture Workshop", description: "Learn local crafts with community teachers.", location: "Craft Courtyard", startsAt: hoursFromNow(5), endsAt: hoursFromNow(7), status: "published", createdBy: "admin-1", createdAt: now.toISOString(), updatedAt: now.toISOString() },
  { id: "activity-3", name: "Community Challenge", description: "A collaborative challenge across every camp group.", location: "Sports Field", startsAt: hoursFromNow(26), endsAt: hoursFromNow(29), status: "draft", createdBy: "admin-1", createdAt: now.toISOString(), updatedAt: now.toISOString() },
];
const participants = ["Mali", "Niran", "Pim", "Arthit", "Mek"].map((name, index) => ({ userId: `user-${index}`, memberType: "participant", role: "participant", displayName: `${name} Camper`, pictureUrl: "", nickname: name }));
const mentors = ["Mint", "Korn"].map((name, index) => ({ userId: `mentor-${index}`, memberType: "mentor", role: index ? "staff" : "admin", displayName: `${name} Mentor`, pictureUrl: "", nickname: name }));
const announcements = [{ id: "announcement-1", title: "Meet at the Main Hall", message: "Please arrive 15 minutes before the welcome assembly and wear your group badge.", audience: "all", targetGroupId: null, deliveryStatus: "sent", deliveryError: "", createdBy: "admin-1", publishedAt: now.toISOString(), createdAt: now.toISOString(), updatedAt: now.toISOString() }];
const scoreboard = [
  { id: "group-green", code: "GREEN-02", name: "Doi Suthep", color: "#237a57", totalScore: 245, rank: 1 },
  { id: "group-pink", code: "PINK-01", name: "Dok Rak", color: "#d4145a", totalScore: 220, rank: 2 },
  { id: "group-gold", code: "GOLD-03", name: "Khom Lanna", color: "#b57b10", totalScore: 180, rank: 3 },
];
const profile = { user: { id: "admin-1", displayName: "Mint Camp Admin", pictureUrl: "", role: "admin" }, participant: null, staffRoles: [{ id: "role-1", userId: "admin-1", departmentId: "dept-1", departmentCode: "GROUP", departmentName: "Group Mentors", canJoinGroup: true, position: "Lead mentor", createdAt: now.toISOString(), updatedAt: now.toISOString() }], group: { id: group.id, code: group.code, name: group.name, memberType: "mentor" } };
const users = [...participants.map((member) => ({ id: member.userId, displayName: member.displayName, pictureUrl: "", role: "participant", isActive: true, nickname: member.nickname, fullName: member.displayName, isRegisteredParticipant: true, isEligibleMentor: false, groupId: group.id, groupCode: group.code, groupName: group.name, memberType: "participant" })), ...mentors.map((member) => ({ id: member.userId, displayName: member.displayName, pictureUrl: "", role: member.role, isActive: true, nickname: "", fullName: member.displayName, isRegisteredParticipant: false, isEligibleMentor: true, groupId: group.id, groupCode: group.code, groupName: group.name, memberType: "mentor" }))];
const scoreEvents = [{ id: "score-1", groupId: group.id, groupCode: group.code, groupName: group.name, points: 20, reason: "Excellent teamwork", activityId: "activity-1", activityName: "Welcome Assembly", createdBy: "admin-1", createdByName: "Mint Camp Admin", reversalOf: null, createdAt: now.toISOString() }];
const buddy = { generationId: "generation-1", scope: "staff", members: mentors };
const generations = [{ generationId: "generation-1", scope: "staff", createdAt: now.toISOString(), generatedByName: "Mint Camp Admin", groups: [{ buddyGroupId: "buddy-group-1", members: mentors }] }];

function dataFor(path) {
  const routes = {
    "/me": profile,
    "/activities": activities.filter((item) => item.status === "published"),
    "/announcements": announcements,
    "/scoreboard": scoreboard,
    "/groups/me": { group, participants, mentors },
    "/buddy/me": buddy,
    "/admin/groups": [group, { ...group, id: "group-green", code: "GREEN-02", name: "Doi Suthep", color: "#237a57", participantCount: 20, mentorCount: 2 }],
    "/admin/users": users,
    "/admin/activities": activities,
    "/admin/announcements": announcements,
    "/admin/scores": scoreEvents,
    "/admin/buddy/generations": generations,
  };
  return routes[path];
}

createServer((request, response) => {
  const path = new URL(request.url, "http://127.0.0.1").pathname;
  const data = dataFor(path);
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Cache-Control", "no-store");
  if (data === undefined) {
    response.writeHead(404).end(JSON.stringify({ error: { code: "NOT_FOUND", message: "Mock route not found" } }));
    return;
  }
  response.writeHead(200).end(JSON.stringify({ data }));
}).listen(8787, "127.0.0.1", () => console.log("Visual QA API listening on http://127.0.0.1:8787"));
