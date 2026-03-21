import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { CardText, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useCallback } from 'react';
import { API_URL } from '../../constants/config';

export default function User() {
    const router = useRouter();
    
    const [name, setName] = useState('Carregando...');
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchUserData = async () => {
                try {
                    setLoading(true);
                    
                    const userId = await AsyncStorage.getItem('userId');
                    
                    if (!userId) {
                        router.replace('/'); 
                        return;
                    }

                    const response = await fetch(`${API_URL}/api/user/${userId}/`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        setName(data.name);
                    } else {
                        setName("Usuário");
                    }

                } catch (error) {
                    console.log("Erro ao buscar perfil:", error);
                    setName("Usuário"); 
                } finally {
                    setLoading(false);
                }
            };

            fetchUserData();
        }, [])
    );

    const handleLogout = async () => {
  await AsyncStorage.removeItem("userId");

  router.replace("/(auth)");
};

    return (
        <View className={`flex-col pt-20 items-center gap-6 bg-branco h-full`}>
            
            <View className="items-center gap-1">
                <Text className='text-preto font-bold text-xl'>Seu Perfil</Text>
                
                {loading ? (
                    <ActivityIndicator size="small" color="#2C6BCA" />
                ) : (
                    <Text className='text-azul font-bold text-3xl'>Olá, {name}</Text>
                )}
            </View>
            
            <CardText className='w-11/12 border-t-hairline border-cinza-200 mt-4'>
                <CardContent className='border border-cinza-100' onPress={() => router.push("/(infos)")}>
                    <Text className='text-preto text-2xl font-bold'>Informações Pessoais</Text>
                </CardContent>
                <CardContent className='border border-cinza-100' onPress={() => router.push("/(infos)/hydration")}>
                    <Text className='text-preto text-2xl font-bold'>Informações Hidratação</Text>
                </CardContent>
                <CardContent className='border border-cinza-100' onPress={() => router.push("/(infos)/diet")}>
                    <Text className='text-preto text-2xl font-bold'>Informações Dieta</Text>
                </CardContent>
            </CardText>

            <View className="w-11/12 mt-auto mb-10">
                <Button 
                    label="Sair da Conta" 
                    onPress={handleLogout} 
                    className="bg-red-600"
                />
            </View>
        </View>
    );
}