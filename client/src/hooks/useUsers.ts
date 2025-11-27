import { useEffect, useState } from "react";
import type { User } from "../types";
import { GET_USERS } from "../graphql/operations";
import { apolloClient } from "../lib/apollo";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load users from server
  useEffect(() => {
    async function loadUsers() {
      setLoading(true);

      try {
        const { data, error } = await apolloClient.query<{
          users: User[];
        }>({
          query: GET_USERS,
          fetchPolicy: "network-only",
        });

        if (data) {
          setUsers(data.users);
        }
        if (error) {
          console.log(error);
        }
      } catch (error) {
        console.error("[useUsers] load error", error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  return { users, loading, error };
}
