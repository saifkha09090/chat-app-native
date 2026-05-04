import { router } from "expo-router";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/authServices";
import { GroupService } from "../services/groupServices";
import { supabase } from "../utils/supabase/supabase";

type User = {
  id: string;
  name: string;
  avatar?: string;
  email: string;
};

export const UseGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [conversationUsers, setConversationUsers] = useState<User[]>([]);
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      if (!user) return;

      setCurrentUserId(user.id);
      await fetchConversationUsers(user.id);
    };

    init();
  }, []);

  const fetchConversationUsers = async (uid: string) => {
    const { data } = await supabase
      .from("conversation_participants")
      .select(
        `
        user_id,
        profiles (
          id,
          full_name,
          avatar_url,
          email,
        )
      `,
      )
      .neq("user_id", uid);

    const map = new Map<string, User>();

    data?.forEach((item: any) => {
      if (item.profiles) {
        map.set(item.user_id, {
          id: item.user_id,
          name: item.profiles.full_name,
          avatar: item.profiles.avatar_url,
          email: item.profiles.email,
        });
      }
    });

    setConversationUsers(Array.from(map.values()));
  };

  const searchProfiles = async (text: string) => {
    setSearch(text);

    if (!text.trim()) {
      setSearchUsers([]);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, email")
      .ilike("email", `%${text}%`)
      .neq("id", currentUserId)
      .limit(20);

    const formatted: User[] =
      data?.map((u: any) => ({
        id: u.id,
        name: u.full_name,
        avatar: u.avatar_url,
        email: u.email,
      })) || [];

    setSearchUsers(formatted);
  };

  const mergedUsers: User[] = Array.from(
    new Map(
      [...searchUsers, ...conversationUsers].map((u) => [u.id, u]),
    ).values(),
  );

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id],
    );
  };

  const createGroup = async () => {
    if (!groupName || !currentUserId) return;

    const group = await GroupService.createGroup(
      currentUserId,
      groupName,
      selectedUsers,
    );

    router.back();
    console.log("Group Created:", group);
  };

  return {
    groupName,
    setGroupName,
    search,
    searchProfiles,
    mergedUsers,
    selectedUsers,
    toggleUser,
    createGroup,
  };
};
