import ImagePickerModal from "@/src/components/modal/ImagePickerModal";
import { supabase } from "@/src/utils/supabase/supabase";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Toast from "react-native-toast-message";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const ChatScreen = () => {
  const { name, receiverId } = useLocalSearchParams();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    init();
  }, [receiverId]);

  useEffect(() => {
    const showKey = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideKey = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showKey.remove();
      hideKey.remove();
    };
  }, []);

  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setCurrentUserId(user.id);

    const userA = user.id < receiverId ? user.id : receiverId;
    const userB = user.id < receiverId ? receiverId : user.id;

    const [convResult, messagesResult] = await Promise.all([
      supabase
        .from("conversations")
        .select("*")
        .eq("user1", userA)
        .eq("user2", userB)
        .maybeSingle(),

      null,
    ]);

    let conv = convResult.data;

    if (!conv) {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert([{ user1: userA, user2: userB }])
        .select()
        .single();

      conv = newConv;
    }

    setConversationId(conv.id);
    fetchMessages(conv.id);
  };

  useEffect(() => {
    if (!conversationId) return;

    fetchMessages(conversationId);
    const unsubscribe = subscribeToMessages();

    return () => {
      unsubscribe?.();
    };
  }, [conversationId]);

  const fetchMessages = async (convId: any) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: false })
      .limit(50);

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
        conversation_id: conversationId,
      },
    ]);

    if (!error) setInputText("");
  };

  const handlePickAndUpload = async (useCamera = false) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: "Camera permission required",
            text2: "Please allow camera access.",
            position: "top",
            visibilityTime: 2000,
          });
          return;
        }
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: "Permission required",
            text2: "Please allow gallery access.",
            position: "top",
            visibilityTime: 2000,
          });
          return;
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: "images",
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: false,
            quality: 0.8,
          });

      if (result.canceled) return;

      const asset = result.assets[0];

      setUploading(true);

      const uri = asset.uri;

      const fileNameFromUri = uri.split("/").pop() || `file_${Date.now()}`;
      const ext = fileNameFromUri.split(".").pop()?.toLowerCase() || "jpg";

      let mimeType = asset.mimeType;

      if (!mimeType) {
        if (ext === "gif") mimeType = "image/gif";
        else if (ext === "png") mimeType = "image/png";
        else mimeType = "image/jpeg";
      }

      const fileName = `${currentUserId ?? "anonymous"}/${Date.now()}.${ext}`;

      const response = await fetch(asset.uri);
      const arrayBuffer = await response.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, arrayBuffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadError) {
        console.log("Upload error:", uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage.from("images").getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      const { error: msgError } = await supabase.from("messages").insert([
        {
          image: publicUrl,
          sender_id: currentUserId,
          conversation_id: conversationId,
        },
      ]);

      if (msgError) {
        console.log("Message insert error:", msgError);
      }
    } catch (error) {
      console.error("Upload error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error instanceof Error ? error.message : "Something went wrong",
        position: "top",
        visibilityTime: 2000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImageOption = () => {
    setModalVisible(true);
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
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: "/(main)/imageView",
                  params: { uri: item.image },
                })
              }
            >
              <Image source={{ uri: item.image }} style={styles.image} />
            </TouchableOpacity>
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
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: name as string,
        }}
      />
      <ImageBackground
        style={{ flex: 1 }}
        source={{
          uri: "https://i.pinimg.com/564x/d3/6b/cc/d36bcceceaa1d390489ec70d93154311.jpg",
        }}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listPadding}
            inverted
          />

          <View
            style={[styles.inputContainer, { marginBottom: keyboardHeight }]}
          >
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
              onPress={handleImageOption}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <FontAwesome name="camera" size={24} color="#fff" />
              )}
            </TouchableOpacity>

            <ImagePickerModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onPick={(isCamera: any) => {
                setModalVisible(false);
                handlePickAndUpload(isCamera);
              }}
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
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    fontFamily: "System",
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.37)",
  },
  messageBubbleImg: {
    padding: moderateScale(4),
    borderRadius: moderateScale(10),
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
    backgroundColor: "#00493b",
    borderTopRightRadius: 0,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#252729",
    borderTopLeftRadius: 0,
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
    fontSize: 8,
    bottom: 5,
    right: 8,
    color: "#fff",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: moderateScale(10),
  },
  inputContainer: {
    flexDirection: "row",
    padding: scale(10),
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#252729",
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
    backgroundColor: "#005d4b",
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatScreen;
