import { ChatListService } from "@/src/services/chatListServices";
import { supabase } from "@/src/utils/supabase/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/authServices";

export const useChatList = () => {
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [filteredChats, setFilteredChats] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const sortChats = (chats: any[]) =>
    chats.sort(
      (a, b) =>
        new Date(b.lastMessageTime).getTime() -
        new Date(a.lastMessageTime).getTime(),
    );

  const getmsg = async (chats: any[]) => {
    return Promise.all(
      chats.map(async (chat) => {
        const lastMsg = await ChatListService.getLastMessage(
          chat.conversation_id,
        );

        return {
          ...chat,
          lastMessage: lastMsg?.text
            ? lastMsg.text
            : lastMsg?.image
              ? "📸 " + " image"
              : "No message",
          lastMessageTime: lastMsg?.created_at || chat.created_at,
        };
      }),
    );
  };

  const fetchChats = async (uid: string) => {
    const chats = await ChatListService.fetchConversations(uid);

    const chatmsg = await getmsg(chats);

    const sorted = sortChats(chatmsg);
    setRecentChats(sorted);
    setFilteredChats(sorted);
  };

  const handlePressChat = (user: any, receiverId: any) => {
    handleSearch("");
    setSearch("");

    router.push({
      pathname: "/(main)/chatScreen",
      params: {
        name: user?.full_name || "User",
        receiverId,
        avatar: user?.avatar_url,
        email: user?.email || "Email",
      },
    });
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (!text.trim()) {
      setFilteredChats(recentChats);
      return;
    }
    const filtered = recentChats.filter((chat) => {
      if (!chat.conversations?.is_group) {
        return chat.profiles?.full_name
          ?.toLowerCase()
          .includes(text.toLowerCase());
      }

      return chat.conversations?.name
        ?.toLowerCase()
        .includes(text.toLowerCase());
    });

    setFilteredChats(filtered);
  };

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      if (!user) return;

      setCurrentUserId(user.id);
      await fetchChats(user.id);
    };

    init();
  }, []);

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();

    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    return isToday
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], { day: "2-digit", month: "short" });
  };

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("messages_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async () => {
          await fetchChats(currentUserId);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  return {
    recentChats,
    filteredChats,
    setFilteredChats,
    search,
    currentUserId,
    handleSearch,
    fetchChats,
    formatTime,
    handlePressChat,
  };
};
