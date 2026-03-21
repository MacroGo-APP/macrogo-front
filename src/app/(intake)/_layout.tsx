import "../../../global.css";
import { Stack } from "expo-router";

export default function LayoutIntake() {
    return (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#FFFCF6" } }}>
            <Stack.Screen name="index"/>
        </Stack>
    )
}