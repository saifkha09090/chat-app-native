import ButtonComp from "@/src/components/btn/ButtonComp";
import ImagePickerModal from "@/src/components/modal/ImagePickerModal";
import { supabase } from "@/src/utils/supabase/supabase";
import { User } from "@supabase/supabase-js";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Toast from "react-native-toast-message";
import Ionicons from "react-native-vector-icons/Ionicons";

const profile = () => {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [profileImg, setProfileImg] = useState<any>();
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    let channel: any;

    const getUserAndSubscribe = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserInfo(user);

      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user?.id)
        .single();

      setProfileImg(data?.avatar_url);

      channel = supabase
        .channel("profile-changes")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user?.id}`,
          },
          (payload) => {
            setProfileImg(payload.new.avatar_url);
          },
        )
        .subscribe();
    };

    getUserAndSubscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log("Logout Failed", error.message);
    } else {
      console.log("User logout successfully");
      router.replace("/(auth)/login");
    }
  };

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

      const ext =
        asset.fileName?.split(".").pop()?.toLowerCase() ||
        asset.uri.split(".").pop()?.toLowerCase() ||
        "jpg";

      const fileName = `${userInfo?.id ?? "anonymous"}/${Date.now()}.${ext}`;

      const file = new File(asset.uri);
      const bytes = await file.bytes();

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, bytes, {
          contentType: asset.mimeType ?? `image/${ext}`,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("images").getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userInfo?.id);
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

  return (
    <View style={styles.container}>
      <View style={styles.addImg}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            router.push({
              pathname: "/(main)/imageView",
              params: { uri: profileImg },
            })
          }
        >
          <Image
            resizeMode="cover"
            source={{ uri: profileImg }}
            style={styles.profileImg}
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.profileChange}
          onPress={handleImageOption}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="add" size={20} color="#fff" />
          )}
        </TouchableOpacity>

        <ImagePickerModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onPick={(isCamera: any) => {
            setModalVisible(false);
            handlePickAndUpload(isCamera);
          }}
        />
      </View>
      <View style={styles.text_container}>
        <Text style={styles.profile_text}>
          Name: {userInfo?.user_metadata?.full_name}
        </Text>
        <Text style={styles.profile_text}>Email: {userInfo?.email}</Text>
      </View>
      <View>
        <ButtonComp
          title="Logout"
          onPress={handleLogout}
          style={{ width: scale(250), backgroundColor: "#c40101" }}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: verticalScale(20),
    backgroundColor: "#000",
  },
  addImg: {
    position: "relative",
  },
  profileImg: {
    width: moderateScale(150),
    height: moderateScale(150),
    borderRadius: 200,
  },
  profileChange: {
    backgroundColor: "#2e3a5afa",
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },
  text_container: {
    alignItems: "center",
  },
  profile_text: {
    fontSize: moderateScale(16),
    fontWeight: "400",
    color: "#fff",
  },
});

export default profile;
