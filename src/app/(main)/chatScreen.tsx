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
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const ChatScreen = () => {
  const { name, receiverId } = useLocalSearchParams();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, [receiverId]);

  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setCurrentUserId(user.id);

    const conv = await getOrCreateConversation(user.id, receiverId as string);

    setConversationId(conv.id);
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      const unsubscribe = subscribeToMessages();

      return () => {
        unsubscribe?.();
      };
    }
  }, [conversationId]);

  const getOrCreateConversation = async (userId: string, receiver: string) => {
    const userA = userId < receiver ? userId : receiver;
    const userB = userId < receiver ? receiver : userId;

    let { data: conv } = await supabase
      .from("conversations")
      .select("*")
      .eq("user1", userA)
      .eq("user2", userB)
      .maybeSingle();

    if (!conv) {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert([{ user1: userA, user2: userB }])
        .select()
        .single();

      conv = newConv;
    }

    return conv;
  };

  const fetchMessages = async () => {
    if (!conversationId) return;

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false });

    if (data) setMessages(data);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          setMessages((prev) => [payload.new, ...prev]);
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !currentUserId || !conversationId) return;

    const { error } = await supabase.from("messages").insert([
      {
        text: inputText,
        sender_id: currentUserId,
        receiver_id: receiverId,
        conversation_id: conversationId,
      },
    ]);

    if (!error) setInputText("");
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
    <View style={styles.container}>
      <Stack.Screen options={{ title: name as string }} />

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        inverted
      />

      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={verticalScale(50)}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type message..."
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              { opacity: inputText.length > 0 ? 1 : 0.6 },
            ]}
            disabled={inputText.length === 0}
            onPress={sendMessage}
          >
            <MaterialIcons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECE5DD",
  },
  listPadding: { paddingHorizontal: scale(10), paddingBottom: scale(10) },
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
  sendBtn: {
    backgroundColor: "#05aa82",
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatScreen;
