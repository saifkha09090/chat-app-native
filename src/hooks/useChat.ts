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

export const useChat = (
  receiverId: string | null,
  existingConversationId?: string,
) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    init();
  }, [receiverId, existingConversationId]);

  const init = async () => {
    const user = await getCurrentUser();
    if (!user) return;

    setCurrentUserId(user.id);

    if (existingConversationId) {
      setConversationId(existingConversationId);

      const msgs = await fetchMessages(existingConversationId);
      console.log(msgs);

      setMessages(msgs);
      return;
    }

    if (receiverId) {
      const conv = await getOrCreateConversation(user.id, receiverId);
      setConversationId(conv.id);

      const msgs = await fetchMessages(conv.id);

      setMessages(msgs);
    }
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
        if (status !== "granted") return;
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: "images",
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            quality: 0.8,
          });

      if (result.canceled) return;

      const asset = result.assets[0];

      setUploading(true);

      const uri = asset.uri;
      const fileName = `${currentUserId}/${Date.now()}.jpg`;

      const url = await uploadImage(uri, fileName, "image/jpeg");

      await sendImageMessage(url, currentUserId, conversationId);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
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
