import "../../../global.css";
import { Tabs } from "expo-router";
import { View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Octicons from '@expo/vector-icons/Octicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function LayoutTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      backBehavior="none"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#FFFCF6",
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
      tabBar={({ state, navigation }) => (
        <View
          style={{
            paddingBottom: insets.bottom,
          }}
          className="bg-branco border-t border-cinza-100 flex-row justify-around px-3 pt-3"
        >
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;

            const onPress = () => {
              if (!isFocused) {
                navigation.navigate(route.name);
              }
            };

            const icons: Record<string, React.ReactNode> = {
              index: <Octicons name="home" size={24} color="black" />,
              water: <MaterialCommunityIcons name="water-outline" size={28} color="black" />,
              user: <FontAwesome5 name="user" size={24} color="black" />,
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                className={`items-center justify-center rounded-md px-4 py-2 ${
                  isFocused ? "bg-cinza-100" : "bg-transparent"
                }`}
              >
                {icons[route.name]}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    >
      <Tabs.Screen name="water" />
      <Tabs.Screen name="index" />
      <Tabs.Screen name="user" />
    </Tabs>
  );
}
