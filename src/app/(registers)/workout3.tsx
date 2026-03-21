import { View } from 'react-native';
import { InputSelect, Input } from '../../components/Input';
import { Button, MultiSelectButton, RadioButton } from '../../components/Button';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSignUp } from '../../../context/SignUpContext';

export default function Workout3() {
    const router = useRouter();
    const { updateUserData } = useSignUp();

    const [fazCardio, setFazCardio] = useState('');
    const [diasCardio, setDiasCardio] = useState<string[]>([]);
    const [duracao, setDuracao] = useState('');
    const [intensidade, setIntensidade] = useState('');

    const handleNext = () => {
        const mapIntensity: Record<'muito_leve' | 'leve' | 'moderada' | 'intensa' | 'muito_intensa', string> = {
            'muito_leve': 'Baixa', 'leve': 'Baixa',
            'moderada': 'Média',
            'intensa': 'Alta', 'muito_intensa': 'Alta'
        };

        updateUserData({
            DoesCardio: fazCardio === 'S',
            CardioDays: diasCardio,
            CardioDuration: fazCardio === 'S' ? parseInt(duracao) : 0,
            CardioIntensity: fazCardio === 'S' ? (mapIntensity[intensidade as keyof typeof mapIntensity] || 'Média') : '',
        });

        router.push('/regulation');
    };

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
                            ]} onChange={setDiasCardio}
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
                <Button label='Avançar' onPress={handleNext}/>
            </View>
        </View>
    );
}