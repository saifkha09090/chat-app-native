import ButtonComp from "@/src/components/btn/ButtonComp";
import { supabase } from "@/src/utils/supabase/supabase";
import { User } from "@supabase/supabase-js";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Ionicons from "react-native-vector-icons/Ionicons";

const profile = () => {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [profileImg, setProfileImg] = useState<any>();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
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
    };

    getUser();
  }, [profileImg]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log("Logout Failed", error.message);
    } else {
      console.log("User logout successfully");
      router.replace("/(auth)/login");
    }
  };

  const handlePickAndUpload = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow access to upload images.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: false,
        allowsMultipleSelection: false,
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

      const { error: msgError } = await supabase
        .from("profiles")
        .update([
          {
            avatar_url: publicUrl,
          },
        ])
        .eq("id", userInfo?.id);

      if (msgError) {
        console.log("Message insert error:", msgError);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      Alert.alert("Error", message);
    } finally {
      setUploading(false);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.addImg}>
        <Image
          resizeMode="cover"
          source={{
            uri: profileImg,
          }}
          style={styles.profileImg}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.profileChange}
          onPress={handlePickAndUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="add" size={20} color="#fff" />
          )}
        </TouchableOpacity>
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
    backgroundColor: "#292F3F",
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
    backgroundColor: "#292f3ffa",
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
