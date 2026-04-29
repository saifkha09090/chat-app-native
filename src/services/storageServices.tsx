import { supabase } from "@/src/utils/supabase/supabase";

export const uploadImage = async (
  fileName: string,
  buffer: ArrayBuffer,
  type: string,
) => {
  const { error } = await supabase.storage
    .from("images")
    .upload(fileName, buffer, { contentType: type });

  if (error) throw error;

  const { data } = supabase.storage.from("images").getPublicUrl(fileName);

  return data.publicUrl;
};
