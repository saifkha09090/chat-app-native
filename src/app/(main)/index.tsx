import { supabase } from "@/src/utils/supabase/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const ChatList = () => {
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let msgChannel: any;
    let convoChannel: any;

    const initApp = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setCurrentUserId(user.id);
      await fetchRecentChats(user.id);

      msgChannel = subscribeToMessages(user.id);
      convoChannel = subscribeToConversations(user.id);
    };

    initApp();

    return () => {
      if (msgChannel) supabase.removeChannel(msgChannel);
      if (convoChannel) supabase.removeChannel(convoChannel);
    };
  }, []);

  const sortChats = (chats: any[]) => {
    return chats.sort(
      (a, b) =>
        new Date(b.lastMessageTime).getTime() -
        new Date(a.lastMessageTime).getTime(),
    );
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
      .or(`user1.eq.${userId},user2.eq.${userId}`);

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

    setRecentChats(sortChats(withMessages));
  };

  const subscribeToMessages = (userId: string) => {
    return supabase
      .channel("messages_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const msg = payload.new as any;

          setRecentChats((prev) => {
            const exists = prev.find((c) => c.id === msg.conversation_id);

            if (!exists) {
              fetchRecentChats(userId);
              return prev;
            }

            const updated = prev.map((chat) =>
              chat.id === msg.conversation_id
                ? {
                    ...chat,
                    lastMessage: msg.text,
                    lastMessageTime: msg.created_at,
                  }
                : chat,
            );

            return sortChats([...updated]);
          });
        },
      )
      .subscribe();
  };

  const subscribeToConversations = (userId: string) => {
    return supabase
      .channel("conversations_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        async (payload) => {
          if (payload.eventType === "DELETE") {
            setRecentChats((prev) =>
              prev.filter((c) => c.id !== (payload.old as any).id),
            );
            return;
          }

          const convo = payload.new as any;

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

          if (
            (data.user1 === userId && data.deleted_by_user1) ||
            (data.user2 === userId && data.deleted_by_user2)
          ) {
            return;
          }

          setRecentChats((prev) => {
            const exists = prev.find((c) => c.id === data.id);

            let updated;

            if (!exists) {
              updated = [
                {
                  ...data,
                  lastMessage: "No messages yet",
                  lastMessageTime: data.created_at,
                },
                ...prev,
              ];
            } else {
              updated = prev.map((c) =>
                c.id === data.id ? { ...c, ...data } : c,
              );
            }

            return sortChats([...updated]);
          });
        },
      )
      .subscribe();
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

          const updatePayload = isUser1
            ? { deleted_by_user1: true }
            : { deleted_by_user2: true };

          const { error } = await supabase
            .from("conversations")
            .update(updatePayload)
            .eq("id", chat.id);

          if (error) {
            console.log("Delete error:", error.message);
            return;
          }
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

  if (recentChats.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Text>Chat Not Found</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.fab}
          onPress={() => router.push("/(main)/userSearch")}
        >
          <MaterialIcons name="add-comment" size={28} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

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
              activeOpacity={0.8}
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
              <FontAwesome5
                style={styles.avatar}
                name="user-circle"
                size={50}
                color="#9e9d9d"
              />

              <View style={styles.chatInfo}>
                <View style={styles.rowTop}>
                  <Text style={styles.name}>{user?.full_name || "User"}</Text>

                  <Text style={styles.time}>
                    {formatTime(item.lastMessageTime)}
                  </Text>
                </View>

                <View style={styles.rowTop}>
                  <Text style={styles.message} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>

                  <TouchableOpacity onPress={() => deleteChat(item)}>
                    <MaterialIcons name="delete" size={22} color="#df1313" />
                  </TouchableOpacity>
                </View>
              </View>
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
  container: { flex: 1, backgroundColor: "#292F3F" },

  chatItem: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },

  separator: {
    height: 1,
    backgroundColor: "#000",
    marginLeft: 10,
    marginRight: 10,
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
    color: "#fff",
  },

  time: {
    fontSize: 12,
    color: "#fff",
  },

  message: {
    marginTop: 3,
    color: "#ffefef",
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#0495d3",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});

export default ChatList;
