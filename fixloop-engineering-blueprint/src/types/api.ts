export interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    totalCount?: number;
    requestId?: string;
  };
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  requestId?: string;
  details?: Record<string, unknown> | Array<unknown>;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}
