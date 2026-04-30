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
  const {
    filteredChats,
    handleSearch,
    currentUserId,
    search,
    formatTime,
    handlePressChat,
  } = useChatList();

  const getOtherUser = (item: any) => {
    return item.profiles || null;
  };

  const getReceiverId = (item: any) => {
    return item.user_id || null;
  };

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
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const user = getOtherUser(item);
          const receiverId = getReceiverId(item);
          // console.log(item);

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.chatItem}
              onPress={() => handlePressChat(user, receiverId)}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: "/(main)/imageView",
                    params: {
                      uri: item.profiles.avatar_url,
                    },
                  })
                }
              >
                <Image
                  source={{
                    uri: item.profiles.avatar_url,
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
