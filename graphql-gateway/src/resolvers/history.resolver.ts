import { historyService } from '../services/history.service';
import { GatewayContext } from '../context/context';
import { GraphQLError } from 'graphql';

export const historyResolver = {
  Query: {
    history: async (
      _: unknown,
      { limit }: { limit?: number },
      { token }: GatewayContext,
    ) => {
      if (!token) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return historyService.getHistory(token, limit);
    },
  },
};
