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

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !name) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert("Signup Failed", error.message);
    } else {
      Alert.alert("Success!", "Registration successful.", [
        { text: "OK", onPress: () => router.push("/(auth)/login") },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.heading_container}>
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.description}>
            Join us to get started with your new journey.
          </Text>
        </View>

        <View style={styles.input_main_container}>
          <View style={styles.input_wrapper}>
            <MaterialIcons name="person" size={20} color="#05aa82" />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
          </View>
          <View style={styles.horizontal_line} />

          <View
            style={[styles.input_wrapper, { marginTop: verticalScale(20) }]}
          >
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

          <View
            style={[styles.input_wrapper, { marginTop: verticalScale(20) }]}
          >
            <MaterialIcons name="lock" size={20} color="#05aa82" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.horizontal_line} />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={verticalScale(20)}
        style={styles.footer}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#05aa82" />
        ) : (
          <ButtonComp
            title="Sign Up"
            onPress={handleSignup}
            style={{ width: scale(250), backgroundColor: "#00A884" }}
          />
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={{ marginTop: verticalScale(20) }}
        >
          <Text style={styles.description}>
            Already have an account?{" "}
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

export default Signup;
