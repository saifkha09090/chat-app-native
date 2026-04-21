import { supabase } from "@/src/utils/supabase/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
    fetchRecentChats();

    const channel = supabase
      .channel("realtime-conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          console.log("New message detected:", payload);
          fetchRecentChats();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRecentChats = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setCurrentUserId(user.id);

    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
      id,
      created_at,
      user1,
      user2,
      user1_profile:profiles!conversations_user1_fkey (
        full_name,
        email
      ),
      user2_profile:profiles!conversations_user2_fkey (
        full_name,
        email
      )
    `,
      )
      .or(`user1.eq.${user.id},user2.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const chatsWithMessages = await Promise.all(
        data.map(async (chat) => {
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

      setRecentChats(chatsWithMessages);
    } else {
      console.log(error);
    }
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
        <Text>You don't have any chat</Text>
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
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 10 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          const otherUser = getOtherUser(item);
          const receiverId = getReceiverId(item);

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.chatItem}
              onPress={() =>
                router.push({
                  pathname: "/(main)/chatScreen",
                  params: {
                    name: otherUser?.full_name || "User",
                    receiverId: receiverId,
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
                  <Text style={styles.name}>
                    {otherUser?.full_name || "User"}
                  </Text>

                  <Text style={styles.time}>
                    {new Date(item.lastMessageTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>

                <Text style={styles.message} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.fab}
        onPress={() => router.push("/(main)/userSearch")}
      >
        <MaterialIcons name="add-comment" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECE5DD",
  },

  chatItem: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 12,
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
    backgroundColor: "#ccc",
  },

  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },

  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  time: {
    fontSize: 12,
    color: "#888",
  },

  message: {
    fontSize: 13,
    color: "#666",
    marginTop: 3,
  },

  fab: {
    position: "absolute",
    bottom: 70,
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
