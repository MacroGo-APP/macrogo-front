import { Modal, Pressable, Text, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, TouchableWithoutFeedback, Keyboard, View, ActivityIndicator, Alert 
} from 'react-native';
import { Card } from "../../components/Card"
import { ProgressBarVertical } from '../../components/ProgressBar';
import { useState, useCallback } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CupSmallSvg from "../../assets/cupsmall.svg";
import CupMediumSvg from "../../assets/cupmedium.svg";
import Bottle from "../../assets/bottle.svg"
import Gota from "../../assets/gota.svg"
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { API_URL } from '../../constants/config';
import { Calendar } from '../../components/Calendar';
import { useDate } from '../../../context/DateContext';
import axios from 'axios';

export default function Water() {
  const router = useRouter();
  const { selectedDate } = useDate(); 
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [currentWater, setCurrentWater] = useState(0); 
  const [goalWater, setGoalWater] = useState(2500); 
  const [personCup, setPersonCup] = useState(0); 
  const [openCustom, setOpenCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [openPersonCup, setOpenPersonCup] = useState(false);
  const [personCupInput, setPersonCupInput] = useState('');

  const fetchData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;
      const dateStr = selectedDate.format('YYYY-MM-DD');

      const setupRes = await axios.get(`${API_URL}/api/hydra/setup/${userId}/`);
      
      setIsActive(setupRes.data.is_active);
      if (setupRes.data.is_active) {
          setGoalWater(setupRes.data.goal || 2500);
          setPersonCup(setupRes.data.person_cup || 0);
      }

      const intakeRes = await axios.get(`${API_URL}/api/hydra/intake/`, {
        params: { user_id: userId, date: dateStr }
      });
      
      setCurrentWater(intakeRes.data.amount || 0);

    } catch (error) {
      console.log("Erro ao carregar dados de água:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [selectedDate]) 
  );

  const handleAddWater = async (amount: number) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const dateStr = selectedDate.format('YYYY-MM-DD');

      setCurrentWater(prev => prev + amount);

      await axios.post(`${API_URL}/api/hydra/intake/`, {
        user_id: userId,
        date: dateStr,
        amount: amount
      });
      
    } catch (error) {
      Alert.alert("Erro", "Falha ao adicionar água. Verifique sua conexão.");
      setCurrentWater(prev => prev - amount);
    }
  };

  const handleSavePersonCup = async () => {
    const val = parseInt(personCupInput);
    if (!val || val <= 0) return;
    setPersonCup(val);
    handleAddWater(val);
    setOpenPersonCup(false);
    setPersonCupInput('');
  }

  if (loading) {
    return (
      <View className="flex-1 bg-branco items-center justify-center">
        <ActivityIndicator size="large" color="#2C6BCA" />
      </View>
    );
  }

  if (!isActive) {
    return (
      <View className="flex-1 bg-branco items-center justify-center gap-6">
        <MaterialCommunityIcons name="water-off" size={80} color="#B2B2B2" />
        <View className="items-center gap-2">
            <Text className='text-preto font-bold text-2xl'>Monitoramento Desativado</Text>
            <Text className='text-cinza-200 text-lg text-center w-10/12'>
                Você ainda não configurou sua meta de água. Deseja começar?
            </Text>
        </View>
        <View className="w-10/12">
            <Button 
                label='Ativar Monitoramento' 
                onPress={() => router.push('/(intake)/setup')} 
            />
        </View>
      </View>
    );
  }

  const litersDisplay = (currentWater / 1000).toFixed(2);

  return (
    <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} 
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 bg-branco mt-12">
              
              <View className="pb-2">
                <Calendar/>
              </View>

              <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                
                <View className="flex-col items-center gap-2 pb-10">
                  
                  <Text className='text-preto font-bold text-lg mt-2'>Ingestão de Água</Text>
                  
                  <Card className='w-11/12 py-6'>
                      <View className='flex-row items-center justify-center gap-6'>
                        <ProgressBarVertical value={currentWater} max={goalWater} color="bg-azul"/>
                        
                        <View className='justify-between flex-col w-1/2 gap-2'>
                          <Text className='text-preto text-xl'>Hoje você bebeu:</Text>
                          <View className="flex-row items-end gap-2">
                               <MaterialCommunityIcons name="water" size={40} color="#2C6BCA" />
                               <Text className='text-preto text-5xl font-bold'>{litersDisplay} <Text className="text-xl font-normal">L</Text></Text>
                          </View>
                          <Text className='text-cinza-200 text-sm'>Meta: {(goalWater / 1000).toFixed(2)} L</Text>
                        </View>
                      </View>
                  </Card>

                  <Card direction='column' className='w-11/12 mt-4 py-4'>
                    <Text className='font-bold text-lg text-preto mb-4'>Adicionar água</Text>
                    
                    <View className='flex-row items-end justify-between px-2'>
                      
                      <TouchableOpacity className='items-center gap-1' onPress={() => setOpenCustom(true)}>
                        <Gota/>
                        <View className="bg-white border-2 border-preto h-10 w-10 rounded-full items-center justify-center">
                          <Text className='font-bold text-lg text-preto'>+</Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity className='items-center gap-1' onPress={() => handleAddWater(200)}>
                        <CupSmallSvg/>
                        <Text className='font-bold text-base text-preto'>200ml</Text>
                      </TouchableOpacity>

                      <TouchableOpacity className='items-center gap-1' onPress={() => {
                          if (personCup > 0) handleAddWater(personCup);
                          else setOpenPersonCup(true);
                      }}>
                        <CupMediumSvg/>
                        <Text className='font-bold text-base text-preto'>
                          { personCup > 0 ? `${personCup}ml` : 'Definir' }
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity className='items-center gap-1' onPress={() => handleAddWater(750)}>
                        <Bottle/>
                        <Text className='font-bold text-base text-preto'>750ml</Text>
                      </TouchableOpacity>

                    </View>
                  </Card>

                  <Modal visible={openCustom} transparent animationType='fade'>
                    <Pressable className="flex-1 justify-center items-center bg-preto/70" onPress={() => setOpenCustom(false)}>
                      <Pressable onPress={() => {}} style={{ width: '90%' }}>
                        <Card className="p-6 items-center">
                          <Text className='text-preto font-bold text-xl mb-2'>Adicionar Quantidade</Text>
                          <Text className='text-cinza-200 text-base mb-4 text-center'>Digite quantos ml você bebeu agora.</Text>
                          
                          <View className='w-full gap-4'>
                            <Input 
                              placeholder='Ex: 100' 
                              keyboardType="numeric"
                              value={customInput}
                              onChangeText={setCustomInput}
                              className="bg-gray-50 border border-cinza-100 text-center text-xl h-14"
                            />
                            <Button label='Adicionar' onPress={() => {
                               const val = parseInt(customInput);
                               if (val > 0) handleAddWater(val);
                               setCustomInput('');
                               setOpenCustom(false);
                            }}/>
                          </View>
                        </Card>
                      </Pressable>
                    </Pressable>
                  </Modal>

                </View>

              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}