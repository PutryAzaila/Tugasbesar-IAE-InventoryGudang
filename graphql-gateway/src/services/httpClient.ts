import axios, { AxiosInstance, AxiosError } from 'axios';
import { GraphQLError } from 'graphql';

export function createHttpClient(baseURL: string, token?: string): AxiosInstance {
  return axios.create({
    baseURL,
    timeout: 10000,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function handleServiceError(error: unknown, serviceName: string): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<Record<string, unknown>>;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;
    const message =
      (typeof data?.message === 'string' ? data.message : undefined) ||
      (typeof data?.error === 'string' ? data.error : undefined) ||
      axiosError.message;

    let code = 'SERVICE_ERROR';
    if (status === 401) code = 'UNAUTHENTICATED';
    else if (status === 403) code = 'FORBIDDEN';
    else if (status === 404) code = 'NOT_FOUND';
    else if (status === 422 || status === 400) code = 'BAD_USER_INPUT';

    throw new GraphQLError(message, {
      extensions: { code, http: { status }, service: serviceName },
    });
  }

  throw new GraphQLError(`${serviceName} is unavailable`, {
    extensions: { code: 'SERVICE_UNAVAILABLE', service: serviceName },
  });
}
