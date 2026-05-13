// Fallback/local definition to avoid missing-module error
export type PaginationQuery = {
  page?: number;
  limit?: number;
  [key: string]: any;
};
