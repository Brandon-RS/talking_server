type Status = 'SUCCESS' | 'FAILED';

type ResponseBase = {
  status: Status;
};

type SuccessResponse<T> = ResponseBase & { data: T };
type ErrorResponse = ResponseBase & { message: string };

export const getSuccessResponse = <T>(data: T): SuccessResponse<T> => {
  return {
    status: 'SUCCESS',
    data,
  };
};

export const getErrorResponse = (message: string): ErrorResponse => {
  return {
    status: 'FAILED',
    message,
  };
};
