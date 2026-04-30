import { getCurrentUser } from "@/src/services/authServices";
import {
  getProfile,
  subscribeToProfile,
  updateAvatar,
} from "@/src/services/profileService";
import { supabase } from "@/src/utils/supabase/supabase";
import { User } from "@supabase/supabase-js";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { uploadImage } from "../services/uploadServices";

export const useProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let channel: any;

    const init = async () => {
      try {
        const user = await getCurrentUser();
        const currentUser = user;

        setUser(currentUser);

        if (!currentUser) return;

        const profile = await getProfile(currentUser.id);
        setProfileImg(profile?.avatar_url);

        channel = subscribeToProfile(currentUser.id, (payload) => {
          setProfileImg(payload.new.avatar_url);
        });
      } catch (err) {
        console.log("Profile hook error:", err);
      }
    };

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const handlePickAndUpload = async (useCamera = false) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: "Camera permission required",
            text2: "Please allow camera access.",
            position: "top",
            visibilityTime: 2000,
          });
          return;
        }
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: "Permission required",
            text2: "Please allow gallery access.",
            position: "top",
            visibilityTime: 2000,
          });
          return;
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: "images",
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: false,
            quality: 0.8,
          });

      if (result.canceled) return;

      const asset = result.assets[0];

      setUploading(true);

      const uri = asset.uri;

      const fileNameFromUri = uri.split("/").pop() || `file_${Date.now()}`;
      const ext = fileNameFromUri.split(".").pop()?.toLowerCase() || "jpg";

      let mimeType = asset.mimeType;

      if (!mimeType) {
        if (ext === "png") mimeType = "image/png";
        else mimeType = "image/jpeg";
      }

      const fileName = `${user?.id ?? "anonymous"}/${Date.now()}.${ext}`;

      const url = await uploadImage(uri, fileName, mimeType);

      const { data, error } = await updateAvatar(user?.id!, url);
    } catch (error) {
      console.error("Error uploading image:", error);

      const message =
        error instanceof Error ? error.message : "Something went wrong";

      Toast.show({
        type: "error",
        text1: "Error",
        text2: message,
        position: "top",
        visibilityTime: 2000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImageOption = () => {
    setModalVisible(true);
  };

  return {
    user,
    profileImg,
    setProfileImg,
    modalVisible,
    uploading,
    handleImageOption,
    setModalVisible,
    handlePickAndUpload,
  };
};
