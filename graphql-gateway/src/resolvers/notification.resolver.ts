import { notificationService } from '../services/notification.service';
import { GatewayContext } from '../context/context';

export const notificationResolver = {
  Query: {
    notifications: async (_: unknown, __: unknown, _ctx: GatewayContext) => {
      return notificationService.getNotifications();
    },
  },

  Mutation: {
    markNotificationRead: async (_: unknown, { id }: { id: string }, _ctx: GatewayContext) => {
      return notificationService.markAsRead(id);
    },
  },
};
