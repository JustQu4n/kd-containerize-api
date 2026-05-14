import { ZodError, ZodSchema } from 'zod';
import { ValidationError } from '../../infrastructure/errors';

/**
 * Validate data against Zod schema
 * Throws ValidationError if validation fails
 *
 * Usage:
 * const validated = validateDto(data, CreateTodoSchema);
 */
export function validateDto<T>(data: unknown, schema: ZodSchema): T {
  try {
    return schema.parse(data) as T;
  } catch (err) {
    if (err instanceof ZodError) {
      // Convert Zod errors to field map format
      const fields: Record<string, string[]> = {};
      err.errors.forEach((error) => {
        const path = error.path.join('.');
        if (!fields[path]) {
          fields[path] = [];
        }
        fields[path].push(error.message);
      });

      throw new ValidationError('Validation failed', fields);
    }
    throw err;
  }
}

/**
 * Safe validation - returns result object
 * Useful when you need to handle validation without throwing
 *
 * Usage:
 * const result = safeScan(data, CreateTodoSchema);
 * if (!result.success) { ... }
 */
export function safeValidate<T>(
  data: unknown,
  schema: ZodSchema,
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  try {
    const validated = schema.parse(data) as T;
    return { success: true, data: validated };
  } catch (err) {
    if (err instanceof ZodError) {
      const fields: Record<string, string[]> = {};
      err.errors.forEach((error) => {
        const path = error.path.join('.');
        if (!fields[path]) {
          fields[path] = [];
        }
        fields[path].push(error.message);
      });
      return { success: false, errors: fields };
    }
    throw err;
  }
}
