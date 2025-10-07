import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

// HTTP Link for queries and mutations
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_APP_SERVER_URL,
});

// WebSocket Link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_APP_SERVER_URL,
    connectionParams: () => {
      const token = localStorage.getItem("token");
      return {
        authorization: token ? `Bearer ${token}` : "",
      };
    },
  })
);

// Auth Link to add authorization header
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Error Link for handling network errors
const errorLink = onError((errorHandler: any) => {
  if (errorHandler.graphQLErrors) {
    errorHandler.graphQLErrors.forEach((error: any) =>
      console.log(
        `[GraphQL error]: Message: ${error.message}, Location: ${error.locations}, Path: ${error.path}`
      )
    );
  }

  if (errorHandler.networkError) {
    console.log(`[Network error]: ${errorHandler.networkError}`);

    // Handle offline scenarios
    if (!navigator.onLine) {
      console.log("Application is offline");
      // You can show offline notification here
    }
  }
});

// Retry Link for failed requests
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 5,
    retryIf: (error) => !!error && navigator.onLine,
  },
});

// Split Link to route queries/mutations to HTTP and subscriptions to WebSocket
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  from([errorLink, retryLink, authLink, httpLink])
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // messages: {
          //   merge(existing = [], incoming) {
          //     return [...existing, ...incoming];
          //   },
          // },
          // directMessages: {
          //   merge(existing = [], incoming) {
          //     return [...existing, ...incoming];
          //   },
          // },
          myChatRooms: {
            merge(_, incoming) {
              return incoming;
            },
          },
          myDirectChats: {
            merge(_, incoming) {
              return incoming;
            },
          },
          myConversations: {
            merge(_, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
    },
    query: {
      errorPolicy: "all",
      fetchPolicy: "cache-first",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});
