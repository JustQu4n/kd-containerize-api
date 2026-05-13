/**
 * Todo Entity
 * Represents the domain model for a Todo
 */
export enum TodoStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface TodoEntity {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  userId: string;
  dueAt?: number; // Unix timestamp in seconds
  createdAt: number; // Unix timestamp in seconds
  updatedAt: number; // Unix timestamp in seconds
}

/**
 * Todo validation rules
 */
export const TodoValidation = {
  title: {
    minLength: 1,
    maxLength: 200,
  },
  description: {
    maxLength: 1000,
  },
} as const;
