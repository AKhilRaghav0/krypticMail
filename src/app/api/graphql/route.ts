import { createYoga } from 'graphql-yoga';
import { createSchema } from 'graphql-tools';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';

const { handleRequest } = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response }
});

export { handleRequest as GET, handleRequest as POST }; 