import ImagePickerModal from "@/src/components/modal/ImagePickerModal";
import { useChat } from "@/src/hooks/useChat";
import { useKeyboard } from "@/src/hooks/useKeyboard";
import { useProfile } from "@/src/hooks/useProfile";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const ChatScreen = () => {
  const { name, receiverId } = useLocalSearchParams();
  const keyboardHeight = useKeyboard();
  const { modalVisible, setModalVisible, handleImageOption } = useProfile();

  const { messages, currentUserId, sendMessage, sendImage, uploading } =
    useChat(receiverId as string);

  const [inputText, setInputText] = useState("");

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender_id === currentUserId;

    return (
      <>
        {!item.text ? (
          <View
            style={[
              styles.messageBubbleImg,
              isMe ? styles.myMessage : styles.otherMessage,
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: "/(main)/imageView",
                  params: { uri: item.image },
                })
              }
            >
              <Image source={{ uri: item.image }} style={styles.image} />
            </TouchableOpacity>
            <Text style={styles.timeTextImg}>
              {new Date(item.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.messageBubble,
              isMe ? styles.myMessage : styles.otherMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timeText}>
              {new Date(item.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        )}
      </>
    );
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1 }} edges={[]}>
        <Stack.Screen options={{ title: name as string }} />

        <ImageBackground
          style={{ flex: 1 }}
          source={{
            uri: "https://i.pinimg.com/564x/d3/6b/cc/d36bcceceaa1d390489ec70d93154311.jpg",
          }}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <FlatList
              data={messages}
              inverted
              contentContainerStyle={styles.listPadding}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
            />

            <View
              style={[styles.inputContainer, { marginBottom: keyboardHeight }]}
            >
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type message..."
                placeholderTextColor="#96979d"
              />

              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.85}
                onPress={handleImageOption}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <FontAwesome name="camera" size={24} color="#fff" />
                )}
              </TouchableOpacity>

              <ImagePickerModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onPick={(isCamera: any) => {
                  setModalVisible(false);
                  sendImage(isCamera);
                }}
              />

              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  { opacity: inputText.length > 0 ? 1 : 0.6 },
                ]}
                disabled={inputText.length === 0}
                onPress={() => {
                  sendMessage(inputText);
                  setInputText("");
                }}
              >
                <MaterialIcons name="send" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    fontFamily: "System",
  },
  listPadding: { paddingHorizontal: scale(10), paddingBottom: scale(10) },
  messageBubble: {
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    marginVertical: verticalScale(5),
    maxWidth: "80%",
    // elevation: 1,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.37)",
  },
  messageBubbleImg: {
    padding: moderateScale(4),
    borderRadius: moderateScale(10),
    marginVertical: verticalScale(5),
    maxWidth: "80%",
    position: "relative",
    elevation: 1,
    shadowColor: "#fff",
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#00493b",
    borderTopRightRadius: 0,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#252729",
    borderTopLeftRadius: 0,
  },
  messageText: { fontSize: moderateScale(12), color: "#fff" },
  timeText: {
    fontSize: moderateScale(8),
    color: "#888",
    textAlign: "right",
    marginTop: 6,
  },
  timeTextImg: {
    position: "absolute",
    fontSize: 8,
    bottom: 5,
    right: 8,
    color: "#fff",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: moderateScale(10),
  },
  inputContainer: {
    flexDirection: "row",
    padding: scale(10),
    paddingTop: 0,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#252729",
    color: "#ffffff",
    borderRadius: moderateScale(25),
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(10),
    marginRight: scale(5),
    maxHeight: 100,
  },
  button: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sendBtn: {
    backgroundColor: "#005d4b",
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatScreen;
