
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Attachment {
  name: string;
  size: string;
}

export interface ApiTask {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: number; // 0 for undefined, 1 for Low, 2 for Medium, 3 for High
  project?: string;
  tags?: string[];
  subtasks?: Subtask[];
  attachments?: Attachment[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority?: "High" | "Medium" | "Low";
  project?: string;
  tags?: string[];
  subtasks?: Subtask[];
  attachments?: Attachment[];
}

export type FilterType = "all" | "completed" | "pending" | "dueSoon" | "highPriority" | "High" | "Medium" | "Low";
