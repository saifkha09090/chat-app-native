import { supabase } from "@/src/utils/supabase/supabase";

export const getOrCreateConversation = async (
  userId: string,
  receiverId: string,
) => {
  const { data: existing } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .in("user_id", [userId, receiverId]);

  if (existing?.length) {
    const grouped: Record<string, number> = {};

    existing.forEach((row: any) => {
      grouped[row.conversation_id] = (grouped[row.conversation_id] || 0) + 1;
    });

    const found = Object.keys(grouped).find((id) => grouped[id] === 2);

    if (found) {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", found)
        .single();

      return data;
    }
  }

  const { data: newConv } = await supabase
    .from("conversations")
    .insert([
      {
        is_group: false,
        created_by: userId,
      },
    ])
    .select()
    .single();

  await supabase.from("conversation_participants").insert([
    { conversation_id: newConv.id, user_id: userId },
    { conversation_id: newConv.id, user_id: receiverId },
  ]);

  return newConv;
};
