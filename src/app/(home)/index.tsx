import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Text, View, KeyboardAvoidingView, Platform,
  ScrollView, Alert, ActivityIndicator, Modal, Pressable
} from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDate } from '../../../context/DateContext';
import axios from 'axios';
import { API_URL } from '../../constants/config';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Card, CardContent, CardText } from '../../components/Card';
import { SwitchButton, Button } from '../../components/Button';
import { ProgressBar } from '../../components/ProgressBar';
import { Input } from '../../components/Input';
import { Calendar } from '../../components/Calendar';

interface MacroData {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface GoalsBase {
    basal?: MacroData;
    muscle?: MacroData;
    cardio?: MacroData;
}

export default function Home() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { selectedDate } = useDate();
  
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [firstModal, setFirstModal] = useState(false);
  const [inputText, setInputText] = useState('');
  
  const [isMuscleActive, setIsMuscleActive] = useState(false);
  const [isCardioActive, setIsCardioActive] = useState(false);
  
  const [consumed, setConsumed] = useState<MacroData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [goalsBase, setGoalsBase] = useState<GoalsBase | null>(null); 
  const [groupedMeals, setGroupedMeals] = useState<Record<string, string[]>>({}); 

  const TAB_BAR_HEIGHT = 60 + insets.bottom;

  useEffect(() => {
    if (params?.showWelcomeModal) {
        setFirstModal(true);
        router.setParams({ showWelcomeModal: undefined });
    }
  }, [params]);

  useFocusEffect(
    useCallback(() => {
        loadHomeData();
    }, [selectedDate])
  );

  const loadHomeData = async () => {
      try {
          const userId = await AsyncStorage.getItem('userId');
          if (!userId) return;

          const dateStr = selectedDate.format('YYYY-MM-DD');
          
          const [homeResponse, mealsResponse] = await Promise.all([
              axios.get(`${API_URL}/api/home-data/`, { params: { user_id: userId, date: dateStr } }),
              axios.get(`${API_URL}/api/meals/list/`, { params: { user_id: userId, date: dateStr } })
          ]);

          const data = homeResponse.data || {};
          const toggles = data.toggles || data.auto_toggles || {};

          setConsumed({
              calories: Number(data.consumed?.calories) || 0,
              protein: Number(data.consumed?.protein) || 0,
              carbs: Number(data.consumed?.carbs) || 0,
              fat: Number(data.consumed?.fat) || 0
          });

          setGoalsBase(data.goals || {}); 
          setGroupedMeals(mealsResponse.data || {});

          setIsMuscleActive(!!toggles.muscle);
          setIsCardioActive(!!toggles.cardio);

      } catch (error) {
          console.error("Erro ao carregar home:", error);
      } finally {
          setLoading(false);
      }
  };

  const handleToggle = async (type: string, value: boolean) => {
      if (type === 'muscle') setIsMuscleActive(value);
      else setIsCardioActive(value);

      try {
          const userId = await AsyncStorage.getItem('userId');
          const dateStr = selectedDate.format('YYYY-MM-DD');

          await axios.post(`${API_URL}/api/day/toggle/`, {
              user_id: userId,
              date: dateStr,
              type: type, 
              status: value
          });
          
      } catch (error) {
          console.error("Erro ao salvar status:", error);
          if (type === 'muscle') setIsMuscleActive(!value);
          else setIsCardioActive(!value);
      }
  };

