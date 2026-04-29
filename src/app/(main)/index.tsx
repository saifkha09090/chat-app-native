import { supabase } from "@/src/utils/supabase/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale } from "react-native-size-matters";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const ChatList = () => {
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [filteredChats, setFilteredChats] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
        user1_profile:profiles!conversations_user1_fkey (*),
        user2_profile:profiles!conversations_user2_fkey (*)
      `,
      )
      .or(`user1.eq.${userId},user2.eq.${userId}`);

    const filtered = (data || []).filter((chat) => {
      return true;
    });

    const withMessages = await Promise.all(
      filtered.map(async (chat) => {
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("text, image, created_at")
          .eq("conversation_id", chat.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...chat,
          lastMessage: lastMsg?.text
            ? lastMsg?.text
            : lastMsg?.image
              ? "send a image"
              : "No message",
          lastMessageTime: lastMsg?.created_at || chat.created_at,
        };
      }),
    );

    const sorted = sortChats(withMessages);
    setRecentChats(sorted);
    setFilteredChats(sorted);
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

            const sorted = sortChats(updated);
            setFilteredChats(sorted);
            return sorted;
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
            setFilteredChats((prev) =>
              prev.filter((c) => c.id !== (payload.old as any).id),
            );
            return;
          }

          fetchRecentChats(userId);
        },
      )
      .subscribe();
  };

  const handleSearch = (text: string) => {
    setSearchText(text);

    if (text.trim() === "") {
      setFilteredChats(recentChats);
      return;
    }

    const filtered = recentChats.filter((chat) => {
      const user =
        chat.user1 === currentUserId ? chat.user2_profile : chat.user1_profile;

      return user?.full_name?.toLowerCase().includes(text.toLowerCase());
    });

    setFilteredChats(filtered);
  };

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
    <SafeAreaView
      style={[styles.container, { marginBottom: keyboardHeight }]}
      edges={[]}
    >
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={24} color="#666" />
        <TextInput
          placeholder="Search by name..."
          placeholderTextColor="#aaa"
          style={styles.input}
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          const user = getOtherUser(item);
          const receiverId = getReceiverId(item);

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.chatItem}
              onPress={() => {
                setSearchText("");
                if (searchText.trim() === "") {
                  setFilteredChats(recentChats);
                }
                router.push({
                  pathname: "/(main)/chatScreen",
                  params: {
                    name: user?.full_name || "User",
                    receiverId,
                    avatar: user?.avatar_url,
                    email: user?.email || "Email",
                  },
                });
              }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: "/(main)/imageView",
                    params: {
                      uri:
                        item.user1 === currentUserId
                          ? item.user2_profile.avatar_url
                          : item.user1_profile.avatar_url,
                    },
                  })
                }
              >
                <Image
                  source={{
                    uri:
                      item.user1 === currentUserId
                        ? item.user2_profile.avatar_url
                        : item.user1_profile.avatar_url,
                  }}
                  style={styles.avatar}
                />
              </TouchableOpacity>

              <View style={styles.chatInfo}>
                <View style={styles.rowTop}>
                  <Text style={styles.name}>{user?.full_name}</Text>
                  <Text style={styles.time}>
                    {formatTime(item.lastMessageTime)}
                  </Text>
                </View>

                <Text
                  style={styles.message}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.lastMessage}
                </Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252729",
    borderRadius: 15,
    margin: scale(10),
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    padding: moderateScale(12),
    fontSize: 16,
    color: "#ffffff",
  },

  chatItem: {
    flexDirection: "row",
    marginTop: 5,
    padding: 12,
    alignItems: "center",
  },

  separator: {
    height: 1,
    backgroundColor: "#181818",
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
    fontSize: 15,
    fontWeight: "500",
    color: "#ffffff",
    textTransform: "capitalize",
  },

  time: {
    fontSize: 10,
    fontWeight: "400",
    color: "#5e636f",
  },

  message: {
    marginTop: 3,
    width: "80%",
    color: "#7a8191",
    fontSize: 10,
    fontWeight: "400",
  },

  fab: {
    position: "absolute",
    bottom: 10,
    right: 15,
    backgroundColor: "#005d4b",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});

export default ChatList;
