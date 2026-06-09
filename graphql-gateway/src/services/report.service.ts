import { env } from '../config/env';
import { createHttpClient, handleServiceError } from './httpClient';

export const reportService = {
  async getSummary(token: string) {
    try {
      const client = createHttpClient(env.REPORT_SERVICE_URL, token);
      const { data } = await client.get('/reports/summary', { params: { format: 'json' } });
      return data;
    } catch (err) {
      return handleServiceError(err, 'report-service');
    }
  },
};
