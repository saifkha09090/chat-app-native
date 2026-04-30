import ButtonComp from "@/src/components/btn/ButtonComp";
import useAuth from "@/src/hooks/useAuth";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
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
  // const [email, setEmail] = useState("");
  // const [loading, setLoading] = useState(false);

  // const handleResetPassword = async () => {
  //   if (!email) {
  //     Toast.show({
  //       type: "error",
  //       text1: "Error",
  //       text2: "Please enter your email.",
  //       position: "bottom",
  //       keyboardOffset: 100,
  //       visibilityTime: 2000,
  //     });
  //     return;
  //   }

  //   setLoading(true);

  //   const { error } = await supabase.auth.resetPasswordForEmail(email, {
  //     redirectTo: "expo://192.168.0.183:8081",
  //   });

  //   setLoading(false);

  //   if (error) {
  //     Toast.show({
  //       type: "error",
  //       text1: "Error",
  //       text2: error.message,
  //       position: "bottom",
  //       keyboardOffset: 100,
  //       visibilityTime: 2000,
  //     });
  //   } else {
  //     Toast.show({
  //       type: "success",
  //       text1: "Password reset email has been sent. Please check your inbox.",
  //       position: "top",
  //       visibilityTime: 2000,
  //       onHide() {
  //         router.back();
  //       },
  //     });
  //   }
  // };

  const { email, handleResetPassword, loading, setEmail } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View></View>
      <View style={styles.header}>
        <View style={styles.heading_container}>
          <Text style={styles.heading}>Forgot Password</Text>
          <Text style={styles.description}>
            Enter your email to reset your password.
          </Text>
        </View>

        <View style={styles.input_main_container}>
          <View style={styles.input_wrapper}>
            <MaterialIcons name="email" size={20} color="#017a62" />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#fff"
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
          <ActivityIndicator size="large" color="#017a62" />
        ) : (
          <ButtonComp
            title="Send Reset Link"
            onPress={handleResetPassword}
            style={{ width: scale(250), backgroundColor: "#046350" }}
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
    backgroundColor: "#000",
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
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    fontSize: moderateScale(14),
    color: "#ffefef",
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
    color: "#fff",
  },
  horizontal_line: {
    width: "100%",
    height: verticalScale(1),
    backgroundColor: "#017a62",
  },
  link_description: {
    color: "#017a62",
    fontWeight: "bold",
  },
  footer: {
    alignItems: "center",
    width: "100%",
  },
});

export default ForgotPassword;
