import ButtonComp from "@/src/components/btn/ButtonComp";
import imagePath from "@/src/constants/imagePath";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const TermsAgree = () => {
  const onPress = () => {
    router.push("/(auth)/login");
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome_text}>Welcome to WhatsApp</Text>
        <Image
          source={imagePath.welcome}
          style={styles.welcome_img}
          resizeMode="contain"
        />
        <Text style={styles.description_text}>
          Read our <Text style={styles.link_text}>Privacy Policy.</Text> Tap
          “Agree and continue” to accept the{" "}
          <Text style={styles.link_text}>Teams of Service.</Text>
        </Text>
        <View
          style={{
            width: moderateScale(300),
            marginBottom: verticalScale(100),
          }}
        >
          <ButtonComp title="AGREE AND CONTINUE" onPress={onPress} />
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.from_text}>from</Text>
        <Text style={styles.facebook_text}>FACEBOOK</Text>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(84),
    paddingHorizontal: scale(30),
  },
  header: {
    alignItems: "center",
    gap: verticalScale(30),
  },
  footer: {
    alignItems: "center",
  },
  from_text: {
    fontSize: moderateScale(12),
    color: "#867373",
  },
  facebook_text: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#000",
    letterSpacing: scale(2),
  },
  welcome_text: {
    fontSize: moderateScale(30),
    fontWeight: "bold",
    color: "#000",
    marginBottom: verticalScale(10),
  },
  welcome_img: {
    width: moderateScale(250),
    height: moderateScale(250),
    borderRadius: moderateScale(250),
  },
  description_text: {
    textAlign: "center",
    fontSize: moderateScale(13),
    color: "#000",
  },
  link_text: {
    color: "#0c42cc",
  },
});

export default TermsAgree;
