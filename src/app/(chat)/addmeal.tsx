import { View, Text, ScrollView, Alert, ActivityIndicator, Pressable, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { API_URL } from '../../constants/config';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddMealScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [mealType, setMealType] = useState("Almoço");
    const [showDatePicker, setShowDatePicker] = useState(false);

    const foodData = params.foodData ? JSON.parse(params.foodData as string) : null;
    
    const [targetDate, setTargetDate] = useState(() => {
        if (params.date) {
            return new Date(params.date + "T12:00:00");
        }
        return new Date();
    });

    const displayDate = targetDate.toLocaleDateString('pt-BR');

    useEffect(() => {
        async function recoverUser() {
            try {
                const storedId = await AsyncStorage.getItem('userId');
                if (storedId) setUserId(Number(storedId));
                else Alert.alert("Erro", "Sessão expirada.");
            } catch (e) { console.error(e); }
        }
        recoverUser();
    }, []);

    const onChangeDate = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        
        if (selectedDate) {
            setTargetDate(selectedDate);
        }
    };

    async function handleSave() {
        if (!userId) return Alert.alert("Erro", "Usuário não identificado.");
        if (!foodData) return;

        setLoading(true);
        try {
            const formattedDate = targetDate.toISOString().split('T')[0];

            const payload = {
                user_id: userId,
                meal_type: mealType,
                foods: foodData.items || foodData.foods, 
                total_kcal: foodData.total_kcal,
                date: formattedDate
            };

            await axios.post(`${API_URL}/api/meals/add/`, payload);

            Alert.alert("Sucesso", `Refeição salva no dia ${displayDate}!`, [
                { text: "OK", onPress: () => router.replace("/(home)") }
            ]);

        } catch (error: any) {
            const msg = error.response?.data?.error || "Falha de conexão.";
            Alert.alert("Erro", msg);
        } finally {
            setLoading(false);
        }
    }

    if (!foodData) return null;

    return (
        <View className="flex-1 bg-white pt-12 px-5 pb-8">
            <Text className="text-2xl font-bold text-center mb-4 text-gray-800">
                Confirmar Refeição
            </Text>
            <Pressable 
                onPress={() => setShowDatePicker(true)} 
                className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex-row items-center justify-center mb-6 shadow-sm active:bg-blue-100"
            >
                <FontAwesome name="calendar" size={20} color="#2563EB" style={{ marginRight: 10 }} />
                <Text className="text-blue-800 text-lg">
                    Data: <Text className="font-bold">{displayDate}</Text> 
                </Text>
            </Pressable>

            {showDatePicker && (
                <DateTimePicker
                    value={targetDate}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                    maximumDate={new Date()} 
                />
            )}

            <View className="bg-gray-50 rounded-xl p-4 mb-4 h-1/3 border border-gray-200">
                <ScrollView showsVerticalScrollIndicator={false}>
                    {(foodData.items || foodData.foods || []).map((item: any, index: number) => (
                        <View key={index} className="border-b border-gray-200 pb-2 mb-2">
                            <Text className="font-bold text-lg text-gray-800">
                                {item.name_br || item.name}
                            </Text>
                            <Text className="text-gray-500">
                                {item.portion?.amount || item.amount}{item.portion?.unit || item.unit} 
                                {" • "} 
                                {Math.round(item.macros?.kcal || 0)} kcal
                            </Text>
                        </View>
                    ))}
                </ScrollView>
                <View className="mt-2 pt-2 border-t border-gray-300">
                    <Text className="text-right font-bold text-xl text-green-600">
                        Total: {Math.round(foodData.total_kcal)} kcal
                    </Text>
                </View>
            </View>

            <Text className="font-bold text-lg mb-3 text-gray-800">Qual refeição?</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
                {["Café da Manhã", "Lanche da Manhã", "Almoço", "Lanche da Tarde", "Jantar", "Ceia"].map((tipo) => (
                    <Pressable 
                        key={tipo}
                        onPress={() => setMealType(tipo)}
                        className={`px-4 py-2 rounded-full border ${mealType === tipo ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
                    >
                        <Text className={mealType === tipo ? 'text-white font-bold' : 'text-gray-600 font-medium'}>
                            {tipo === "Café da Manhã" ? "Café" : tipo}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <View className="mt-24 gap-3">
                {loading ? (
                    <ActivityIndicator size="large" color="#007AFF" />
                ) : (
                    <>
                        <Pressable 
                            disabled={!userId}
                            className={`${userId ? 'bg-green-600 active:bg-green-700' : 'bg-gray-400'} h-14 rounded-xl justify-center items-center shadow-sm`}
                            onPress={handleSave}
                        >
                            <Text className="text-white font-bold text-xl">ADICIONAR</Text>
                        </Pressable>

                        <Pressable 
                            className="bg-white h-12 rounded-xl justify-center items-center border border-red-200 active:bg-red-50"
                            onPress={() => router.back()}
                        >
                            <Text className="text-red-600 font-bold text-lg">CANCELAR</Text>
                        </Pressable>
                    </>
                )}
            </View>
        </View>
    );
}