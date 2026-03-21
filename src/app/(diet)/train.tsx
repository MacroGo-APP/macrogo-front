import { View, Alert, ActivityIndicator, Text } from 'react-native';
import { InputSelect, Input } from '../../components/Input';
import { Button, MultiSelectButton, RadioButton } from '../../components/Button';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/config';

const intensityMap: Record<string, string> = {
    'Intensa': 'Alta',
    'Muito Intensa': 'Alta',
    'Moderada': 'Média', 
    'Leve': 'Baixa',
    'Muito Leve': 'Baixa',
};

const mapIntensityReverse: Record<string, string> = {
    'Alta': 'Intensa', 
    'Média': 'Moderada',
    'Baixa': 'Leve',
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

export default function Workout2() {
    const router = useRouter();

    const [train, setTrain] = useState('');
    const [days, setDays] = useState<string[]>([]);
    const [duration, setDuration] = useState('');
    const [intensity, setIntensity] = useState('');
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchMuscleData = async () => {
                try {
                    setLoading(true);
                    const userId = await AsyncStorage.getItem('userId');
                    if (!userId) { return; }

                    const response = await fetch(`${API_URL}/api/workout/info/${userId}/`);
                    if (response.ok) {
                        const data = await response.json();
                        const muscleData = data.muscle || {};

                        setTrain(muscleData.does_musculation === 'S' ? 'S' : 'N');

                        if (muscleData.does_musculation === 'S') {
                            const diasBackend = muscleData.days || [];
                            const diasFormatados = diasBackend
                                .map((dia: string) => mapDaysReverse[dia])
                                .filter((dia: string) => dia !== undefined);
                            
                            setDays(diasFormatados);
                            
                            setDuration(muscleData.duration ? String(muscleData.duration) : '');
                            
                            const intensityValue = mapIntensityReverse[muscleData.intensity] || 'Moderada';
                            setIntensity(intensityValue);
                        }
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados de musculação:", error);
                    Alert.alert("Erro", "Não foi possível carregar o treino de musculação.");
                } finally {
                    setLoading(false);
                }
            };
            fetchMuscleData();
        }, [])
    );
    
    const handleNext = async () => {
        if (train === 'S' && (!days.length || !duration || !intensity)) {
            Alert.alert("Atenção", "Por favor, preencha todos os campos do treino.");
            return;
        }

        try {
            const existingDataRaw = await AsyncStorage.getItem('tempWorkoutData');
            const existingData = JSON.parse(existingDataRaw || '{}');

            const muscleData = {
                DoesMusculation: train === 'S',
                MuscleDays: train === 'S' ? days : [],
                MuscleDuration: train === 'S' ? parseInt(duration) : 0,
                MuscleIntensity: train === 'S' ? intensityMap[intensity] || 'Média' : null,
            };

            const finalData = { ...existingData, ...muscleData };

            await AsyncStorage.setItem('tempWorkoutData', JSON.stringify(finalData));

            router.replace('/cardio');
            
        } catch (e) {
            console.error("Erro ao salvar dados de treino:", e);
            Alert.alert("Erro", "Não foi possível salvar dados temporários.");
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
                <RadioButton label='Você faz musculação?' direction='row' options={[
                    { label: "Sim", value: "S" },
                    { label: "Não", value: "N" },
                ]} value={train} onChange={setTrain}/>

                { train === "S" && (
                    <View className='w-full gap-2'>
                        <MultiSelectButton label="Quais dias da semana você treina?"
                            options={[
                                { label: "D", value: "sun" },
                                { label: "S", value: "mon" },
                                { label: "T", value: "tue" },
                                { label: "Q", value: "wed" },
                                { label: "Q", value: "thu" },
                                { label: "S", value: "fri" },
                                { label: "S", value: "sat" },
                            ]}
                            selectedValues={days}
                            onChange={setDays}
                        />
                        <Input 
                            label="Qual a duração do treino? (min)" 
                            value={duration}
                            onChangeText={setDuration}
                            keyboardType="numeric"
                        />
                        <InputSelect 
                            value={intensity} 
                            label="Como você descreveria a intensidade dos seus treinos?" 
                            options={[
                                { label: "Muito Leve", value: "Muito Leve"},
                                { label: "Leve", value: "Leve"},
                                { label: "Moderada", value: "Moderada"},
                                { label: "Intensa", value: "Intensa"},
                                { label: "Muito Intensa", value: "Muito Intensa"},
                            ]}
                            onSelect={setIntensity}
                        />
                    </View>
                )}

                <Button label='Avançar' onPress={handleNext}/>
            </View>
        </View>
    );
}