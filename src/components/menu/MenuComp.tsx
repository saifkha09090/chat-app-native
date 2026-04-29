import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { IconButton, Menu, Portal } from "react-native-paper";
import CreateGroupModal from "../modal/CreateGroupModal";

export default function MenuComp() {
  const [visible, setVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <View style={{ marginRight: -20 }}>
      <Menu
        style={{ marginTop: 40, width: "50%" }}
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <IconButton
            icon="dots-vertical"
            size={24}
            onPress={openMenu}
            iconColor="#fff"
          />
        }
        contentStyle={{ backgroundColor: "#0f0f0f" }}
      >
        <Menu.Item
          style={{ height: 30 }}
          onPress={() => {
            closeMenu();
            router.push("/(main)/profile");
          }}
          title="Profile"
        />
        <Menu.Item
          style={{ height: 30, marginTop: 15 }}
          onPress={() => {
            closeMenu();
            setModalVisible(true);
          }}
          title="New Group"
        />
      </Menu>
      <Portal>
        <CreateGroupModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      </Portal>
    </View>
  );
}
