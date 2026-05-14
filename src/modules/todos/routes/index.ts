import { Router } from 'express';
import { TodoService } from '../services/todo.service';
import { TodoController } from '../controllers/todo.controller';
import { TodoRepository } from '../repositories';
import { asyncHandler } from '../../../shared/utils';

/**
 * Todo Routes
 * All endpoints for todo management
 */
export function createTodoRoutes(): Router {
  const router = Router();


  const repository = new TodoRepository();
  const service = new TodoService(repository);
  const controller = new TodoController(service);

  router.get('/', asyncHandler(controller.listTodos));


  router.get('/:id', asyncHandler(controller.getTodo));


  router.post('/', asyncHandler(controller.createTodo));


  router.put('/:id', asyncHandler(controller.updateTodo));


  router.delete('/:id', asyncHandler(controller.deleteTodo));

  return router;
}

export default createTodoRoutes();
