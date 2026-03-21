import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Button } from '../../components/Button';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CardText, Card, CardFood } from '../../components/Card';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../constants/config';

type MealItem = {
    id: number;
    name: string;
    amount: string | number;
    unit: string;
    kcal: string | number;
    protein: string | number;
    carbs: string | number;
    fat: string | number;
};

type MealData = {
    id: number;
    name: string;
    total_kcal: string | number;
    total_protein: string | number;
    total_carbs: string | number;
    total_fat: string | number;
    items: MealItem[];
};

export default function Meal() {
    const router = useRouter();
    const { id, date } = useLocalSearchParams(); 
    const mealName = id ? decodeURIComponent(String(id)) : '';
    const dateStr = date ? String(date) : '';
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mealData, setMealData] = useState<MealData | null>(null);

    useEffect(() => {
        const fetchMealDetails = async () => {
            console.log("🔍 Buscando detalhes:", { mealName, dateStr });

            if (!mealName || !dateStr) {
                Alert.alert("Erro", "Informações da refeição não encontradas.");
                setLoading(false);
                return;
            }

            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) return;

                const response = await axios.get(`${API_URL}/api/meal/detail/`, {
                    params: { 
                        user_id: userId, 
                        date: dateStr, 
                        meal_name: mealName 
                    }
                });

                console.log("Dados recebidos:", response.data);
                setMealData(response.data);

            } catch (error) {
                console.error("❌ Erro ao carregar detalhes:", error);
                Alert.alert("Atenção", "Não foi possível carregar os itens desta refeição.");
                router.back(); 
            } finally {
                setLoading(false);
            }
        };

        fetchMealDetails();
    }, [mealName, dateStr]);

    const handleDelete = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            await axios.delete(`${API_URL}/api/meal/detail/`, {
                params: { 
                    user_id: userId, 
                    date: dateStr, 
                    meal_name: mealName 
                }
            });
            
            setOpen(false);
            router.back(); 
        } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir a refeição.");
            setOpen(false);
        }
    };

    const handleEdit = () => {
        router.push({
            pathname: "/(food)/edit", 
            params: { 
                id: mealName, 
                date: dateStr
            }
        });
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-branco">
                <ActivityIndicator size="large" color="#2C6BCA" />
            </View>
        );
    }

    if (!mealData) return null;

    return (
        <View className="flex-col h-full items-center justify-center gap-10 bg-branco pt-10">
            
            <Modal visible={open} transparent animationType='fade'>
                <Pressable className="flex-1 justify-center items-center bg-preto/70" onPress={() => setOpen(false)}>
                    <Card>
                        <View className='items-start gap-3 py-3 pr-3'>
                            <Text className='text-preto font-bold text-2xl'>Tem certeza que deseja excluir?</Text>
                            <Text className='text-preto text-2xl'>Essa ação não poderá ser desfeita</Text>
                        </View>
                        <View className='gap-5 justify-center items-center pb-5'>
                            <Button label='Sim' onPress={handleDelete}/>
                            <Pressable onPress={() => setOpen(false)}>
                                <Text className='text-vermelho font-bold text-2xl'>Não</Text>
                            </Pressable>
                        </View>
                    </Card>
                </Pressable>
            </Modal>

            <CardText label={mealData.name} className='w-11/12 border-b-hairline border-cinza-200 h-3/5'>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {mealData.items && mealData.items.length > 0 ? (
                        mealData.items.map((item: MealItem, index: number) => (
                            <CardFood 
                                key={item.id || index}
                                title={`${item.name} (${item.amount} ${item.unit}) → ${parseInt(String(item.kcal))} kcal`}
                            >
                                <Text className='text-preto text-xl'>Carboidratos: {parseInt(String(item.carbs))} g</Text>
                                <Text className='text-preto text-xl'>Proteínas: {parseInt(String(item.protein))} g</Text>
                                <Text className='text-preto text-xl'>Gorduras: {parseInt(String(item.fat))} g</Text>
                            </CardFood>
                        ))
                    ) : (
                        <Text className="text-cinza-200 text-center mt-4">Nenhum item nesta refeição.</Text>
                    )}
                </ScrollView>

                <View className="mt-4 pt-4 border-t border-cinza-100">
                    <Text className='text-xl font-bold text-preto'>Total aproximado:</Text>
                    <Text className='text-xl text-preto'>Calorias: {parseInt(String(mealData.total_kcal))} kcal</Text>
                    <View className="flex-row gap-4 mt-1">
                        <Text className='text-sm text-cinza-200'>C: {parseInt(String(mealData.total_carbs))}g</Text>
                        <Text className='text-sm text-cinza-200'>P: {parseInt(String(mealData.total_protein))}g</Text>
                        <Text className='text-sm text-cinza-200'>G: {parseInt(String(mealData.total_fat))}g</Text>
                    </View>
                </View>
            </CardText>

            <View className='w-11/12 gap-2 mb-10'>
                <Button label="Editar" onPress={handleEdit}/>
                
                <Pressable className='items-center justify-center h-14' onPress={() => setOpen(true)}>
                    <Text className='text-vermelho font-bold text-xl'>Excluir</Text>
                </Pressable>
            </View>
        </View>
    );
}