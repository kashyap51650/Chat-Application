import { DELETE_MESSAGE } from "../graphql/operations";
import { apolloClient } from "../lib/apollo";

export const useDeleteMessage = () => {
  const deleteMessage = async (messageId: string) => {
    try {
      const { data } = await apolloClient.mutate<{ deleteMessage: boolean }>({
        mutation: DELETE_MESSAGE,
        variables: { messageId },
      });
      return data?.deleteMessage;
    } catch (err) {
      console.error("Error deleting message:", err);
      throw err;
    }
  };

  return {
    deleteMessage,
  };
};
