import { authService } from '../services/auth.service';
import { GatewayContext } from '../context/context';
import { GraphQLError } from 'graphql';

export const authResolver = {
  Mutation: {
    login: async (
      _: unknown,
      { input }: { input: { username: string; password: string } },
    ) => {
      return authService.login(input.username, input.password);
    },

    register: async (
      _: unknown,
      { input }: { input: { username: string; password: string; role: string } },
      { token }: GatewayContext,
    ) => {
      if (!token) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return authService.register(input.username, input.password, input.role, token);
    },
  },
};
