import { supabase } from "@/src/utils/supabase/supabase";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const ChatScreen = () => {
  const { name, receiverId } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const setupUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    setupUser();

    fetchMessages();

    const channel = supabase
      .channel(`chat_${receiverId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMessage = payload.new;
          setMessages((prev) => [newMessage, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [receiverId]);

  const fetchMessages = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`,
      )
      .order("created_at", { ascending: false });

    if (!error && data) setMessages(data);
  };

  const sendMessage = async () => {
    if (inputText.trim() === "" || !currentUserId) return;

    let { data: conversation, error: fetchError } = await supabase
      .from("conversations")
      .select("*")
      .or(
        `and(user1.eq.${currentUserId},user2.eq.${receiverId}),and(user1.eq.${receiverId},user2.eq.${currentUserId})`,
      )
      .maybeSingle();

    if (fetchError) {
      console.log("Fetch Error:", fetchError.message);
      return;
    }

    if (!conversation) {
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert([
          {
            user1: currentUserId,
            user2: receiverId,
          },
        ])
        .select()
        .single();

      if (convError) {
        console.log("Conversation Error:", convError.message);
        return;
      }

      conversation = newConv;
    }

    const newMessage = {
      text: inputText,
      sender_id: currentUserId,
      receiver_id: receiverId,
      conversation_id: conversation.id,
    };

    const { error } = await supabase.from("messages").insert([newMessage]);

    if (error) {
      console.log("Send Error:", error.message);
    } else {
      setInputText("");
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender_id === currentUserId;

    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timeText}>
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerTitle: (name as string) || "Chat",
        }}
      />

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listPadding}
        inverted
      />

      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={70}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { opacity: inputText.length > 0 ? 1 : 0.6 },
            ]}
            onPress={sendMessage}
            disabled={inputText.length === 0}
          >
            <MaterialIcons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ece5dd" },
  listPadding: { padding: scale(10) },
  messageBubble: {
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    marginVertical: verticalScale(5),
    maxWidth: "80%",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#dcf8c6",
    borderTopRightRadius: 0,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderTopLeftRadius: 0,
  },
  messageText: { fontSize: moderateScale(16), color: "#000" },
  timeText: {
    fontSize: moderateScale(10),
    color: "#888",
    textAlign: "right",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: scale(10),
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: moderateScale(25),
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(10),
    marginRight: scale(10),
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#05aa82",
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatScreen;
