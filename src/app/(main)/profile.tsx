import ButtonComp from "@/src/components/btn/ButtonComp";
import ImagePickerModal from "@/src/components/modal/ImagePickerModal";
import useAuth from "@/src/hooks/useAuth";
import { useProfile } from "@/src/hooks/useProfile";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Ionicons from "react-native-vector-icons/Ionicons";

const profile = () => {
  const {
    handleImageOption,
    modalVisible,
    setModalVisible,
    uploading,
    user,
    profileImg,
    handlePickAndUpload,
  } = useProfile();
  const { handleLogout } = useAuth();

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
            source={{ uri: profileImg! }}
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
          Name: {user?.user_metadata?.full_name}
        </Text>
        <Text style={styles.profile_text}>Email: {user?.email}</Text>
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
