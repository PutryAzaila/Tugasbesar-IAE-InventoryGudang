import { env } from '../config/env';
import { createHttpClient, handleServiceError } from './httpClient';

export const authService = {
  async login(username: string, password: string) {
    try {
      const client = createHttpClient(env.AUTH_SERVICE_URL);
      const { data } = await client.post('/auth/login', { username, password });
      return data;
    } catch (err) {
      return handleServiceError(err, 'auth-service');
    }
  },

  async register(username: string, password: string, role: string, token: string) {
    try {
      const client = createHttpClient(env.AUTH_SERVICE_URL, token);
      const { data } = await client.post('/auth/register', { username, password, role });
      return data;
    } catch (err) {
      return handleServiceError(err, 'auth-service');
    }
  },
};
