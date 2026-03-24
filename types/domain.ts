import type { ActivityType } from "@/lib/constants";

export type Role = "teacher" | "student" | "family" | "admin";
export type ProgressStatus = "pending" | "in_progress" | "completed" | "blocked";

export type Subject = {
  id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  color: string;
  icon: string | null;
  is_active: boolean;
  created_at: string;
};

export type Module = {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  position: number;
  is_locked_by_default: boolean;
  created_at: string;
};

export type Activity = {
  id: string;
  module_id: string;
  type: ActivityType;
  title: string;
  prompt: string;
  instructions: string | null;
  audio_url: string | null;
  image_url: string | null;
  settings_json: Record<string, unknown> | null;
  position: number;
  created_at: string;
};

export type StudentSubjectProgress = {
  id: string;
  student_id: string;
  subject_id: string;
  progress_percent: number;
  completed_modules: number;
  total_modules: number;
  status: ProgressStatus;
};

export type StudentModuleProgress = {
  id: string;
  student_id: string;
  module_id: string;
  status: ProgressStatus;
  unlocked_at: string | null;
  completed_at: string | null;
  progress_percent: number;
};

export type StudentActivityProgress = {
  id: string;
  student_id: string;
  activity_id: string;
  status: ProgressStatus;
  score: number | null;
  completed_at: string | null;
  time_spent_seconds: number;
  attempts: number;
  response_json: Record<string, unknown> | null;
};

export type StudentSummary = {
  student_id: string;
  student_name: string;
  progress_percent: number;
  blocked_modules: number;
  completed_modules: number;
  total_time_seconds: number;
};
