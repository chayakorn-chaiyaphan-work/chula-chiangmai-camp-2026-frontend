export type UserRole = "participant" | "staff" | "admin";

export interface User {
  id: string;
  displayName: string;
  pictureUrl: string;
  role: UserRole;
}

export interface Participant {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  nickname: string;
  phone: string;
  faculty: string;
  academicYear: number;
  dietaryRequirements: string;
  medicalNotes: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  registrationStatus: "registered" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface StaffRole {
  id: string;
  userId: string;
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  canJoinGroup: boolean;
  position: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupSummary {
  id: string;
  code: string;
  name: string;
  memberType: "participant" | "mentor";
}

export interface Profile {
  user: User;
  participant: Participant | null;
  staffRoles: StaffRole[];
  group: GroupSummary | null;
}

export interface Group {
  id: string;
  code: string;
  name: string;
  color: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  userId: string;
  memberType: "participant" | "mentor";
  role: UserRole;
  displayName: string;
  pictureUrl: string;
  nickname: string;
}

export interface GroupDetail {
  group: Group;
  participants: GroupMember[];
  mentors: GroupMember[];
}

export interface ScoreboardEntry {
  id: string;
  code: string;
  name: string;
  color: string;
  totalScore: number;
  rank: number;
}

export interface BuddyMember {
  userId: string;
  role: UserRole;
  displayName: string;
  pictureUrl: string;
  nickname: string;
}

export interface BuddyGroup {
  generationId: string;
  scope: "participant" | "staff";
  members: BuddyMember[];
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  status: "draft" | "published" | "cancelled";
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  audience: "all" | "participants" | "staff" | "group";
  targetGroupId: string | null;
  deliveryStatus: "pending" | "sent" | "failed";
  deliveryError: string;
  createdBy: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationInput {
  firstName: string;
  lastName: string;
  nickname: string;
  phone: string;
  faculty: string;
  academicYear: number;
  dietaryRequirements: string;
  medicalNotes: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface AdminGroup extends Group {
  participantCount: number;
  mentorCount: number;
}

export interface AdminUser {
  id: string;
  displayName: string;
  pictureUrl: string;
  role: UserRole;
  isActive: boolean;
  nickname: string;
  fullName: string;
  isRegisteredParticipant: boolean;
  isEligibleMentor: boolean;
  groupId: string | null;
  groupCode: string;
  groupName: string;
  memberType: "participant" | "mentor" | "";
}

export interface ScoreEventView {
  id: string;
  groupId: string;
  groupCode: string;
  groupName: string;
  points: number;
  reason: string;
  activityId: string | null;
  activityName: string;
  createdBy: string;
  createdByName: string;
  reversalOf: string | null;
  createdAt: string;
}

export interface BuddyGeneration {
  generationId: string;
  scope: "participant" | "staff";
  createdAt: string;
  generatedByName: string;
  groups: Array<{
    buddyGroupId: string;
    members: BuddyMember[];
  }>;
}

export interface LoginResult {
  expiresAt: string;
  user: User;
}
