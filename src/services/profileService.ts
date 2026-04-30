import { supabase } from "@/src/utils/supabase/supabase";

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateAvatar = async (userId: string, url: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", userId);

  if (error) throw error;
  return { data, error };
};

export const subscribeToProfile = (
  userId: string,
  callback: (payload: any) => void,
) => {
  const channel = supabase
    .channel("profile-changes")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "profiles",
        filter: `id=eq.${userId}`,
      },
      callback,
    )
    .subscribe();

  return channel;
};
