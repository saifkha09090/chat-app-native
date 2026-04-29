import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale, verticalScale } from "react-native-size-matters";

const OtherUserProfile = () => {
  const { name, uri, email } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: typeof uri === "string" ? uri : uri?.[0],
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{name || "Unknown User"}</Text>
        <Text style={styles.email}>{email || "No email available"}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.actionBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="chatbubble" size={22} color="#019b7c" />
          <Text style={styles.actionText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} style={styles.actionBtn}>
          <Ionicons name="call" size={22} color="#019b7c" />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} style={styles.actionBtn}>
          <Ionicons name="videocam" size={22} color="#019b7c" />
          <Text style={styles.actionText}>Video</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>About</Text>
        <Text style={styles.infoText}>
          Hey there! I am using WhatsApp clone 😄
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default OtherUserProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
  },

  header: {
    alignItems: "center",
    marginTop: verticalScale(20),
  },

  avatar: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    marginBottom: verticalScale(10),
  },

  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },

  email: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 4,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: verticalScale(30),
    paddingHorizontal: scale(20),
  },

  actionBtn: {
    alignItems: "center",
    gap: 5,
  },

  actionText: {
    color: "#019b7c",
    fontSize: 12,
    marginTop: 4,
  },

  infoBox: {
    width: "90%",
    marginTop: verticalScale(30),
    padding: 15,
    backgroundColor: "#1F2C34",
    borderRadius: 10,
  },

  infoTitle: {
    color: "#019b7c",
    fontWeight: "bold",
    marginBottom: 5,
  },

  infoText: {
    color: "#ccc",
  },
});
