import { TodoRepository } from './todo.repository';
export { ITodoRepository } from './todo.repository.interface';
export { TodoRepository } from './todo.repository';

// Repository singleton instance
export const todoRepository = new TodoRepository();
