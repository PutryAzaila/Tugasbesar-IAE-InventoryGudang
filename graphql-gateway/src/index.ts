import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { buildContext, GatewayContext } from './context/context';
import { formatError } from './errors/formatError';
import { env } from './config/env';

async function main() {
  const server = new ApolloServer<GatewayContext>({
    typeDefs,
    resolvers,
    formatError,
    introspection: true,
    plugins: [
      env.APOLLO_SANDBOX
        ? ApolloServerPluginLandingPageLocalDefault({ embed: true })
        : ApolloServerPluginLandingPageProductionDefault({ footer: false }),
    ],
  });

  const { url } = await startStandaloneServer(server, {
    context: buildContext,
    listen: { port: parseInt(env.PORT) },
  });

  console.log(`GraphQL Gateway ready at ${url}`);
  if (env.APOLLO_SANDBOX) {
    console.log(`Apollo Sandbox: open ${url} in your browser`);
  }
}

main().catch((err) => {
  console.error('Failed to start GraphQL Gateway:', err);
  process.exit(1);
});
