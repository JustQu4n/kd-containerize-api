import request from 'supertest';
import app from '../src/app';
import db from '../src/prisma/client';
import { seedTodo, cleanup } from './helpers';
import { Todo, TodoStatus } from '@prisma/client';
import * as EmailUtil from '../src/utils/email';

// Mock the email service
jest.mock('../src/utils/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

describe('Todo API', () => {
  beforeEach(async () => {
    await cleanup();
  });

  describe('POST /api/todos', () => {
    it('should return 201 and the created todo for valid data', async () => {
      const todoData = { title: 'New Todo' };
      const res = await request(app).post('/api/todos').send(todoData);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(todoData.title);
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app).post('/api/todos').send({});
      expect(res.status).toBe(400);
    });

    it('should return 400 if title is an empty string', async () => {
      const res = await request(app).post('/api/todos').send({ title: '' });
      expect(res.status).toBe(400);
    });

    it('should return 400 if title exceeds max length', async () => {
      const longTitle = 'a'.repeat(256);
      const res = await request(app).post('/api/todos').send({ title: longTitle });
      expect(res.status).toBe(400);
    });

    it('should return 400 if dueAt has an invalid ISO format', async () => {
      const todoData = { title: 'Invalid Date', dueAt: 'not-a-date' };
      const res = await request(app).post('/api/todos').send(todoData);
      expect(res.status).toBe(400);
    });

    it('should call email service when creating a todo with dueAt', async () => {
      const dueAt = new Date();
      dueAt.setDate(dueAt.getDate() + 1);
      const todoData = { title: 'Todo with due date', dueAt: dueAt.toISOString() };
      const res = await request(app).post('/api/todos').send(todoData);

      expect(res.status).toBe(201);
      expect(EmailUtil.sendEmail).toHaveBeenCalled();
    });
  });

  describe('GET /api/todos', () => {
    it('should return 200 and an empty array if no todos exist', async () => {
      const res = await request(app).get('/api/todos');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('should return 200 and handle pagination correctly', async () => {
      await seedTodo({ title: 'Todo 1' });
      await seedTodo({ title: 'Todo 2' });
      await seedTodo({ title: 'Todo 3' });

      const res = await request(app).get('/api/todos?page=2&limit=2');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.meta.total).toBe(3);
      expect(res.body.meta.page).toBe(2);
      expect(res.body.meta.limit).toBe(2);
    });

    it('should return 200 and filter correctly by status=completed', async () => {
      await seedTodo({ title: 'Todo 1', status: TodoStatus.completed });
      await seedTodo({ title: 'Todo 2', status: TodoStatus.pending });
      await seedTodo({ title: 'Todo 3', status: TodoStatus.completed });

      const res = await request(app).get('/api/todos?status=completed');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      res.body.data.forEach((todo: Todo) => {
        expect(todo.status).toBe(TodoStatus.completed);
      });
    });
  });

  describe('GET /api/todos/:id', () => {
    let todo: Todo;

    beforeEach(async () => {
      todo = await seedTodo({ title: 'Test' });
    });

    it('should return 200 and the correct todo by id', async () => {
      const res = await request(app).get(`/api/todos/${todo.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(todo.id);
    });

    it('should return 404 if id does not exist', async () => {
      const res = await request(app).get('/api/todos/non-existent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/todos/:id', () => {
    let todo: Todo;

    beforeEach(async () => {
      todo = await seedTodo({ title: 'Original Title' });
    });

    it('should return 200 and update the fields correctly', async () => {
      const updates = { title: 'Updated Title', status: TodoStatus.completed };
      const res = await request(app).put(`/api/todos/${todo.id}`).send(updates);
      expect(res.status).toBe(200);
      expect(res.body.title).toBe(updates.title);
      expect(res.body.status).toBe(updates.status);
    });

    it('should return 400 if the body is invalid', async () => {
      const updates = { title: '' }; // Invalid: empty title
      const res = await request(app).put(`/api/todos/${todo.id}`).send(updates);
      expect(res.status).toBe(400);
    });

    it('should return 404 if id does not exist', async () => {
      const updates = { title: 'Updated Title' };
      const res = await request(app).put('/api/todos/non-existent-id').send(updates);
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    let todo: Todo;

    beforeEach(async () => {
      todo = await seedTodo({ title: 'To be deleted' });
    });

    it('should return 204 No Content on successful deletion', async () => {
      const res = await request(app).delete(`/api/todos/${todo.id}`);
      expect(res.status).toBe(204);
    });

    it('should return 404 if id does not exist', async () => {
      const res = await request(app).delete('/api/todos/non-existent-id');
      expect(res.status).toBe(404);
    });
  });
});
