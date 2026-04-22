import type { FixedEvent, GenerateScheduleOutput, PlanningPreferences, Task } from "@/types/planning";
import type { UserProfile } from "@/types/profile";
import { sanitizePreferences, defaultPreferences } from "@/features/constraints/defaults";
import { randomUUID } from "crypto";

type UserStore = {
  tasks: Map<string, Task>;
  fixedEvents: Map<string, FixedEvent>;
  preferences: PlanningPreferences;
  lastSchedule: GenerateScheduleOutput | null;
  profile: UserProfile;
};

const stores = new Map<string, UserStore>();

export function getUserIdFromRequest(req: Request): string {
  return req.headers.get("x-user-id")?.trim() || "demo";
}

export function getOrCreateStore(userId: string): UserStore {
  const existing = stores.get(userId);
  if (existing) return existing;

  const prefs = sanitizePreferences(defaultPreferences());
  const fresh: UserStore = {
    tasks: new Map(),
    fixedEvents: new Map(),
    preferences: prefs,
    lastSchedule: null,
    profile: {
      fullName: "Demo User",
      email: "demo@pulseplan.local",
      mode: "dev"
    }
  };
  stores.set(userId, fresh);
  return fresh;
}

export function listTasks(userId: string): Task[] {
  return [...getOrCreateStore(userId).tasks.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getTask(userId: string, id: string): Task | null {
  return getOrCreateStore(userId).tasks.get(id) ?? null;
}

export function upsertTask(userId: string, task: Task): void {
  getOrCreateStore(userId).tasks.set(task.id, task);
}

export function deleteTask(userId: string, id: string): boolean {
  return getOrCreateStore(userId).tasks.delete(id);
}

export function listFixedEvents(userId: string): FixedEvent[] {
  return [...getOrCreateStore(userId).fixedEvents.values()].sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export function getFixedEvent(userId: string, id: string): FixedEvent | null {
  return getOrCreateStore(userId).fixedEvents.get(id) ?? null;
}

export function upsertFixedEvent(userId: string, ev: FixedEvent): void {
  getOrCreateStore(userId).fixedEvents.set(ev.id, ev);
}

export function deleteFixedEvent(userId: string, id: string): boolean {
  return getOrCreateStore(userId).fixedEvents.delete(id);
}

export function getPreferences(userId: string): PlanningPreferences {
  return getOrCreateStore(userId).preferences;
}

export function updatePreferences(userId: string, partial: Partial<PlanningPreferences>): PlanningPreferences {
  const store = getOrCreateStore(userId);
  store.preferences = sanitizePreferences({ ...store.preferences, ...partial });
  return store.preferences;
}

export function getLastSchedule(userId: string): GenerateScheduleOutput | null {
  return getOrCreateStore(userId).lastSchedule;
}

export function setLastSchedule(userId: string, schedule: GenerateScheduleOutput | null): void {
  getOrCreateStore(userId).lastSchedule = schedule;
}

export function getProfile(userId: string): UserProfile {
  return getOrCreateStore(userId).profile;
}

export function updateProfile(userId: string, partial: Partial<UserProfile>): UserProfile {
  const store = getOrCreateStore(userId);
  store.profile = {
    ...store.profile,
    fullName: partial.fullName?.trim() || store.profile.fullName,
    email: partial.email?.trim() || store.profile.email,
    mode: partial.mode ?? store.profile.mode
  };
  return store.profile;
}

export function newId(): string {
  return randomUUID();
}
