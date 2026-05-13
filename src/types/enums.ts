export enum TodoStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export const VALID_STATUSES = Object.values(TodoStatus);

export enum ErrorCode {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    CONFLICT = 'CONFLICT',
}

export enum MessageLog{
    TODO_CREATED = 'todo_created',
    TODO_UPDATED = 'todo_updated',
    TODO_DELETED = 'todo_deleted',
    TODO_READ = 'todo_read',
    TODO_LISTED = 'todo_listed',
    TODO_LISTING = 'listing_todos',
}