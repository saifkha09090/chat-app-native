import { supabase } from "@/src/utils/supabase/supabase";

export const uploadImage = async (
  uri: string,
  fileName: string,
  mimeType: string,
) => {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from("images")
    .upload(fileName, arrayBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from("images").getPublicUrl(fileName);

  return data.publicUrl;
};
