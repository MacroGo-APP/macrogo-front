import "../../../global.css";
import { Stack } from "expo-router";

export default function LayoutFood() {
    return (
        <Stack screenOptions={{ contentStyle: { backgroundColor: "#FFFCF6" } }}>
            <Stack.Screen name="index" options={{ title: "Refeições"}}/>
            <Stack.Screen name="[id]" options={{ title: "Refeição"}}/>
            <Stack.Screen name="edit" options={{ title: "Editar"}}/>
        </Stack>
    )
}