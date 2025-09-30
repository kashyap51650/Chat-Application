import { useEffect, useState } from "react";
import type { User } from "../types";
import { GET_USERS } from "../graphql/operations";
import { useConnectivity } from "./useConnectivity";
import { ChatStorage } from "../lib/chatStorage";
import { apolloClient } from "../lib/apollo";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const online = useConnectivity();

  // Load users from local DB initially
  useEffect(() => {
    async function loadUsers() {
      setLoading(true);

      try {
        const localUsers = await ChatStorage.getAllUsers();
        setUsers(localUsers);

        // Optional: fetch from server if online and local DB is empty
        if (online && localUsers.length === 0) {
          const { data, error } = await apolloClient.query<{
            users: User[];
          }>({
            query: GET_USERS,
            fetchPolicy: "network-only",
          });

          if (data) {
            for (const user of data.users) {
              await ChatStorage.addUser(user);
            }
            setUsers(data.users);
            setLoading(false);
          }
          if (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.error("[useUsers] load error", error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [online]);

  //   // Listen for new users via subscription
  //   useEffect(() => {
  //     if (!online) return;

  //     const sub = apolloClient
  //       .subscribe({ query: USER_ADDED_SUBSCRIPTION })
  //       .subscribe({
  //         next: async ({ data }) => {
  //           const newUser = data.userAdded as User;
  //           // Add to IndexedDB
  //           await ChatStorage.addUser(newUser);
  //           // Update local state
  //           setUsers((prev) => [...prev, newUser]);
  //         },
  //         error: (err) => console.error("[useUsers] subscription error", err),
  //       });

  //     return () => sub.unsubscribe();
  //   }, [online]);

  return { users, loading, error };
}
