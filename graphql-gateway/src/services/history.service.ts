import { env } from '../config/env';
import { createHttpClient, handleServiceError } from './httpClient';

export const historyService = {
  async getHistory(token: string, limit?: number) {
    try {
      const client = createHttpClient(env.HISTORY_SERVICE_URL, token);
      const params = limit ? { limit } : {};
      const { data } = await client.get('/history', { params });
      return data;
    } catch (err) {
      return handleServiceError(err, 'history-service');
    }
  },
};
