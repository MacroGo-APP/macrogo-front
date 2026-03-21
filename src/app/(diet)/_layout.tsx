import "../../../global.css";
import { Stack } from "expo-router";

export default function LayoutDiet() {
    return (
        <Stack screenOptions={{ contentStyle: { backgroundColor: "#FFFCF6" } }}>
            <Stack.Screen name="index" options={{ title: "Seu Treino"}}/>
            <Stack.Screen name="train" options={{ title: "Seu Treino"}}/>
            <Stack.Screen name="cardio" options={{ title: "Seu Treino"}}/>
            <Stack.Screen name="regulation" options={{ title: "Regulaação de MacroNutrientes"}}/>
        </Stack>
    )
}