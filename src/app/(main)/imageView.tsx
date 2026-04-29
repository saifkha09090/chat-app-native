import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import Ionicons from "react-native-vector-icons/Ionicons";

const ImageView = () => {
  const { uri } = useLocalSearchParams();

  const images = [
    {
      url: uri as string,
    },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>

      <ImageViewer
        imageUrls={images}
        enableSwipeDown={true}
        onSwipeDown={() => router.back()}
        enableImageZoom={true}
        maxOverflow={300}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
});

export default ImageView;
