import { View, Alert } from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSignUp } from '../../../context/SignUpContext';

export default function AboutYou() {
    const router = useRouter();
    const { updateUserData } = useSignUp(); 

    const [peso, setPeso] = useState('');
    const [altura, setAltura] = useState('');

    const handleNext = () => {
        if (!peso || !altura) {
            Alert.alert("Erro", "Preencha peso e altura!");
            return;
        }

        updateUserData({
            Weight: peso,
            Height: altura
        });

        router.push('/workout');
    };

    return (
        <View className="flex-col my-10 items-center justify-center gap-10 bg-branco">
            <View className='gap-2 flex-col items-center w-80'>
                <Input 
                    label='Peso' 
                    placeholder='kg' 
                    keyboardType='numeric'
                    value={peso} 
                    onChangeText={setPeso}
                />
                <Input 
                    label='Altura' 
                    placeholder='cm' 
                    keyboardType='numeric'
                    value={altura} 
                    onChangeText={setAltura}
                />
                <Button label='Avançar' onPress={handleNext}/>
            </View>
        </View>
    );
}