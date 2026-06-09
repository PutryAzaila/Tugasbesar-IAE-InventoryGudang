import { GraphQLFormattedError } from 'graphql';
import { unwrapResolverError } from '@apollo/server/errors';

export function formatError(
  formattedError: GraphQLFormattedError,
  error: unknown,
): GraphQLFormattedError {
  unwrapResolverError(error);

  if (process.env.NODE_ENV === 'production') {
    return {
      message: formattedError.message,
      locations: formattedError.locations,
      path: formattedError.path,
      extensions: {
        code: (formattedError.extensions?.code as string) || 'INTERNAL_SERVER_ERROR',
      },
    };
  }

  return formattedError;
}
