import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const ButtonComp = ({ title, onPress, style }: any) => {
  return (
    <TouchableOpacity
      style={[styles.btn_container, style]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text style={styles.btn_text}>{title}</Text>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  btn_container: {
    backgroundColor: "#00A884",
    width: "100%",
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(10),
    borderRadius: moderateScale(4),
    alignItems: "center",
  },
  btn_text: {
    fontSize: moderateScale(14),
    color: "white",
  },
});

export default ButtonComp;
