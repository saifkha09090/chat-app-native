import { getOrCreateConversation } from "@/src/services/chatServices";
import {
    fetchMessages,
    sendImageMessage,
    sendTextMessage,
} from "@/src/services/messagesService";
import { supabase } from "@/src/utils/supabase/supabase";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { getCurrentUser } from "../services/authServices";
import { uploadImage } from "../services/uploadServices";

export const useChat = (receiverId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    init();
  }, [receiverId]);

  const init = async () => {
    const user = await getCurrentUser();
    if (!user) return;

    setCurrentUserId(user.id);

    const conv = await getOrCreateConversation(user.id, receiverId);
    setConversationId(conv.id);

    const msgs = await fetchMessages(conv.id);
    setMessages(msgs);
  };

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [payload.new, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async (text: string) => {
    if (!text || !currentUserId || !conversationId) return;

    await sendTextMessage(text, currentUserId, conversationId);
  };

  const sendImage = async (useCamera = false) => {
    if (!currentUserId || !conversationId) return;
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

      const url = await uploadImage(uri, fileName, mimeType);

      const { error } = await sendImageMessage(
        url,
        currentUserId,
        conversationId,
      );
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

  return {
    messages,
    conversationId,
    currentUserId,
    sendMessage,
    sendImage,
    uploading,
  };
};
