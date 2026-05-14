import { z } from 'zod';
import { TodoStatus, TodoValidation } from '../domain';

/**
 * Todo Status Schema
 */
const TodoStatusSchema = z.nativeEnum(TodoStatus);

/**
 * Create Todo Request Validator
 */
export const CreateTodoDtoSchema = z
  .object({
    title: z
      .string()
      .min(TodoValidation.title.minLength, 'Title is required')
      .max(
        TodoValidation.title.maxLength,
        `Title must be at most ${TodoValidation.title.maxLength} characters`,
      ),
    description: z
      .string()
      .max(
        TodoValidation.description.maxLength,
        `Description must be at most ${TodoValidation.description.maxLength} characters`,
      )
      .optional(),
    dueAt: z.number().int().positive('Due date must be a valid Unix timestamp').optional(),
    userId: z.string().min(1, 'User ID is required'),
  })
  .strict();

/**
 * Update Todo Request Validator
 */
export const UpdateTodoDtoSchema = z
  .object({
    title: z
      .string()
      .min(TodoValidation.title.minLength)
      .max(TodoValidation.title.maxLength)
      .optional(),
    description: z.string().max(TodoValidation.description.maxLength).nullish(),
    status: TodoStatusSchema.optional(),
    dueAt: z.number().int().positive().nullish(),
  })
  .strict();

/**
 * List Todos Query Validator
 */
export const ListTodosQueryDtoSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: TodoStatusSchema.optional(),
    userId: z.string().optional(),
  })
  .strict();
