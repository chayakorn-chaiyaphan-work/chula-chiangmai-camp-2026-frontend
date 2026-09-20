import { api } from "./client";
import type {
  Activity,
  AdminGroup,
  AdminUser,
  Announcement,
  BuddyGeneration,
  BuddyGroup,
  Group,
  GroupDetail,
  LoginResult,
  Participant,
  Profile,
  RegistrationInput,
  ScoreEventView,
  ScoreboardEntry,
} from "./types";

export const endpoints = {
  login: (idToken: string) => api.post<LoginResult>("/auth/line", { idToken }),
  logout: () => api.post<void>("/auth/logout"),
  me: (signal?: AbortSignal) => api.get<Profile>("/me", signal),
  register: (input: RegistrationInput) => api.post<Participant>("/register", input),
  myGroup: (signal?: AbortSignal) => api.get<GroupDetail | null>("/groups/me", signal),
  scoreboard: (signal?: AbortSignal) => api.get<ScoreboardEntry[]>("/scoreboard", signal),
  myBuddy: (signal?: AbortSignal) => api.get<BuddyGroup | null>("/buddy/me", signal),
  activities: (signal?: AbortSignal) => api.get<Activity[]>("/activities", signal),
  announcements: (signal?: AbortSignal) => api.get<Announcement[]>("/announcements", signal),
  admin: {
    groups: (signal?: AbortSignal) => api.get<AdminGroup[]>("/admin/groups", signal),
    createGroup: (input: Pick<Group, "code" | "name" | "color" | "description">) =>
      api.post<Group>("/admin/groups", input),
    users: (signal?: AbortSignal) => api.get<AdminUser[]>("/admin/users", signal),
    assignGroup: (groupId: string, userIds: string[]) =>
      api.post("/admin/groups/assign", { groupId, userIds }),
    addScore: (input: {
      groupId: string;
      points: number;
      reason: string;
      activityId?: string;
      reversalOf?: string;
    }) => api.post<ScoreEventView>("/admin/scores", input),
    scoreEvents: (signal?: AbortSignal) => api.get<ScoreEventView[]>("/admin/scores", signal),
    generateBuddy: (scope: "participant" | "staff") =>
      api.post<{ generationId: string; scope: string; groups: string[][] }>("/admin/buddy/generate", { scope }),
    buddyGenerations: (signal?: AbortSignal) =>
      api.get<BuddyGeneration[]>("/admin/buddy/generations", signal),
    activities: (signal?: AbortSignal) => api.get<Activity[]>("/admin/activities", signal),
    createActivity: (input: Omit<Activity, "id" | "createdBy" | "createdAt" | "updatedAt">) =>
      api.post<Activity>("/admin/activities", input),
    updateActivity: (
      id: string,
      input: Omit<Activity, "id" | "createdBy" | "createdAt" | "updatedAt">,
    ) => api.patch<Activity>(`/admin/activities/${id}`, input),
    announcements: (signal?: AbortSignal) => api.get<Announcement[]>("/admin/announcements", signal),
    publishAnnouncement: (input: {
      title: string;
      message: string;
      audience: Announcement["audience"];
      targetGroupId?: string;
    }) => api.post<Announcement & { recipientCount: number }>("/admin/announcements", input),
  },
};
