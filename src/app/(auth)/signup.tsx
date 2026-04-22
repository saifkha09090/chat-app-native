import ButtonComp from "@/src/components/btn/ButtonComp";
import { supabase } from "@/src/utils/supabase/supabase";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

    const { error } = await supabase.auth.signUp({
      email,
      password,
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
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
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

            <View style={styles.input_wrapper}>
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
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
          style={styles.footer}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#05aa82" />
          ) : (
            <ButtonComp
              title="Sign Up"
              onPress={handleSignup}
              style={styles.button}
            />
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={styles.loginWrapper}
          >
            <Text style={styles.description}>
              Already have an account?{" "}
              <Text style={styles.link_description}>Login</Text>
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingVertical: verticalScale(30),
    paddingHorizontal: scale(20),
  },

  header: {
    width: "100%",
  },

  heading_container: {
    marginBottom: verticalScale(30),
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
    marginTop: verticalScale(5),
  },

  input_main_container: {
    width: "100%",
  },

  input_wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    paddingVertical: verticalScale(10),
  },

  input: {
    flex: 1,
    fontSize: moderateScale(16),
    color: "#000",
  },

  horizontal_line: {
    width: "100%",
    height: 1,
    backgroundColor: "#05aa82",
  },

  footer: {
    alignItems: "center",
    width: "100%",
    marginTop: verticalScale(20),
  },

  button: {
    width: "100%",
    backgroundColor: "#00A884",
  },

  loginWrapper: {
    marginTop: verticalScale(20),
  },

  link_description: {
    color: "#05aa82",
    fontWeight: "bold",
  },
});
