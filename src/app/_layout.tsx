import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { DateProvider } from "../../context/DateContext"; 
import { SignUpProvider } from "../../context/SignUpContext"; 
import "../../global.css"; 

export default function RootLayout() {
  return (
    <SignUpProvider>
      <DateProvider>
        
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(home)" />
          <Stack.Screen name="(chat)" />
          <Stack.Screen name="(food)" />
          <Stack.Screen name="(intake)" />
          <Stack.Screen name="(infos)" />
          <Stack.Screen name="(diet)" />
          <Stack.Screen name="(registers)" />

        </Stack>

      </DateProvider>
    </SignUpProvider>
  );
}