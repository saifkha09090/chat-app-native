import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, verticalScale } from "react-native-size-matters";

const Main = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.whatsapp_text}>Chat</Text>
      </View>
      <View style={styles.body}>
        <Link href={"/chat"}>go to chat</Link>
      </View>
      {/* <View style={styles.footer}>
        <Text style={styles.from_text}>from</Text>
        <Text style={styles.facebook_text}>Facebook</Text>
      </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {},
  header: {
    paddingHorizontal: verticalScale(20),
    paddingVertical: verticalScale(20),
    backgroundColor: "#008069",
  },
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
    color: "#000",
  },
  logo: {
    height: moderateScale(80),
    width: moderateScale(80),
  },
  whatsapp_text: {
    fontSize: moderateScale(20),
    color: "#fff",
  },
});

export default Main;
