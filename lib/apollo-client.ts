import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import fetch from "isomorphic-fetch";

const httpLink = createHttpLink({
  uri: "http://localhost:8686/graphql",
  credentials: "omit", // Changed from 'include' to 'omit' to avoid CORS issues
  headers: {
    "Content-Type": "application/json",
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
