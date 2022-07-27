import { ApolloClient, InMemoryCache } from "@apollo/client";
console.log(process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT);
const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT,
  cache: new InMemoryCache(),
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
  },
});

export default client;
