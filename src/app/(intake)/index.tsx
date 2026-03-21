import { View, Alert, ActivityIndicator } from 'react-native';
import { Button, RadioButton } from '../../components/Button';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/config';

export default function Intake() {
    const router = useRouter();

    const [clima, setClima] = useState('');
    const [sede, setSede] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFinalizar = async () => {
        if (!clima || !sede) {
            Alert.alert("Atenção", "Por favor, responda todas as perguntas.");
            return;
        }

        setLoading(true);

        try {
            const userId = await AsyncStorage.getItem('userId');

            const response = await fetch(`${API_URL}/api/hydra/setup/${userId}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clima: clima,
                    sede: sede
                })
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert(
                    "Pronto!", 
                    `Sua meta diária foi definida em: ${data.goal}ml`,
                    [
                        { 
                            text: "OK", 
                            onPress: () => router.replace('/(home)/water')
                        }
                    ]
                );
            } else {
                Alert.alert("Erro", data.error || "Não foi possível salvar.");
            }

        } catch (error) {
            console.log(error);
            Alert.alert("Erro", "Falha na conexão com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-col my-10 items-center justify-center gap-10 bg-branco">
            <View className='gap-2 flex-col items-center w-80 mt-20'>
                
                <RadioButton 
                    label='O clima onde você vive é quente ou ameno/frio?' 
                    direction='column' 
                    options={[
                        { label: "Ameno/frio", value: "frio" },
                        { label: "Quente", value: "quente" },
                        { label: "Muito Quente", value: "muito_quente" },
                    ]} 
                    value={clima} 
                    onChange={(val) => setClima(val)}
                />

                <RadioButton 
                    label='Você tem urina escura ou sente sede com frequência?' 
                    direction='column' 
                    options={[
                        { label: "Sim", value: "sim" },
                        { label: "Não", value: "nao" },
                    ]} 
                    value={sede} 
                    onChange={(val) => setSede(val)}
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#2C6BCA" />
                ) : (
                    <Button label='Finalizar' onPress={handleFinalizar}/>
                )}
                
            </View>
        </View>
    );
}