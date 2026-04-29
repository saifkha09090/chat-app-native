import { supabase } from "@/src/utils/supabase/supabase";

export const getOrCreateConversation = async (userA: string, userB: string) => {
  const { data } = await supabase
    .from("conversations")
    .select("*")
    .eq("user1", userA)
    .eq("user2", userB)
    .maybeSingle();

  if (data) return data;

  const { data: newConv } = await supabase
    .from("conversations")
    .insert([{ user1: userA, user2: userB }])
    .select()
    .single();

  return newConv;
};

export const fetchMessages = async (conversationId: string) => {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false });

  return data;
};

export const sendMessage = async (payload: any) => {
  return await supabase.from("messages").insert([payload]);
};
