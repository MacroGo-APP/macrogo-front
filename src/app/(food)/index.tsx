import React, { useState, useCallback } from 'react';
import { 
    View, Text, KeyboardAvoidingView, Platform, 
    ScrollView, TouchableWithoutFeedback, Keyboard, 
    ActivityIndicator 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { CardText, CardContent } from '../../components/Card';
import { Calendar } from '../../components/Calendar';
import { useDate } from '../../../context/DateContext';
import { API_URL } from '../../constants/config';

export default function Meals() {
    const router = useRouter();
    const { selectedDate } = useDate();
    
    const [loading, setLoading] = useState(true);
    const [groupedMeals, setGroupedMeals] = useState<Record<string, string[]>>({});

    const fetchMeals = async () => {
        try {
            setLoading(true);
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) return;

            const dateStr = selectedDate.format('YYYY-MM-DD');

            const response = await axios.get(`${API_URL}/api/meals/list/`, {
                params: { user_id: userId, date: dateStr }
            });

            const data = response.data || {}; 
            setGroupedMeals(data);

        } catch (error) {
            console.error("Erro ao buscar refeições:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchMeals();
        }, [selectedDate])
    );

    const handlePressMeal = (mealName: string) => {
        router.push({
            pathname: "/(food)/[id]", 
            params: { 
                id: mealName, 
                date: selectedDate.format('YYYY-MM-DD') 
            }
        });
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} 
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View className={`flex-col gap-2 items-center pb-14`}>
                        <Calendar/>

                        <CardText className='w-11/12 mt-4'>
                            {loading ? (
                                <ActivityIndicator size="large" color="#2C6BCA" className="py-4" />
                            ) : Object.keys(groupedMeals).length === 0 ? (
                                <View className="p-4 items-center">
                                    <Text className="text-cinza-200 text-lg">Nenhuma refeição registrada.</Text>
                                </View>
                            ) : (
                                Object.entries(groupedMeals).map(([mealName, items]) => {
                                    const listaItens = Array.isArray(items) ? items : [];
                                    const resumo = listaItens.length > 0 
                                        ? listaItens.slice(0, 3).join(', ') + (listaItens.length > 3 ? '...' : '')
                                        : "Nenhum item";

                                    return (
                                        <CardContent 
                                            key={mealName}
                                            className='border border-cinza-100 mb-2 py-3' 
                                            onPress={() => handlePressMeal(mealName)}
                                        >
                                            <View>
                                                <Text className='text-preto text-2xl font-bold capitalize'>
                                                    {mealName}
                                                </Text>
                                                <Text className='text-cinza-200 text-base font-normal' numberOfLines={1}>
                                                    {resumo}
                                                </Text>
                                            </View>
                                        </CardContent>
                                    );
                                })
                            )}
                        </CardText>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}