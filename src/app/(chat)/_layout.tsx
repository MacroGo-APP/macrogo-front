import "../../../global.css";
import { Stack } from "expo-router";

export default function LayoutChat() {
    return (
        <Stack screenOptions={{ contentStyle: { backgroundColor: "#FFFCF6" } }}>
            <Stack.Screen name="index" options={{ title: "Chat"}}/>
            <Stack.Screen name="addmeal" options={{ title: "Adicionar Refeição"}}/>
        </Stack>
    )
}