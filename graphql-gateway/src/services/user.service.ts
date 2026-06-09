import { env } from '../config/env';
import { createHttpClient, handleServiceError } from './httpClient';

export const userService = {
  async me(token: string) {
    try {
      const client = createHttpClient(env.AUTH_SERVICE_URL, token);
      const { data } = await client.get('/auth/me');
      return data;
    } catch (err) {
      return handleServiceError(err, 'auth-service');
    }
  },

  async getUsers(token: string) {
    try {
      const client = createHttpClient(env.AUTH_SERVICE_URL, token);
      const { data } = await client.get('/auth/users');
      return data;
    } catch (err) {
      return handleServiceError(err, 'auth-service');
    }
  },

  async getRoles(token: string) {
    try {
      const client = createHttpClient(env.AUTH_SERVICE_URL, token);
      const { data } = await client.get('/auth/roles');
      return data;
    } catch (err) {
      return handleServiceError(err, 'auth-service');
    }
  },
};
