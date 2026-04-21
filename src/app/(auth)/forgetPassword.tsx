import ButtonComp from "@/src/components/btn/ButtonComp";
import { supabase } from "@/src/utils/supabase/supabase";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "expo://192.168.0.183:8081",
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert(
        "Success",
        "Password reset email has been sent. Please check your inbox.",
      );
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.heading_container}>
          <Text style={styles.heading}>Forgot Password</Text>
          <Text style={styles.description}>
            Enter your email to reset your password.
          </Text>
        </View>

        <View style={styles.input_main_container}>
          <View style={styles.input_wrapper}>
            <MaterialIcons name="email" size={20} color="#05aa82" />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.horizontal_line} />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={20}
        style={styles.footer}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#05aa82" />
        ) : (
          <ButtonComp
            title="Send Reset Link"
            onPress={handleResetPassword}
            style={{ width: scale(250), backgroundColor: "#00A884" }}
          />
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={{ marginTop: verticalScale(20) }}
        >
          <Text style={styles.description}>
            Remember your password?{" "}
            <Text style={styles.link_description}>Login</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(40),
    paddingHorizontal: scale(30),
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    gap: verticalScale(40),
  },
  heading_container: {
    gap: verticalScale(10),
  },
  heading: {
    fontSize: moderateScale(24),
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    fontSize: moderateScale(14),
    color: "#666",
  },
  input_main_container: {
    width: "100%",
  },
  input_wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    paddingBottom: verticalScale(5),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    color: "#000",
  },
  horizontal_line: {
    width: "100%",
    height: verticalScale(1),
    backgroundColor: "#05aa82",
  },
  link_description: {
    color: "#05aa82",
    fontWeight: "bold",
  },
  footer: {
    alignItems: "center",
    width: "100%",
  },
});

export default ForgotPassword;
