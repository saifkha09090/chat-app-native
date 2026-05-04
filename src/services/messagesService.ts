import { supabase } from "@/src/utils/supabase/supabase";

export const fetchMessages = async (conversationId: string) => {
  const { data } = await supabase
    .from("messages")
    .select(
      `
      *,
      profiles:sender_id (
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(50);

  return data || [];
};

export const sendTextMessage = async (
  text: string,
  senderId: string,
  conversationId: string,
) => {
  const { data, error } = await supabase.from("messages").insert([
    {
      text,
      sender_id: senderId,
      conversation_id: conversationId,
    },
  ]);

  if (error) {
    console.error("sendTextMessage error:", error);
  }

  return { data, error };
};

export const sendImageMessage = async (
  imageUrl: string,
  senderId: string,
  conversationId: string,
) => {
  const { data, error } = await supabase.from("messages").insert([
    {
      image: imageUrl,
      sender_id: senderId,
      conversation_id: conversationId,
    },
  ]);

  if (error) {
    console.error("sendImageMessage error:", error);
  }

  return { data, error };
};
