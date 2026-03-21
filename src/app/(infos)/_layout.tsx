import "../../../global.css";
import { Stack } from "expo-router";

export default function LayoutStack() {
    return (
        <Stack screenOptions={{ contentStyle: { backgroundColor: "#FFFCF6" } }}>
            <Stack.Screen name="index" options={{ title: "Informações Pessoais"}}/>
            <Stack.Screen name="hydration" options={{ title: "Informações Hidratação"}}/>
            <Stack.Screen name="diet" options={{ title: "Informações Dieta"}}/>
        </Stack>
    )
}