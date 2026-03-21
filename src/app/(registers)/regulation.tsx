import { View, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Input } from '../../components/Input';
import { Button, RadioButton } from '../../components/Button';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSignUp } from '../../../context/SignUpContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/config';

export default function Regulation() {
    const router = useRouter();
    const { userData } = useSignUp(); 

    const [loading, setLoading] = useState(false);
    
    const [proteinOption, setProteinOption] = useState('');
    const [customProtein, setCustomProtein] = useState('');

    const [fatOption, setFatOption] = useState('');
    const [customFat, setCustomFat] = useState('');

    const handleFinalizar = async () => {
        const valorProteinaRatio = proteinOption === 'custom' ? customProtein : proteinOption;
        const valorGorduraRatio = fatOption === 'custom' ? customFat : fatOption;

        if (!valorProteinaRatio || !valorGorduraRatio) {
            Alert.alert("Atenção", "Por favor, selecione ou digite as quantidades de proteína e gordura.");
            return;
        }

        setLoading(true);

        const finalPayload = {
            ...userData, 
            ProteinRatio: parseFloat(valorProteinaRatio),
            FatRatio: parseFloat(valorGorduraRatio)     
        };

        try {
            const response = await fetch(`${API_URL}/api/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalPayload),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.user_id) {
                    await AsyncStorage.setItem('userId', String(data.user_id));
                }

                await AsyncStorage.setItem('show_water_modal', 'true');

                router.replace({
                    pathname: '/(home)',
                    params: { showWelcomeModal: 'true' } 
                });
            } else {
                Alert.alert("Erro no cadastro", data.error || JSON.stringify(data));
                console.error("Erro Back:", data);
            }
        } catch (error) {
            Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
            console.error("Erro Fetch:", error);
        } finally {
            setLoading(false);
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
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}>
            <View className="flex-col my-10 items-center justify-center gap-10 bg-branco">
                <View className='gap-2 flex-col items-center w-80'>
                    
                    <RadioButton 
                        label='Proteína' 
                        direction='column' 
                        options={[
                            { label: "1.6 g/kg", value: "1.6" },
                            { label: "1.8 g/kg", value: "1.8" },
                            { label: "2.0 g/kg", value: "2.0" },
                            { label: "Personalizado", value: "custom" },
                        ]} 
                        value={proteinOption} 
                        onChange={setProteinOption}
                    />

                    {proteinOption === "custom" && (
                        <View className='w-full gap-2'>
                            <Input 
                                label="Insira a quantidade (g/kg)"
                                keyboardType="numeric"
                                value={customProtein}
                                onChangeText={setCustomProtein}
                            />
                        </View>
                    )}

                    <RadioButton 
                        label='Gordura' 
                        direction='column' 
                        options={[
                            { label: "0.5 g/kg", value: "0.5" },
                            { label: "1.0 g/kg", value: "1.0" },
                            { label: "1.5 g/kg", value: "1.5" },
                            { label: "Personalizado", value: "custom" },
                        ]} 
                        value={fatOption} 
                        onChange={setFatOption}
                    />

                    {fatOption === "custom" && (
                        <View className='w-full gap-2'>
                            <Input 
                                label="Insira a quantidade (g/kg)"
                                keyboardType="numeric"
                                value={customFat}
                                onChangeText={setCustomFat}
                            />
                        </View>
                    )}

                    <Button label='Finalizar' onPress={handleFinalizar}/>
                </View>
            </View>
        </ScrollView>
    );
}