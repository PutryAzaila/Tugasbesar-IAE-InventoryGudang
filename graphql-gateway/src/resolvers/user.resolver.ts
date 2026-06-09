import { userService } from '../services/user.service';
import { GatewayContext } from '../context/context';
import { GraphQLError } from 'graphql';

function requireAuth(token: string | undefined): string {
  if (!token) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return token;
}

export const userResolver = {
  Query: {
    me: async (_: unknown, __: unknown, { token }: GatewayContext) => {
      return userService.me(requireAuth(token));
    },

    users: async (_: unknown, __: unknown, { token }: GatewayContext) => {
      return userService.getUsers(requireAuth(token));
    },

    roles: async (_: unknown, __: unknown, { token }: GatewayContext) => {
      return userService.getRoles(requireAuth(token));
    },
  },
};
