import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, verticalScale } from "react-native-size-matters";
import Icon from "react-native-vector-icons/Ionicons";

const Chat = () => {
  const [text, setText] = useState("");
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.whatsapp_text}>Chat</Text>
      </View>
      <View style={styles.body}></View>
      <View style={styles.footer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type something..."
        />

        <Pressable style={styles.pressableBtn}>
          {text.trim().length > 0 && (
            <Icon name="send" size={30} color="#4F8EF7" />
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
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
    flexDirection: "row",
  },
  input: {
    height: verticalScale(60),
    margin: verticalScale(10),
    marginRight: 0,
    width: "79%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderTopStartRadius: 16,
    borderBottomStartRadius: 16,
    padding: 14,
    fontSize: moderateScale(20),
  },
  pressableBtn: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    height: verticalScale(61),
    borderEndEndRadius: 16,
    borderEndStartRadius: 16,
    marginTop: verticalScale(10),
    marginLeft: 0,
    paddingVertical: 22,
    paddingHorizontal: 17,
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
    fontSize: moderateScale(35),
    color: "#000",
  },
});

export default Chat;
