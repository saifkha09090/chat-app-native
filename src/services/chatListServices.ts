import { supabase } from "@/src/utils/supabase/supabase";

export const ChatListService = {
  async fetchConversations(userId: string) {
    const { data: ids } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId);

    const { data } = await supabase
      .from("conversation_participants")
      .select(
        `
          conversation_id,
          user_id,
          profiles (
                id,
                full_name,
                avatar_url
              ),
          conversations (
            id,
            name,
            is_group,
            created_at
          )
        `,
      )
      .in("conversation_id", ids?.map((i) => i.conversation_id)!)
      .neq("user_id", userId);

    return data || [];
  },

  async getLastMessage(conversationId: string) {
    const { data } = await supabase
      .from("messages")
      .select("text, image, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return data;
  },
};
