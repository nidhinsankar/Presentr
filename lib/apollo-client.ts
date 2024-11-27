import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

const httpLink = createHttpLink({
  // uri: "http://localhost:8686/graphql",
  uri: "https://presentr-modus-presentr.hypermode.app/graphql",
  credentials: "omit", // Changed from 'include' to 'omit' to avoid CORS issues
  headers: {
    "Content-Type": "application/json",
    authorization: `Bearer ${process.env.NEXT_PUBLIC_MODUS_API_KEY}`,
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});

export default client;
