import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { IconButton, Menu } from "react-native-paper";

export default function MenuComp() {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <View style={{ marginRight: -20 }}>
      <Menu
        style={{ paddingTop: 40 }}
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
      >
        <Menu.Item
          style={{ height: 30 }}
          onPress={() => {
            closeMenu();
            router.push("/(main)/profile");
          }}
          title="Profile"
        />
      </Menu>
    </View>
  );
}
