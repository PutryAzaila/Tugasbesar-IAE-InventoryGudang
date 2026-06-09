import { env } from '../config/env';
import { createHttpClient, handleServiceError } from './httpClient';

export const notificationService = {
  async getNotifications() {
    try {
      const client = createHttpClient(env.NOTIFICATION_SERVICE_URL);
      const { data } = await client.get('/notifications');
      return data.data ?? data;
    } catch (err) {
      return handleServiceError(err, 'notification-service');
    }
  },

  async markAsRead(id: string) {
    try {
      const client = createHttpClient(env.NOTIFICATION_SERVICE_URL);
      const { data } = await client.patch(`/notifications/${id}/read`);
      return data;
    } catch (err) {
      return handleServiceError(err, 'notification-service');
    }
  },
};
