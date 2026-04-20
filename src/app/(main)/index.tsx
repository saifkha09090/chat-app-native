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
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale } from "react-native-size-matters";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const ChatList = () => {
  const [recentChats, setRecentChats] = useState<any[]>([]);

  useEffect(() => {
    fetchRecentChats();
  }, []);

  const fetchRecentChats = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        text,
        created_at,
        sender_id,
        receiver_id,
        profiles!messages_receiver_id_fkey(full_name, email)
      `,
      )
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRecentChats(data);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={recentChats}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatContainer}
            onPress={() =>
              router.push({
                pathname: "/(main)/chatScreen",
                params: {
                  name: item.profiles?.full_name,
                  receiverId: item.receiver_id,
                },
              })
            }
          >
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
              }}
              style={styles.profileImg}
            />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>
                {item.profiles?.full_name || "User"}
              </Text>
              <Text style={styles.msgText} numberOfLines={1}>
                {item.text}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(main)/userSearch")}
      >
        <MaterialIcons name="add-comment" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  chatContainer: {
    flexDirection: "row",
    padding: scale(15),
    alignItems: "center",
  },
  profileImg: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: 25,
  },
  textContainer: { flex: 1, marginLeft: scale(15) },
  nameText: { fontSize: 16, fontWeight: "bold" },
  msgText: { color: "#666" },
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
