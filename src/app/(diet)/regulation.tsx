import { View, Alert, ActivityIndicator } from 'react-native';
import { Input } from '../../components/Input';
import { Button, RadioButton } from '../../components/Button';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/config';

const DEFAULT_PROTEIN = '1.8';
const DEFAULT_FAT = '1';

export default function Regulation() {
    const router = useRouter();

    const [proteinOption, setProteinOption] = useState('');
    const [fatOption, setFatOption] = useState('');
    
    const [customProtein, setCustomProtein] = useState(DEFAULT_PROTEIN); 
    const [customFat, setCustomFat] = useState(DEFAULT_FAT); 

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchMacroData = async () => {
                try {
                    setLoading(true);
                    const userId = await AsyncStorage.getItem('userId');
                    if (!userId) { return; }

                    const response = await fetch(`${API_URL}/api/workout/info/${userId}/`); 
                    
                    if (response.ok) {
                        const data = await response.json();
                        const { macros } = data;
                        
                        const proteinRatio = String(macros.protein_ratio || DEFAULT_PROTEIN);
                        const fatRatio = String(macros.fat_ratio || DEFAULT_FAT);
                        
                        if (['1.6', '1.8', '2.0'].includes(proteinRatio)) {
                            setProteinOption(proteinRatio);
                        } else {
                            setProteinOption('custom');
                            setCustomProtein(proteinRatio);
                        }

                        if (['0.5', '1', '1.5'].includes(fatRatio)) {
                            setFatOption(fatRatio);
                        } else {
                            setFatOption('custom');
                            setCustomFat(fatRatio);
                        }
                        
                    } else {
                        setProteinOption(DEFAULT_PROTEIN);
                        setFatOption(DEFAULT_FAT);
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados de macros:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchMacroData();
        }, [])
    );

    const handleUpdate = async () => {
        const finalProtein = proteinOption === 'custom' ? customProtein : proteinOption;
        const finalFat = fatOption === 'custom' ? customFat : fatOption;
        
        if (!finalProtein || !finalFat || isNaN(parseFloat(finalProtein)) || isNaN(parseFloat(finalFat))) {
            Alert.alert("Erro", "Por favor, insira valores válidos para Proteína e Gordura.");
            return;
        }

        setUpdating(true);

        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) { return; }

            const response = await fetch(`${API_URL}/api/macros/update/${userId}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ProteinRatio: parseFloat(finalProtein),
                    FatRatio: parseFloat(finalFat),
                }),
            });

            if (response.ok) {
                Alert.alert("Sucesso", "Rácios de macros atualizados!");
                router.back();
            } else {
                const errorData = await response.json();
                Alert.alert("Erro", errorData.error || "Não foi possível atualizar os rácios.");
            }
        } catch (error) {
            console.error("Erro na atualização de macros:", error);
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
                <RadioButton label='Proteína' direction='column' options={[
                    { label: "1.6 g/kg", value: "1.6" },
                    { label: "1.8 g/kg", value: "1.8" },
                    { label: "2.0 g/kg", value: "2.0" },
                    { label: "Personalizado", value: "custom" },
                ]} value={proteinOption} onChange={setProteinOption}/>

                { proteinOption === "custom" && (
                    <View className='w-full gap-2'>
                        <Input 
                            label="Insira a quantidade de proteína desejada (g/kg)"
                            value={customProtein}
                            onChangeText={setCustomProtein}
                            keyboardType="numeric"
                        />
                    </View>
                )}

                <RadioButton label='Gordura' direction='column' options={[
                    { label: "0.5 g/kg", value: "0.5" },
                    { label: "1 g/kg", value: "1" },
                    { label: "1.5 g/kg", value: "1.5" },
                    { label: "Personalizado", value: "custom" },
                ]} value={fatOption} onChange={setFatOption}/>

                { fatOption === "custom" && (
                    <View className='w-full gap-2'>
                        <Input 
                            label="Insira a quantidade de gordura desejada (g/kg)"
                            value={customFat}
                            onChangeText={setCustomFat}
                            keyboardType="numeric"
                        />
                    </View>
                )}

                <Button 
                    label={updating ? "Atualizando..." : 'Atualizar'} 
                    onPress={handleUpdate} 
                    disabled={updating}
                />
            </View>
        </View>
    );
}