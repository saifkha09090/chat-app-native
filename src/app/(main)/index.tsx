import { useChatList } from "@/src/hooks/useChatList";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
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
  const { filteredChats, handleSearch, search, formatTime, handlePressChat } =
    useChatList();

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={24} color="#666" />
        <TextInput
          placeholder="Search by name..."
          placeholderTextColor="#aaa"
          style={styles.input}
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.conversation_id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const isGroup = item.is_group;

          const name = isGroup
            ? item.conversations?.name
            : item.profiles?.full_name;

          const avatar = isGroup
            ? "https://cdn-icons-png.flaticon.com/512/6387/6387945.png"
            : item.profiles?.avatar_url;

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.chatItem}
              onPress={() => handlePressChat(item)}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  avatar &&
                  router.push({
                    pathname: "/(main)/imageView",
                    params: { uri: avatar },
                  })
                }
              >
                <Image source={{ uri: avatar }} style={styles.avatar} />
              </TouchableOpacity>

              <View style={styles.chatInfo}>
                <View style={styles.rowTop}>
                  <Text style={styles.name}>{name || "Chat"}</Text>

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
