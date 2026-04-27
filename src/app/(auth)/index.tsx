import imagePath from "@/src/constants/imagePath";
import { router } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, verticalScale } from "react-native-size-matters";

const Auth = () => {
  useEffect(() => {
    const navigate = () => {
      router.push("/(auth)/terms_agree");
    };

    const timeout = setTimeout(navigate, 3000);
    return () => clearTimeout(timeout);
  }, [router]);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}></View>
      <View style={styles.body}>
        <Image
          source={imagePath.logo}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.whatsapp_text}>Chat app</Text>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(50),
    backgroundColor: "#111B21",
  },
  header: {},
  body: {
    alignItems: "center",
    gap: verticalScale(14),
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
    color: "#fff",
  },
  logo: {
    height: moderateScale(80),
    width: moderateScale(80),
  },
  whatsapp_text: {
    fontSize: moderateScale(35),
    color: "#fff",
  },
});

export default Auth;