  const handleSendText = () => {
    if (!inputText.trim()) {
      Alert.alert("Atenção", "Digite o que você comeu antes de enviar.");
      return;
    }
    const dateString = selectedDate?.format ? selectedDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0];
    router.push({
      pathname: "/(chat)",
      params: { userText: inputText, date: dateString }
    });
    setInputText(''); 
  };

  const currentTargets = useMemo(() => {
      const defaultGoals = { calories: 2000, protein: 150, carbs: 200, fat: 60 };

      if (!goalsBase || !goalsBase.basal) {
          return defaultGoals;
      }

      const val = (v: any) => Number(v) || 0;

      let total = { 
          calories: val(goalsBase.basal.calories),
          protein: val(goalsBase.basal.protein),
          carbs: val(goalsBase.basal.carbs),
          fat: val(goalsBase.basal.fat)
      };

      if (isMuscleActive && goalsBase.muscle) {
          total.calories += val(goalsBase.muscle.calories);
          total.protein += val(goalsBase.muscle.protein);
          total.carbs += val(goalsBase.muscle.carbs);
          total.fat += val(goalsBase.muscle.fat);
      }

      if (isCardioActive && goalsBase.cardio) {
          total.calories += val(goalsBase.cardio.calories);
          total.protein += val(goalsBase.cardio.protein);
          total.carbs += val(goalsBase.cardio.carbs);
          total.fat += val(goalsBase.cardio.fat);
      }

      return total;
  }, [goalsBase, isMuscleActive, isCardioActive]);

  const progressMetrics = [
    { value: consumed.calories, max: currentTargets.calories, color: "bg-laranja", label: "Calorias" },
    { value: consumed.carbs, max: currentTargets.carbs, color: "bg-verde", label: "Carboidratos" },
    { value: consumed.protein, max: currentTargets.protein, color: "bg-vermelho", label: "Proteínas" },
    { value: consumed.fat, max: currentTargets.fat, color: "bg-amarelo", label: "Gorduras" },
  ];

  const showMuscleSwitch = !!(goalsBase && goalsBase.muscle);
  const showCardioSwitch = !!(goalsBase && goalsBase.cardio);

  if (loading) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFCF6' }}>
            <ActivityIndicator size="large" color="#2C6BCA" />
        </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFCF6' }}>
      {showNotification && (
        <View 
            className="absolute w-11/12 bg-green-500 rounded-xl p-4 flex-row items-center justify-center self-center shadow-lg"
            style={{ top: insets.top + 20, zIndex: 100 }}
        >
            <FontAwesome name="check-circle" size={24} color="#FFFFFF" style={{ marginRight: 10 }} />
            <View>
                <Text className="text-white font-bold text-lg">Sucesso!</Text>
                <Text className="text-white text-sm">Informações cadastradas.</Text>
            </View>
        </View>
      )}

      <View style={{ paddingTop: insets.top, backgroundColor: '#FFFCF6', zIndex: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
        <Calendar />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} 
      >
          <View style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} 
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="on-drag" 
              keyboardShouldPersistTaps="handled"
            >
              <View className="flex-col items-center gap-5 bg-branco pt-6 px-1">
                
                {(showMuscleSwitch || showCardioSwitch) && (
                    <View className='flex-row items-center justify-between w-11/12'>
                        {showMuscleSwitch && (
                            <View style={{ width: showCardioSwitch ? '48%' : '100%' }}>
                                <SwitchButton 
                                    label='Treino' 
                                    value={isMuscleActive} 
                                    onValueChange={(val) => handleToggle('muscle', val)} 
                                /> 
                            </View>
                        )}

                        {showCardioSwitch && (
                            <View style={{ width: showMuscleSwitch ? '48%' : '100%' }}>
                                <SwitchButton 
                                    label='Cárdio' 
                                    value={isCardioActive} 
                                    onValueChange={(val) => handleToggle('cardio', val)} 
                                />
                            </View>
                        )}
                    </View>
                )}

                <Card className='w-11/12 p-4 gap-2 border border-cinza-100 shadow-sm'>
                  <Text className='text-preto font-bold text-xl mb-1'>Metas do dia</Text>
                  
                  {progressMetrics.map((metric) => (
                    <ProgressBar 
                        key={metric.label}
                        value={metric.value} 
                        max={metric.max} 
                        color={metric.color} 
                        label={metric.label}
                    />
                  ))}
                </Card>

                <CardText label='Refeições' className='w-11/12 bg-gray-50 border border-cinza-100' onPress={() => router.push("/(food)")}>
                    {Object.keys(groupedMeals).length === 0 ? (
                        <View className="p-4 items-center">
                            <Text className="text-cinza-200 text-base">Nenhuma refeição registrada.</Text>
                        </View>
                    ) : (
                        Object.entries(groupedMeals).map(([mealName, items], index) => {
                            const listaItens = Array.isArray(items) ? items : [];
                            const resumo = listaItens.length > 0 
                                ? listaItens.slice(0, 3).join(', ') + (listaItens.length > 3 ? '...' : '')
                                : "Ver detalhes";

                            return (
                                <CardContent 
                                    key={mealName}
                                    onPress={() => router.push({
                                        pathname: "/(food)/[id]", 
                                        params: { 
                                            id: mealName, 
                                            date: selectedDate.format('YYYY-MM-DD') 
                                        }
                                    })}
                                    className={`py-3 ${index !== Object.keys(groupedMeals).length - 1 ? 'border-b border-gray-200' : ''}`}
                                >
                                    <Text className='text-preto text-xl font-bold capitalize'>{mealName}</Text>
                                    <Text className='text-cinza-200 text-base' numberOfLines={1}>{resumo}</Text>
                                </CardContent>
                            );
                        })
                    )}
                </CardText>

              </View>
            </ScrollView>

            <View className="w-full bg-branco border-t border-cinza-100 px-4 pt-3 pb-3">
                <View className="mb-2">
                    <Text className='font-bold text-preto text-lg ml-1'>Adicione uma nova refeição</Text>
                </View>
                <View className='flex-row items-center gap-3'>
                    <Input chat className='flex-1 h-14 bg-gray-50 border border-cinza-100' placeholder="Ex: Arroz, feijão e frango..." value={inputText} onChangeText={setInputText} />
                    <Button icon className='h-14 w-14 rounded-xl items-center justify-center bg-azul' onPress={handleSendText}>
                        <FontAwesome name="send" size={20} color="#FFFCF6" />
                    </Button>
                </View>
            </View>
          </View>
      </KeyboardAvoidingView>

      <Modal visible={firstModal} transparent animationType='fade'>
        <Pressable 
            className="flex-1 justify-center items-center bg-preto/70"
            onPress={() => setFirstModal(false)}
        >
            <Pressable onPress={() => {}}>
                <Card>
                    <View className='items-start gap-3 py-3 pr-3'>
                        <Text className='text-preto font-bold text-2xl'>Informações Cadastradas!</Text>
                        <Text className='text-preto text-2xl'>Deseja monitorar a ingestão de água?</Text>
                    </View>
                    <View className='gap-5 justify-center items-center pb-5'>
                        <Button label='Sim'
                            onPress={() => {
                                setFirstModal(false);
                                router.push("/(intake)");
                            }}
                        />
                        <Pressable onPress={() => setFirstModal(false)}>
                            <Text className='text-azul font-bold text-2xl'>Mais tarde</Text>
                        </Pressable>
                    </View>
                </Card>
            </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}