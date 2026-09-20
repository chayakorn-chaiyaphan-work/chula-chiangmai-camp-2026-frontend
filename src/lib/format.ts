import { format, isSameDay, isToday } from "date-fns";

export function formatActivityDate(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (isSameDay(start, end)) {
    const day = isToday(start) ? "Today" : format(start, "EEE, d MMM");
    return `${day} · ${format(start, "HH:mm")}–${format(end, "HH:mm")}`;
  }
  return `${format(start, "d MMM, HH:mm")} – ${format(end, "d MMM, HH:mm")}`;
}

export function formatDateTime(value: string): string {
  return format(new Date(value), "d MMM yyyy, HH:mm");
}

export function displayMemberName(member: { displayName: string; nickname?: string }): string {
  return member.nickname || member.displayName || "Camp member";
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CC";
}

export function normalizeColor(value: string): string {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : "#d4145a";
}
