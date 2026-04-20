import React from "react";
import { Image, StyleSheet, View } from "react-native";

const profile = () => {
  return (
    <View style={styles.container}>
      <View>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
          }}
          style={styles.profileImg}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {},
  profileImg: {},
});

export default profile;
