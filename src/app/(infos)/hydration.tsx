import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { Button, RadioButton } from '../../components/Button';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/config';

export default function Intake() {
    const router = useRouter();

    const [clima, setClima] = useState('');
    const [sede, setSede] = useState('');
    
    const [metaML, setMetaML] = useState(0);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const formatMeta = (ml: number | null) => {
        if (!ml || ml === 0) return '0.0';
        return (ml / 1000).toFixed(1);
    }

    useFocusEffect(
        useCallback(() => {
            const fetchHydraData = async () => {
                try {
                    setLoading(true);
                    const userId = await AsyncStorage.getItem('userId');

                    if (!userId) {
                        router.replace('/'); 
                        return;
                    }

                    const response = await fetch(`${API_URL}/api/hydra/setup/${userId}/`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        
                        setMetaML(data.goal || 0); 

                    }
                } catch (error) {
                    console.error("Erro ao buscar hidratação:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchHydraData();
        }, [])
    );

    const handleUpdateHydration = async () => {
        try {
            setUpdating(true);
            const userId = await AsyncStorage.getItem('userId');

            if (!userId) { return; }

            const updateData = {
                clima,
                sede,
            };

            const response = await fetch(`${API_URL}/api/hydra/setup/${userId}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                const data = await response.json();
                setMetaML(data.goal);
                Alert.alert("Sucesso", "Meta de hidratação atualizada!");
            } else {
                const errorText = await response.text();
                console.log("ERRO BRUTO DO SERVIDOR:", errorText);
                Alert.alert("Erro de API", `Código: ${response.status}. Veja o console para detalhes.`);
            }
        } catch (error) {
            console.error("Erro no update da hidratação:", error);
            Alert.alert("Erro", "Erro de conexão com o servidor.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-branco">
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <View className="flex-col my-10 items-center justify-center gap-10 bg-branco">
            <View className='gap-2 flex-col items-center w-80'>
                <RadioButton 
                    label='O clima onde você vive é quente ou ameno/frio?' 
                    direction='column' 
                    options={[
                        { label: "Ameno/frio", value: "frio" },
                        { label: "Quente", value: "quente" },
                        { label: "Muito Quente", value: "muito_quente" },
                    ]} 
                    value={clima} 
                    onChange={setClima}
                />

                <RadioButton 
                    label='Você tem urina escura ou sente sede com frequência?' 
                    direction='column' 
                    options={[
                        { label: "Sim", value: "sim" },
                        { label: "Não", value: "nao" },
                    ]} 
                    value={sede} 
                    onChange={setSede}
                />

                <Text className='text-preto text-xl'>Sua meta atual é: 
                    <Text className='text-azul font-bold text-2xl'>{formatMeta(metaML)}</Text> L por dia
                </Text>

                <Button 
                    label={updating ? 'Recalculando...' : 'Atualizar'} 
                    onPress={handleUpdateHydration}
                    disabled={updating}
                />
            </View>
        </View>
    );
}