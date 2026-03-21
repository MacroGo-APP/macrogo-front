import { View } from 'react-native';
import { InputSelect, Input } from '../../components/Input';
import { Button, MultiSelectButton, RadioButton } from '../../components/Button';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSignUp } from '../../../context/SignUpContext';

export default function Workout2() {
    const router = useRouter();
    const { updateUserData } = useSignUp();

    const [fazMusculacao, setFazMusculacao] = useState('');
    const [diasTreino, setDiasTreino] = useState<string[]>([]);
    const [duracao, setDuracao] = useState('');
    const [intensidade, setIntensidade] = useState('');

    const handleNext = () => {
        if (fazMusculacao === 'S' && (!duracao || !intensidade)) {
        }

        const intensityKeys = ['muito_leve', 'leve', 'moderada', 'intensa', 'muito_intensa'] as const;
        type IntensityKey = typeof intensityKeys[number];
        const mapIntensity: Record<IntensityKey, string> = {
            muito_leve: 'Baixa',
            leve: 'Baixa',
            moderada: 'Média',
            intensa: 'Alta',
            muito_intensa: 'Alta'
        };

        updateUserData({
            DoesMusculation: fazMusculacao === 'S',
            MuscleDays: diasTreino,
            MuscleDuration: fazMusculacao === 'S' ? parseInt(duracao) : 0,
            MuscleIntensity: fazMusculacao === 'S'
                ? mapIntensity[(intensidade as IntensityKey)] || 'Média'
                : '',
        });

        router.push('/workout3');
    };

    return (
        <View className="flex-col my-10 items-center justify-center gap-10 bg-branco">
            <View className='gap-2 flex-col items-center w-80'>
                <RadioButton label='Você faz musculação?' direction='row' options={[
                    { label: "Sim", value: "S" },
                    { label: "Não", value: "N" },
                ]} value={fazMusculacao} onChange={setFazMusculacao}/>

                { fazMusculacao === "S" && (
                    <View className='w-full gap-2'>
                        <MultiSelectButton label="Quais dias da semana você treina?"
                            options={[
                                { label: "D", value: "sun" }, { label: "S", value: "mon" },
                                { label: "T", value: "tue" }, { label: "Q", value: "wed" },
                                { label: "Q", value: "thu" }, { label: "S", value: "fri" },
                                { label: "S", value: "sat" },
                            ]}
                            onChange={setDiasTreino}
                        />
                        <Input 
                            label="Qual a duração do treino? (min)" 
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
                <Button label='Avançar' onPress={handleNext}/>
            </View>
        </View>
    );
}