import { View, Alert, ActivityIndicator } from 'react-native';
import { Input } from '../../components/Input';
import { Button, RadioButton } from '../../components/Button';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/config';

const formatDateToBackend = (dateStr: string) => {
    if (!dateStr) return null;
    
    if (dateStr.includes('-')) return dateStr;

    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return dateStr;
};

const formatDateToDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
};

export default function PersonalInfos() {
    const router = useRouter();

    const [genero, setGenero] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [senha, setSenha] = useState('');
    const [peso, setPeso] = useState('');
    const [altura, setAltura] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchUserData = async () => {
                try {
                    setLoading(true);
                    const userId = await AsyncStorage.getItem('userId');

                    if (!userId) {
                        router.replace('/'); 
                        return;
                    }

                    const response = await fetch(`${API_URL}/api/user/${userId}/`);
                    if (response.ok) {
                        const data = await response.json();
                        setName(data.name || '');
                        setEmail(data.email || '');
                        
                        setDataNascimento(formatDateToDisplay(String(data.birth_date || '')));
                        
                        setSenha(''); 
                        setPeso(data.weight ? String(data.weight) : '');
                        setAltura(data.height ? String(data.height) : '');
                        setGenero(data.sex || data.gender || '');
                    }
                } catch (error) {
                    console.error("Erro ao buscar perfil:", error);
                    Alert.alert("Erro", "Não foi possível carregar seus dados.");
                } finally {
                    setLoading(false);
                }
            };

            fetchUserData();
        }, [])
    );

    const handleUpdate = async () => {
        try {
            setUpdating(true);
            const userId = await AsyncStorage.getItem('userId');

            const pesoInt = parseFloat(peso); 
            const alturaInt = parseInt(altura);

            if (isNaN(pesoInt) || isNaN(alturaInt)) {
                Alert.alert("Erro", "Peso e Altura devem ser números válidos.");
                setUpdating(false);
                return;
            }

            const updatedData = {
                name: name,
                email: email,
                birth_date: formatDateToBackend(dataNascimento), 
                ...(senha && {password: senha}),
                weight: pesoInt,
                height: alturaInt,
                sex: genero
            };

            const response = await fetch(`${API_URL}/api/user/${userId}/update/`, { 
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                Alert.alert("Sucesso", "Dados atualizados com sucesso!");
                router.back();
            } else {
                const errorData = await response.json();
                console.log("Erro da API no Update:", errorData);
                Alert.alert("Erro", `Falha ao atualizar: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error("Erro no update:", error);
            Alert.alert("Erro", "Erro de conexão com o servidor.");
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
                <Input 
                    label='Nome' 
                    value={name} 
                    onChangeText={setName} 
                />
                <Input 
                    label='Email' 
                    value={email} 
                    onChangeText={setEmail} 
                    keyboardType="email-address"
                />
                <RadioButton 
                    label='Gênero' 
                    options={[
                        { label: "Masculino", value: "Masculino" },
                        { label: "Feminino", value: "Feminino" },
                    ]} 
                    value={genero} 
                    onChange={(val) => setGenero(val)}
                />
                <Input 
                    label='Data de Nascimento'
                    date 
                    value={dataNascimento} 
                    onChangeText={setDataNascimento} 
                    placeholder="DD/MM/AAAA" 
                />
                <Input 
                    label='Senha' 
                    password 
                    value={senha} 
                    onChangeText={setSenha} 
                />
                <Input 
                    label='Peso (kg)' 
                    value={peso} 
                    onChangeText={setPeso} 
                    keyboardType="numeric"
                />
                <Input 
                    label='Altura (cm)' 
                    value={altura} 
                    onChangeText={setAltura} 
                    keyboardType="numeric"
                />
                
                <Button 
                    label={updating ? 'Salvando...' : 'Atualizar'} 
                    onPress={handleUpdate}
                    disabled={updating}
                />
            </View>
        </View>
    );
}