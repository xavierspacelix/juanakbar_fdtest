export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export function success<T>(message: string, data?: T): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    errors: null,
  };
}

export function error(message: string, errors?: any): ApiResponse<null> {
  return {
    success: false,
    message,
    data: null,
    errors,
  };
}
