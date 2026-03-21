import "../../../global.css";
import { Stack } from "expo-router";

import { SignUpProvider } from "../../../context/SignUpContext";

export default function LayoutRegister() {
    return (
        <SignUpProvider>
            <Stack screenOptions={{ contentStyle: { backgroundColor: "#FFFCF6" } }}>
                <Stack.Screen options={{ title: "Cadastro"}} name="index"/>
                <Stack.Screen options={{ title: "Sobre você"}} name="aboutyou"/>
                <Stack.Screen options={{ title: "Seu treino"}} name="workout"/>
                <Stack.Screen options={{ title: "Seu treino"}} name="workout2"/>
                <Stack.Screen options={{ title: "Seu treino"}} name="workout3"/>
                <Stack.Screen options={{ title: "Regulação de Macronutrientes"}} name="regulation"/>
            </Stack>
        </SignUpProvider>
    )
}