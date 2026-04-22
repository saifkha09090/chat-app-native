import { supabase } from "@/src/utils/supabase/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const ChatList = () => {
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let messagesChannel: any;
    let convoChannel: any;

    const setup = async () => {
      await init();

      messagesChannel = subscribeToMessages();
      convoChannel = subscribeToConversations();
    };

    setup();

    return () => {
      if (messagesChannel) supabase.removeChannel(messagesChannel);
      if (convoChannel) supabase.removeChannel(convoChannel);
    };
  }, []);

  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setCurrentUserId(user.id);
    fetchRecentChats(user.id);
  };

  const fetchRecentChats = async (uid?: string) => {
    const userId = uid || currentUserId;
    if (!userId) return;

    const { data } = await supabase
      .from("conversations")
      .select(
        `
        id,
        created_at,
        user1,
        user2,
        deleted_by_user1,
        deleted_by_user2,
        user1_profile:profiles!conversations_user1_fkey (full_name),
        user2_profile:profiles!conversations_user2_fkey (full_name)
      `,
      )
      .or(`user1.eq.${userId},user2.eq.${userId}`)
      .order("created_at", { ascending: false });

    const filtered = (data || []).filter((chat) => {
      if (chat.user1 === userId && chat.deleted_by_user1) return false;
      if (chat.user2 === userId && chat.deleted_by_user2) return false;
      return true;
    });

    const withMessages = await Promise.all(
      filtered.map(async (chat) => {
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("text, created_at")
          .eq("conversation_id", chat.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...chat,
          lastMessage: lastMsg?.text || "No messages yet",
          lastMessageTime: lastMsg?.created_at || chat.created_at,
        };
      }),
    );

    setRecentChats(withMessages);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel("chatlist_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new;

          setRecentChats((prev) =>
            prev.map((chat) =>
              chat.id === msg.conversation_id
                ? {
                    ...chat,
                    lastMessage: msg.text,
                    lastMessageTime: msg.created_at,
                  }
                : chat,
            ),
          );
        },
      )
      .subscribe();

    return channel;
  };

  const subscribeToConversations = () => {
    const channel = supabase
      .channel("chatlist_conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        async (payload) => {
          const convo = payload.new as any;

          if (payload.eventType === "DELETE") {
            setRecentChats((prev) =>
              prev.filter((c) => c.id !== (payload.old as any).id),
            );
            return;
          }

          const { data } = await supabase
            .from("conversations")
            .select(
              `
            id,
            created_at,
            user1,
            user2,
            deleted_by_user1,
            deleted_by_user2,
            user1_profile:profiles!conversations_user1_fkey (full_name),
            user2_profile:profiles!conversations_user2_fkey (full_name)
          `,
            )
            .eq("id", convo.id)
            .single();

          if (!data) return;

          setRecentChats((prev) => {
            const exists = prev.find((c) => c.id === data.id);

            if (!exists) return [data, ...prev];

            return prev.map((c) => (c.id === data.id ? { ...c, ...data } : c));
          });
        },
      )
      .subscribe();

    return channel;
  };

  const deleteChat = (chat: any) => {
    Alert.alert("Delete Chat", "Delete this chat for you?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!currentUserId) return;

          const isUser1 = chat.user1 === currentUserId;

          await supabase
            .from("conversations")
            .update(
              isUser1 ? { deleted_by_user1: true } : { deleted_by_user2: true },
            )
            .eq("id", chat.id);

          setRecentChats((prev) => prev.filter((c) => c.id !== chat.id));
        },
      },
    ]);
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOtherUser = (item: any) => {
    if (!currentUserId) return null;

    return item.user1 === currentUserId
      ? item.user2_profile
      : item.user1_profile;
  };

  const getReceiverId = (item: any) => {
    if (!currentUserId) return null;
    return item.user1 === currentUserId ? item.user2 : item.user1;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={recentChats}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          const user = getOtherUser(item);
          const receiverId = getReceiverId(item);

          return (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() =>
                router.push({
                  pathname: "/(main)/chatScreen",
                  params: {
                    name: user?.full_name || "User",
                    receiverId,
                  },
                })
              }
            >
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
                }}
                style={styles.avatar}
              />

              <View style={styles.chatInfo}>
                <View style={styles.rowTop}>
                  <Text style={styles.name}>{user?.full_name || "User"}</Text>

                  <Text style={styles.time}>
                    {formatTime(item.lastMessageTime)}
                  </Text>
                </View>

                <Text style={styles.message} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              </View>

              {/* <TouchableOpacity onPress={() => deleteChat(item)}>
                <MaterialIcons name="delete" size={22} color="red" />
              </TouchableOpacity> */}
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(main)/userSearch")}
      >
        <MaterialIcons name="add-comment" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ECE5DD" },

  chatItem: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    alignItems: "center",
  },

  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginLeft: 80,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },

  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
  },

  time: {
    fontSize: 12,
    color: "#888",
  },

  message: {
    marginTop: 3,
    color: "#666",
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#25D366",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});

export default ChatList;
