import { reportService } from '../services/report.service';
import { GatewayContext } from '../context/context';
import { GraphQLError } from 'graphql';

export const reportResolver = {
  Query: {
    reportSummary: async (_: unknown, __: unknown, { token }: GatewayContext) => {
      if (!token) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return reportService.getSummary(token);
    },
  },
};
