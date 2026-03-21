import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, Pressable, Modal, ActivityIndicator, Alert, 
    ScrollView, TouchableOpacity 
} from 'react-native';
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

export default function MealEdit() {
    const router = useRouter();
    const { id: mealName, date } = useLocalSearchParams(); 
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<MealItem[]>([]);
    const [deletedIds, setDeletedIds] = useState<number[]>([]);
    const [mealInfo, setMealInfo] = useState({ name: '', total_kcal: 0 });

    useEffect(() => {
        const fetchMealDetails = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) return;

                const response = await axios.get(`${API_URL}/api/meal/detail/`, {
                    params: { 
                        user_id: userId, 
                        date: date, 
                        meal_name: mealName 
                    }
                });

                setItems(response.data.items || []);
                setMealInfo({
                    name: response.data.name,
                    total_kcal: response.data.total_kcal
                });

            } catch (error) {
                console.error("Erro ao carregar:", error);
                Alert.alert("Erro", "Não foi possível carregar a refeição.");
                router.back();
            } finally {
                setLoading(false);
            }
        };

        if (mealName && date) {
            fetchMealDetails();
        }
    }, [mealName, date]);

    const handleRemoveItem = useCallback((idToRemove: number) => {
        setItems(currentItems => currentItems.filter(item => item.id !== idToRemove));
        setDeletedIds(currentIds => [...currentIds, idToRemove]);
    }, []);

    const handleSave = async () => {
        if (deletedIds.length === 0) {
            router.back();
            return;
        }

        try {
            const userId = await AsyncStorage.getItem('userId');

            if (items.length === 0) {
                await axios.delete(`${API_URL}/api/meal/detail/`, {
                    params: { 
                        user_id: userId, 
                        date: date, 
                        meal_name: mealName 
                    }
                });
            } 
            else {
                await axios.post(`${API_URL}/api/meal/items/delete/`, {
                    item_ids: deletedIds
                });
            }
            
            setOpen(false);
            router.replace("/(home)"); 
        } catch (error) {
            console.error("Erro ao salvar:", error);
            Alert.alert("Erro", "Falha ao salvar as alterações.");
            setOpen(false);
        }
    };

    const currentTotalKcal = items.reduce((acc, item) => acc + parseInt(String(item.kcal)), 0);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-branco">
                <ActivityIndicator size="large" color="#2C6BCA" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-branco pt-10 items-center">
            
            <Modal visible={open} transparent animationType='fade'>
                <Pressable className="flex-1 justify-center items-center bg-preto/70" onPress={() => setOpen(false)}>
                    <Card>
                        <View className='items-start gap-3 py-3 pr-3'>
                            <Text className='text-preto font-bold text-2xl'>Salvar alterações?</Text>
                            <Text className='text-preto text-2xl'>
                                {items.length === 0 
                                    ? "A refeição ficará vazia e será excluída." 
                                    : "Os itens removidos serão excluídos permanentemente."}
                            </Text>
                        </View>
                        <View className='gap-5 justify-center items-center pb-5'>
                            <Button label='Sim' onPress={handleSave}/>
                            <Pressable onPress={() => setOpen(false)}>
                                <Text className='text-vermelho font-bold text-2xl'>Não</Text>
                            </Pressable>
                        </View>
                    </Card>
                </Pressable>
            </Modal>

            <View className='w-11/12 h-3/4'> 
                <CardText label={mealInfo.name} className='flex-1 border-b-hairline border-cinza-200 p-2'>
                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {items.length > 0 ? (
                            items.map((item) => (
                                <TouchableOpacity 
                                    key={item.id}
                                    activeOpacity={0.5}
                                    onPress={() => handleRemoveItem(item.id)}
                                    style={{ marginBottom: 12 }}
                                >
                                    <View pointerEvents="none"> 
                                        <CardFood 
                                            editType 
                                            title={`${item.name} (${item.amount} ${item.unit}) → ${parseInt(String(item.kcal))} kcal`}
                                        >
                                            <Text className='text-preto text-xl'>Carboidratos: {parseInt(String(item.carbs))} g</Text>
                                            <Text className='text-preto text-xl'>Proteínas: {parseInt(String(item.protein))} g</Text>
                                            <Text className='text-preto text-xl'>Gorduras: {parseInt(String(item.fat))} g</Text>
                                        </CardFood>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View className="py-10 items-center">
                                <Text className="text-cinza-200 text-lg text-center font-bold">
                                    Todos os itens foram removidos.
                                </Text>
                                <Text className="text-cinza-200 text-base text-center">
                                    Ao salvar, a refeição será apagada.
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    <View className="mt-2 pt-4 border-t border-cinza-100">
                        <Text className='text-xl font-bold text-preto'>Total aproximado:</Text>
                        <Text className='text-xl text-preto'> Calorias: {parseInt(String(currentTotalKcal))} kcal</Text>
                    </View>
                </CardText>
            </View>

            <View className='w-11/12 gap-2 mt-4'>
                <Button label="Concluir" onPress={() => {
                    if (deletedIds.length > 0) {
                        setOpen(true);
                    } else {
                        router.back();
                    }
                }}/>
                
                <Pressable className='items-center justify-center h-14' onPress={() => router.back()}>
                    <Text className='text-vermelho font-bold text-xl'>Cancelar</Text>
                </Pressable>
            </View>
        </View>
    );
}