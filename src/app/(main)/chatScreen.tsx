import { supabase } from "@/src/utils/supabase/supabase";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const ChatScreen = () => {
  const { name, receiverId } = useLocalSearchParams();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handlePickAndUpload = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow access to upload images.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: false,
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      setUploading(true);

      const ext =
        asset.fileName?.split(".").pop()?.toLowerCase() ||
        asset.uri.split(".").pop()?.toLowerCase() ||
        "jpg";

      const fileName = `${currentUserId ?? "anonymous"}/${Date.now()}.${ext}`;

      const file = new File(asset.uri);
      const bytes = await file.bytes();

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, bytes, {
          contentType: asset.mimeType ?? `image/${ext}`,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("images").getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      const { error: msgError } = await supabase.from("messages").insert([
        {
          image: publicUrl,
          sender_id: currentUserId,
          receiver_id: receiverId,
          conversation_id: conversationId,
        },
      ]);

      if (msgError) {
        console.log("Message insert error:", msgError);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      Alert.alert("Error", message);
    } finally {
      setUploading(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender_id === currentUserId;

    return (
      <>
        {!item.text ? (
          <View
            style={[
              styles.messageBubbleImg,
              isMe ? styles.myMessage : styles.otherMessage,
            ]}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.timeTextImg}>
              {new Date(item.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        ) : (
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
        )}
      </>
    );
  };
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{ title: name as string, headerBackTitleStyle: styles.stack }}
      />
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        inverted
      />

      <KeyboardAvoidingView
        behavior={"padding"}
        keyboardVerticalOffset={verticalScale(70)}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type message..."
            placeholderTextColor="#96979d"
          />
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={handlePickAndUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <FontAwesome name="camera" size={24} color="#fff" />
            )}
          </TouchableOpacity>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#292F3F",
    fontFamily: "System",
  },
  stack: {
    textTransform: "capitalize",
  },
  listPadding: { paddingHorizontal: scale(10), paddingBottom: scale(10) },
  messageBubble: {
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    marginVertical: verticalScale(5),
    maxWidth: "80%",
    elevation: 1,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  messageBubbleImg: {
    marginVertical: verticalScale(5),
    maxWidth: "80%",
    position: "relative",
    elevation: 1,
    shadowColor: "#fff",
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#272a35",
    borderTopRightRadius: 0,
    color: "#5d5f68",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#373e4e",
    borderTopLeftRadius: 0,
    color: "#828690",
  },
  messageText: { fontSize: moderateScale(12), color: "#fff" },
  timeText: {
    fontSize: moderateScale(8),
    color: "#888",
    textAlign: "right",
    marginTop: 6,
  },
  timeTextImg: {
    position: "absolute",
    bottom: 5,
    right: 5,
    color: "#fff",
  },
  image: {
    width: 200,
    height: 200,
    // borderRadius: moderateScale(10),
  },
  inputContainer: {
    flexDirection: "row",
    padding: scale(10),
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#212632",
    color: "#ffffff",
    borderRadius: moderateScale(25),
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(10),
    marginRight: scale(5),
    maxHeight: 100,
  },
  button: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sendBtn: {
    backgroundColor: "#837dff",
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatScreen;
