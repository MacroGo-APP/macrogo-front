import { View, Text, Pressable, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Button } from '../../components/Button';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CardText, CardFood } from '../../components/Card';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../constants/config';

export default function Chat() {
    const router = useRouter();
    
    const { userText, date } = useLocalSearchParams(); 
    
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!userText) return;

            try {
                const response = await axios.post(`${API_URL}/api/calculate_macros/`, {
                    text: userText
                });

                setData(response.data);
            } catch (error) {
                console.log(error);
                Alert.alert("Erro", "Não foi possível calcular os macros.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userText]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-branco">
                <ActivityIndicator size="large" color="#0000ff" />
                <Text className="mt-4 text-preto text-lg">Analisando sua refeição com IA...</Text>
            </View>
        );
    }

    if (!data || !(data.foods || data.items)) {
        return (
            <View className="flex-1 justify-center items-center bg-branco">
                <Text className="text-preto text-lg">Nenhum dado encontrado.</Text>
                <Button label='Voltar' onPress={() => router.back()} />
            </View>
        );
    }

    const foodsList = data.foods || data.items || [];
    
    const totalCarbs = foodsList.reduce((acc: number, item: any) => acc + (item.macros?.carbs || 0), 0);
    const totalProtein = foodsList.reduce((acc: number, item: any) => acc + (item.macros?.protein || 0), 0);
    const totalFat = foodsList.reduce((acc: number, item: any) => acc + (item.macros?.fat || 0), 0);

    return (
        <View className="flex-col my-2 items-center justify-center gap-2 bg-white h-full">
            <CardText label='Refeição Identificada' className='w-11/12 bg-gray-50 h-4/6 border border-gray-200'>
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    
                    {foodsList.map((item: any, index: number) => (
                        <CardFood 
                            key={index} 
                            title={`${item.name || item.name_br} (${item.amount || item.portion?.amount} ${item.unit || item.portion?.unit})`}
                        >
                            {item.macros ? (
                                <View>
                                    <Text className='text-gray-500 text-sm mb-1'>
                                        🔥 {Math.round(item.macros.kcal)} kcal
                                    </Text>
                                    <View className="flex-row gap-3">
                                        <Text className='text-blue-600 font-bold text-xs'>C: {item.macros.carbs.toFixed(1)}g</Text>
                                        <Text className='text-green-600 font-bold text-xs'>P: {item.macros.protein.toFixed(1)}g</Text>
                                        <Text className='text-orange-500 font-bold text-xs'>G: {item.macros.fat.toFixed(1)}g</Text>
                                    </View>
                                    {item.is_regional && <Text className='text-orange-400 text-xs italic mt-1'>* Estimativa Regional</Text>}
                                </View>
                            ) : (
                                <Text className='text-red-500 text-sm'>Sem dados nutricionais.</Text>
                            )}
                        </CardFood>
                    ))}

                    <View className='mt-6 pt-4 border-t border-gray-200'>
                        <Text className='text-xl font-bold text-gray-800 mb-4 text-center'>Resumo da Refeição</Text>
                        
                        <View className="bg-gray-800 rounded-full py-2 px-6 self-center mb-6">
                            <Text className='text-2xl text-white font-bold'>🔥 {Math.round(data.total_kcal)} kcal</Text>
                        </View>
                        
                        <View className="flex-row justify-between w-full gap-2">
                            <View className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-3 items-center">
                                <Text className="text-2xl">🍞</Text>
                                <Text className='text-blue-800 font-extrabold text-lg mt-1'>{totalCarbs.toFixed(0)}g</Text>
                                <Text className='text-blue-400 text-xs font-bold uppercase'>Carbo</Text>
                            </View>
                            <View className="flex-1 bg-green-50 border border-green-100 rounded-xl p-3 items-center">
                                <Text className="text-2xl">🥩</Text>
                                <Text className='text-green-800 font-extrabold text-lg mt-1'>{totalProtein.toFixed(0)}g</Text>
                                <Text className='text-green-500 text-xs font-bold uppercase'>Prot</Text>
                            </View>
                            <View className="flex-1 bg-orange-50 border border-orange-100 rounded-xl p-3 items-center">
                                <Text className="text-2xl">🥑</Text>
                                <Text className='text-orange-800 font-extrabold text-lg mt-1'>{totalFat.toFixed(0)}g</Text>
                                <Text className='text-orange-400 text-xs font-bold uppercase'>Gord</Text>
                            </View>
                        </View>
                    </View>

                </ScrollView>
            </CardText>

            <View className='w-11/12 flex-col justify-center items-center pb-4 gap-3'>
                <Button label='ADICIONAR REFEIÇÃO' onPress={() => {
                    router.push({
                        pathname: "/(chat)/addmeal", 
                        params: { 
                            foodData: JSON.stringify(data),
                            date: date 
                        }
                    });
                }}/>
                
                <Pressable className='w-full h-10 justify-center items-center' onPress={() => router.back()}>
                    <Text className='text-azul font-bold text-lg'>CANCELAR</Text>
                </Pressable>
            </View>
        </View>
    );
}