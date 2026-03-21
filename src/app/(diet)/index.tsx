import { ScrollView, View, Alert, ActivityIndicator } from 'react-native';
import { InputSelect, Input } from '../../components/Input';
import { Button, RadioButton } from '../../components/Button';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/config';

const objectiveMap = {
    'Perder Peso': 'perder_gordura',
    'Manter Peso': 'manter_peso',
    'Ganhar Peso': 'ganhar_massa',
    'perder_gordura': 'Perder Peso',
    'manter_peso': 'Manter Peso',
    'ganhar_massa': 'Ganhar Peso',
};

export default function Workout() {
    const router = useRouter();

    const [exerciseLevel, setExerciseLevel] = useState('');
    const [objective, setObjective] = useState(''); 
    const [loading, setLoading] = useState(true);

    const [weeklyGoalLose, setWeeklyGoalLose] = useState('');
    const [weeklyGoalGain, setWeeklyGoalGain] = useState('');
    const [customKcal, setCustomKcal] = useState('');

    useFocusEffect(
        useCallback(() => {
            const fetchWorkoutData = async () => {
                try {
                    setLoading(true);
                    const userId = await AsyncStorage.getItem('userId');
                    if (!userId) return;

                    const response = await fetch(`${API_URL}/api/workout/info/${userId}/`);
                    if (response.ok) {
                        const data = await response.json();

                        setExerciseLevel(data.phisy_act ? data.phisy_act.toLowerCase().replace(/ /g, '_') : '');

                        const mapKey = data.obj_macro as keyof typeof objectiveMap;
                        const mappedObjective = objectiveMap[mapKey] || '';
                        
                        setObjective(mappedObjective);

                        if (mappedObjective === 'perder_gordura' && data.deficit) {
                            const deficitStr = String(data.deficit);
                            if (['250', '500', '750'].includes(deficitStr)) {
                                setWeeklyGoalLose(deficitStr);
                            } else {
                                setWeeklyGoalLose('custom');
                                setCustomKcal(deficitStr);
                            }
                        } else if (mappedObjective === 'ganhar_massa' && data.superavit) {
                            const superavitStr = String(data.superavit);
                            if (['250', '500', '750'].includes(superavitStr)) {
                                setWeeklyGoalGain(superavitStr);
                            } else {
                                setWeeklyGoalGain('custom');
                                setCustomKcal(superavitStr);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados de treino:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchWorkoutData();
        }, [])
    );
    
    const handleNext = () => {
        let calorias = 0;
        let tipo = '';

        if (objective === 'perder_gordura') {
            tipo = 'Deficit';
            calorias = weeklyGoalLose === 'custom' ? parseInt(customKcal) || 0 : parseInt(weeklyGoalLose) || 0;
        } else if (objective === 'ganhar_massa') {
            tipo = 'Superavit';
            calorias = weeklyGoalGain === 'custom' ? parseInt(customKcal) || 0 : parseInt(weeklyGoalGain) || 0;
        }

        const workoutData = {
            exerciseLevel: exerciseLevel,
            objective: objective,
            [tipo]: calorias
        };

        AsyncStorage.setItem('tempWorkoutData', JSON.stringify(workoutData));

        router.push("/(diet)/train");
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-branco">
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-col my-10 items-center justify-center gap-10 bg-branco">
                <View className='gap-2 flex-col items-center w-80'>

                    <InputSelect label="Nível de Atividade Física" value={exerciseLevel}
                        options={[
                            { label: "Sedentário", value: "sedentario"},
                            { label: "Levemente Ativo", value: "levemente_ativo"},
                            { label: "Moderadamente Ativo", value: "moderadamente_ativo"},
                            { label: "Bastante Ativo", value: "bastante_ativo"},
                            { label: "Extremamente Ativo", value: "extremamente_ativo"},
                        ]}
                        onSelect={setExerciseLevel}
                    />

                    <InputSelect label="Seu objetivo" value={objective}
                        options={[
                            { label: "Perder gordura", value: "perder_gordura"},
                            { label: "Manter peso", value: "manter_peso"},
                            { label: "Ganhar massa", value: "ganhar_massa"},
                        ]}
                        onSelect={setObjective}
                    />

                    { objective === "perder_gordura" && (
                        <View className='w-full'>
                            <RadioButton label='Meta de Perda Semanal:' options={[
                                { label: "Perder 0.20-0.25kg/semana (250 kcal)", value: "250" },
                                { label: "Perder 0.40-0.50kg/semana (500 kcal)", value: "500" },
                                { label: "Perder 0.60-0.70kg/semana (750 kcal)", value: "750" },
                                { label: "Déficit personalizado", value: "custom" },
                            ]}
                            value={weeklyGoalLose}
                            onChange={(val) => {
                                setWeeklyGoalLose(val);
                                if (val !== 'custom') setCustomKcal('');
                            }}
                            />

                            { weeklyGoalLose === "custom" && (
                                <Input label="Déficit personalizado (kcal)" value={customKcal} onChangeText={setCustomKcal} keyboardType="numeric"/>
                            )}
                        </View>
                    )}

                    { objective === "ganhar_massa" && (
                        <View className='w-full'>
                            <RadioButton label='Meta de Ganho Semanal:' options={[
                                { label: "Ganho 0.20-0.25kg/semana (250 kcal)", value: "250" },
                                { label: "Ganho 0.40-0.50kg/semana (500 kcal)", value: "500" },
                                { label: "Ganho 0.60-0.70kg/semana (750 kcal)", value: "750" },
                                { label: "Excedente personalizado", value: "custom" },
                            ]}
                            value={weeklyGoalGain}
                            onChange={(val) => {
                                setWeeklyGoalGain(val);
                                if (val !== 'custom') setCustomKcal('');
                            }}
                            />

                            { weeklyGoalGain === "custom" && (
                                <Input label="Excedente personalizado (kcal)" value={customKcal} onChangeText={setCustomKcal} keyboardType="numeric"/>
                            )}
                        </View>
                    )}

                    <Button label='Avançar' onPress={handleNext}/>
                </View>
            </View>
        </ScrollView>
    );
}