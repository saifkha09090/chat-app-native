import { supabase } from "@/src/utils/supabase/supabase";

export const GroupService = {
  async createGroup(userId: string, groupName: string, memberIds: string[]) {
    const { data: group, error } = await supabase
      .from("conversations")
      .insert([
        {
          name: groupName,
          is_group: true,
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return null;
    }

    const participants = [userId, ...memberIds].map((id) => ({
      conversation_id: group.id,
      user_id: id,
    }));

    const { error: pError } = await supabase
      .from("conversation_participants")
      .insert(participants);

    if (pError) {
      console.error(pError);
      return null;
    }

    return group;
  },
};
