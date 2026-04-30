import { supabase } from "@/src/utils/supabase/supabase";

export const getOrCreateConversation = async (
  userId: string,
  receiverId: string,
) => {
  const userA = userId < receiverId ? userId : receiverId;
  const userB = userId < receiverId ? receiverId : userId;

  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("user1", userA)
    .eq("user2", userB)
    .maybeSingle();

  if (existing) return existing;

  const { data: newConv } = await supabase
    .from("conversations")
    .insert([{ user1: userA, user2: userB }])
    .select()
    .single();

  return newConv;
};
