import { View, Alert, ActivityIndicator } from 'react-native';
import { InputSelect, Input } from '../../components/Input';
import { Button, MultiSelectButton, RadioButton } from '../../components/Button';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/config';

const mapIntensity: Record<string, string> = {
    'muito_leve': 'Baixa', 'leve': 'Baixa',
    'moderada': 'Média',
    'intensa': 'Alta', 'muito_intensa': 'Alta'
};

const mapIntensityReverse: Record<string, string> = {
    'Baixa': 'leve',     
    'Média': 'moderada',
    'Alta': 'intensa',
};

const mapDaysReverse: Record<string, string> = {
    'Domingo': 'sun',
    'Segunda-feira': 'mon',
    'Terça-feira': 'tue',
    'Quarta-feira': 'wed',
    'Quinta-feira': 'thu',
    'Sexta-feira': 'fri',
    'Sábado': 'sat'
};

export default function Workout3() {
    const router = useRouter();

    const [fazCardio, setFazCardio] = useState('');
    const [diasCardio, setDiasCardio] = useState<string[]>([]);
    const [duracao, setDuracao] = useState('');
    const [intensidade, setIntensidade] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchCardioData = async () => {
                try {
                    setLoading(true);
                    const userId = await AsyncStorage.getItem('userId');
                    if (!userId) { return; }

                    const response = await fetch(`${API_URL}/api/workout/info/${userId}/`);
                    if (response.ok) {
                        const data = await response.json();
                        const cardioData = data.cardio || {};
                        
                        setFazCardio(cardioData.duration > 0 ? 'S' : 'N');

                        if (cardioData.duration > 0) {
                            const diasBackend = cardioData.days || [];
                            const diasFormatados = diasBackend
                                .map((dia: string) => mapDaysReverse[dia])
                                .filter((dia: string) => dia !== undefined);

                            setDiasCardio(diasFormatados);
                            
                            setDuracao(String(cardioData.duration) || '30');
                            
                            const intensityValue = mapIntensityReverse[cardioData.intensity] || 'moderada';
                            setIntensidade(intensityValue);
                        }
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados de cardio:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchCardioData();
        }, [])
    );


    const handleUpdate = async () => {
        if (fazCardio === 'S' && (!diasCardio.length || !duracao || !intensidade)) {
            Alert.alert("Atenção", "Por favor, preencha todos os campos do Cardio.");
            return;
        }

        setUpdating(true);

        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) { return; }

            const existingDataRaw = await AsyncStorage.getItem('tempWorkoutData');
            const existingData = JSON.parse(existingDataRaw || '{}');

            const cardioData = {
                DoesCardio: fazCardio === 'S',
                CardioDays: fazCardio === 'S' ? diasCardio : [],
                CardioDuration: fazCardio === 'S' ? parseInt(duracao) : 0,
                CardioIntensity: fazCardio === 'S' ? mapIntensity[intensidade] || 'Média' : null,
            };

            const finalData = { ...existingData, ...cardioData };
            
            const response = await fetch(`${API_URL}/api/workout/info/${userId}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData),
            });

            if (response.ok) {
                await AsyncStorage.removeItem('tempWorkoutData'); 
                
                Alert.alert("Sucesso", "Configuração de treino e macros finalizada!", [
                    { text: "OK", onPress: () => router.replace('/(home)') }
                ]);
            } else {
                const errorData = await response.json();
                Alert.alert("Erro", errorData.error || errorData.message || "Não foi possível atualizar.");
            }
        } catch (error) {
            console.error("Erro na atualização final:", error);
            Alert.alert("Erro", "Falha na conexão com o servidor ou erro interno.");
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

                <RadioButton label='Você faz cardio (aeróbicos)?' direction='row' options={[
                    { label: "Sim", value: "S" },
                    { label: "Não", value: "N" },
                ]} value={fazCardio} onChange={setFazCardio}/>

                { fazCardio === "S" && (
                    <View className='w-full gap-2'>
                        <MultiSelectButton label="Quais dias?"
                            options={[
                                { label: "D", value: "sun" }, { label: "S", value: "mon" },
                                { label: "T", value: "tue" }, { label: "Q", value: "wed" },
                                { label: "Q", value: "thu" }, { label: "S", value: "fri" },
                                { label: "S", value: "sat" },
                            ]} 
                            selectedValues={diasCardio}
                            onChange={setDiasCardio}
                        />
                        <Input 
                            label="Duração (min)" 
                            keyboardType="numeric"
                            value={duracao}
                            onChangeText={setDuracao}
                        />
                        <InputSelect value={intensidade} label="Intensidade" options={[
                            { label: "Muito Leve", value: "muito_leve"},
                            { label: "Leve", value: "leve"},
                            { label: "Moderada", value: "moderada"},
                            { label: "Intensa", value: "intensa"},
                            { label: "Muito Intensa", value: "muito_intensa"},
                        ]} onSelect={setIntensidade} />
                    </View>
                )}
                <Button label={updating ? "Atualizando..." : 'Atualizar'} onPress={handleUpdate} disabled={updating}/>
            </View>
        </View>
    );
}