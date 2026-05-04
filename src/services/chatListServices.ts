import { supabase } from "@/src/utils/supabase/supabase";

export const ChatListService = {
  async fetchConversations(userId: string) {
    const { data: myParts, error: err1 } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId);

    if (err1 || !myParts) {
      console.error(err1);
      return [];
    }

    const conversationIds = myParts.map((p) => p.conversation_id);

    if (!conversationIds.length) return [];

    const { data: participants, error: err2 } = await supabase
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
      .in("conversation_id", conversationIds);

    if (err2 || !participants) {
      console.error(err2);
      return [];
    }

    const map = new Map<string, any>();

    participants.forEach((item: any) => {
      const cid = item.conversation_id;

      if (!map.has(cid)) {
        map.set(cid, {
          conversation_id: cid,
          conversation: item.conversations,
          participants: [],
        });
      }

      map.get(cid).participants.push(item);
    });

    const result = Array.from(map.values()).map((chat: any) => {
      if (chat.conversation?.is_group) {
        return {
          conversation_id: chat.conversation_id,
          conversations: chat.conversation,
          is_group: true,
          members: chat.participants.map((p: any) => p.profiles),
        };
      }

      const otherUser = chat.participants.find(
        (p: any) => p.user_id !== userId,
      );

      return {
        userId: otherUser?.user_id || null,
        conversation_id: chat.conversation_id,
        conversations: chat.conversation,
        is_group: false,
        profiles: otherUser?.profiles || null,
      };
    });

    return result;
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
