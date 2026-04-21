import ButtonComp from "@/src/components/btn/ButtonComp";
import { supabase } from "@/src/utils/supabase/supabase";
import { User } from "@supabase/supabase-js";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const profile = () => {
  const [userInfo, setUserInfo] = useState<User | null>(null);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserInfo(user);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log("Logout Failed", error.message);
    } else {
      console.log("User logout successfully");
      router.replace("/(auth)/login");
    }
  };
  return (
    <View style={styles.container}>
      <View>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
          }}
          style={styles.profileImg}
        />
        <View style={styles.text_container}>
          <Text style={styles.profile_text}>
            Name: {userInfo?.user_metadata?.full_name}
          </Text>
          <Text style={styles.profile_text}>Email: {userInfo?.email}</Text>
        </View>
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
  },
  profileImg: {
    width: moderateScale(150),
    height: moderateScale(150),
    borderRadius: 25,
  },
  text_container: {
    alignItems: "center",
  },
  profile_text: {
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
});

export default profile;
