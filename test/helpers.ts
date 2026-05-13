import { Todo, TodoStatus } from '@prisma/client';
import db from '../src/prisma/client';

export async function seedTodo(data?: Partial<Todo>) {
  return db.todo.create({
    data: {
      title: 'Default todo',
      status: TodoStatus.pending,
      userId: 'mock-user-id',
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
      ...data,
    },
  });
}

export async function cleanup() {
  await db.todo.deleteMany();
}
