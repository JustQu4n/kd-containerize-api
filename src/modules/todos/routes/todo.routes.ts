import { Router } from 'express';
import { TodoController } from '../controllers/todo.controller';
import { auditLog } from '@/infrastructure/middleware';
import { asyncHandler } from '@/shared/utils/async-handler';
import { todoRepository } from '../repositories';
import { TodoService } from '../services';


const router = Router();

// ── DI──────
const service = new TodoService(todoRepository);
const controller = new TodoController(service);


router.get(
  '/',
  auditLog('todo.list'),
  asyncHandler(controller.listTodos)
);

router.get(
  '/:id',
  auditLog('todo.read'),
  asyncHandler(controller.getTodo)
);


router.post(
  '/',
  auditLog('todo.create'),
  asyncHandler(controller.createTodo)
);


router.put(
  '/:id',
  auditLog('todo.update'),
  asyncHandler(controller.updateTodo)
);


router.delete(
  '/:id',
  auditLog('todo.delete'),
  asyncHandler(controller.deleteTodo)
);

export default router;
