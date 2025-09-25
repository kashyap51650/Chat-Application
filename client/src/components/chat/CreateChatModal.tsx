import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  CREATE_CHAT_ROOM,
  GET_USERS,
  GET_MY_CHAT_ROOMS,
} from "../../graphql/operations";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";
import type { User, CreateChatRoomInput } from "../../types";

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateChatModal: React.FC<CreateChatModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user: currentUser } = useAuth();
  const { setSelectedChatRoom } = useChat();
  const [formData, setFormData] = useState<CreateChatRoomInput>({
    name: "",
    description: "",
    isPrivate: false,
    participantIds: [],
  });
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS);
  const [createChatRoom, { loading: creating }] = useMutation(
    CREATE_CHAT_ROOM,
    {
      refetchQueries: [{ query: GET_MY_CHAT_ROOMS }],
    }
  );

  const users: User[] = (usersData as any)?.users || [];
  const filteredUsers = users.filter(
    (user) =>
      user.id !== currentUser?.id &&
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedUsers.some((selected) => selected.id === user.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || selectedUsers.length === 0) return;

    try {
      const { data } = await createChatRoom({
        variables: {
          input: {
            ...formData,
            participantIds: selectedUsers.map((user) => user.id),
          },
        },
      });

      if ((data as any)?.createChatRoom) {
        setSelectedChatRoom((data as any).createChatRoom);
        onClose();
      }
    } catch (error) {
      console.error("Create chat room error:", error);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUsers((prev) => [...prev, user]);
    setSearchTerm("");
  };

  const handleUserRemove = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-secondary-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-secondary-900">
              Create New Chat
            </h2>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Chat Name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter chat name"
            required
          />

          <Input
            label="Description (Optional)"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Enter chat description"
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="private"
              checked={formData.isPrivate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isPrivate: e.target.checked,
                }))
              }
              className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
            />
            <label
              htmlFor="private"
              className="ml-2 text-sm text-secondary-700"
            >
              Private Chat
            </label>
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary-700">
                Selected Participants ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center bg-primary-50 rounded-full px-3 py-1"
                  >
                    <Avatar user={user} size="sm" />
                    <span className="ml-2 text-sm text-primary-700">
                      {user.username}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUserRemove(user.id)}
                      className="ml-2 text-primary-400 hover:text-primary-600"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Search */}
          <div className="space-y-2">
            <Input
              label="Add Participants"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
            />

            {/* User List */}
            <div className="max-h-40 overflow-y-auto border border-secondary-200 rounded-lg">
              {usersLoading ? (
                <div className="p-4 text-center text-secondary-500">
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-secondary-500">
                  {searchTerm
                    ? "No users found"
                    : "Start typing to search users"}
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="flex items-center p-3 hover:bg-secondary-50 cursor-pointer border-b border-secondary-100 last:border-b-0"
                  >
                    <Avatar user={user} size="sm" showOnlineStatus />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-secondary-900">
                        {user.username}
                      </p>
                      <p className="text-xs text-secondary-500">{user.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={creating}
              disabled={!formData.name.trim() || selectedUsers.length === 0}
            >
              Create Chat
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChatModal;
