import { View, Alert } from 'react-native';
import { InputSelect, Input } from '../../components/Input';
import { Button, RadioButton } from '../../components/Button';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSignUp } from '../../../context/SignUpContext';

export default function Workout() {
    const router = useRouter();
    const { updateUserData } = useSignUp();

    const [exerciseLevel, setExerciseLevel] = useState('');
    const [objective, setObjective] = useState<'perder_gordura' | 'manter_peso' | 'ganhar_massa' | ''>('');
    
    const [weeklyGoalLose, setWeeklyGoalLose] = useState('');
    const [weeklyGoalGain, setWeeklyGoalGain] = useState('');
    const [customKcal, setCustomKcal] = useState('');

    const handleNext = () => {
        if (!exerciseLevel || !objective) {
            Alert.alert("Erro", "Selecione nível e objetivo.");
            return;
        }

        if (objective === "perder_gordura") {
            if (!weeklyGoalLose) {
                Alert.alert("Erro", "Selecione o déficit.");
                return;
            }

            if (weeklyGoalLose === "custom" && (!customKcal || isNaN(Number(customKcal)))) {
                Alert.alert("Erro", "Insira o déficit personalizado.");
                return;
            }
        }

        if (objective === "ganhar_massa") {
            if (!weeklyGoalGain) {
                Alert.alert("Erro", "Selecione o superávit.");
                return;
            }

            if (weeklyGoalGain === "custom" && (!customKcal || isNaN(Number(customKcal)))) {
                Alert.alert("Erro", "Insira o superávit personalizado.");
                return;
            }
        }

        const mapObjective = {
            'perder_gordura': 'Perda de Peso',
            'manter_peso': 'Manutenção',
            'ganhar_massa': 'Ganho de Massa'
        } as const;

        const mapActivity = {
            'sedentario': 'Sedentário',
            'levemente_ativo': 'Levemente Ativo',
            'moderadamente_ativo': 'Moderadamente Ativo',
            'bastante_ativo': 'Muito Ativo',
            'extremamente_ativo': 'Extremamente Ativo'
        } as const;

        let deficit: number | null = null;
        let superavit: number | null = null;

        if (objective === "perder_gordura") {
            deficit = weeklyGoalLose === "custom" ? Number(customKcal) : Number(weeklyGoalLose);
        }

        if (objective === "ganhar_massa") {
            superavit = weeklyGoalGain === "custom" ? Number(customKcal) : Number(weeklyGoalGain);
        }

        updateUserData({
            activityLevel: mapActivity[exerciseLevel as keyof typeof mapActivity],
            objective: mapObjective[objective],
            deficit: deficit, 
            superavit: superavit
        });

        router.push('/workout2');
    };

    return (
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
                    onSelect={(value) => {
                        setObjective(value as any);
                        setWeeklyGoalLose('');
                        setWeeklyGoalGain('');
                        setCustomKcal('');
                    }}
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
                        onChange={setWeeklyGoalLose}
                        />

                        { weeklyGoalLose === "custom" && (
                            <Input label="Déficit personalizado (kcal)" value={customKcal} onChangeText={setCustomKcal}/>
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
                        onChange={setWeeklyGoalGain}
                        />

                        { weeklyGoalGain === "custom" && (
                            <Input label="Excedente personalizado (kcal)" value={customKcal} onChangeText={setCustomKcal}/>
                        )}
                    </View>
                )}

                <Button label='Avançar' onPress={handleNext}/>
            </View>
        </View>
    );
}