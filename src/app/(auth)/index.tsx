import { Text, View, Alert, ActivityIndicator } from 'react-native';
import { Input } from '../../components/Input';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { Button } from '../../components/Button';
import { useState, useCallback } from 'react'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/config';

export default function Login() {
  const router = useRouter();
  console.log("RENDERIZOU A TELA DE LOGIN");

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(false);  

  useFocusEffect(
    useCallback(() => {
      setIsCheckingSession(true);

      const checkLogin = async () => {
        try {
          const userId = await AsyncStorage.getItem('userId');
          console.log("O VIGILANTE VIU O ID NO CELULAR:", userId);

          if (userId && userId !== 'null' && userId !== '') {
            
            try {
              console.log("Validando ID com o Backend...");
              const response = await fetch(`${API_URL}/api/hydra/users/${userId}/`); 

              if (response.ok) {
                console.log("ID confirmado no banco. Indo pra Home...");
                router.replace("/(home)");
              } else {
                console.log("ID Fantasma detectado (não existe no banco). Limpando...");
                await AsyncStorage.clear();
                setIsCheckingSession(false);
              }
            } catch (networkError) {
              console.log("Erro de conexão ao validar. Se o server caiu, libera login.", networkError);
              setIsCheckingSession(false);
            }

          } else {
            console.log("Não tem ID, liberando Login...");
            setIsCheckingSession(false);
          }
        } catch (error) {
          console.log("Erro no AsyncStorage", error);
          setIsCheckingSession(false);
        }
      };

      checkLogin();
    }, [])
  );

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert("Atenção", "Preencha email e senha."); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        if (data.user_id) {
            await AsyncStorage.setItem('userId', String(data.user_id));
        }
        router.replace("/(home)"); 
      } else {
        Alert.alert("Erro", data.error || "Login falhou");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Falha na conexão");
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
        <View className="flex-1 items-center justify-center bg-branco">
            <ActivityIndicator size="large" color="#2C6BCA" />
            <Text className="mt-4 text-gray-500">Validando sessão...</Text>
        </View>
    );
  }

  return (
    <View className="flex-col h-full items-center justify-center gap-10 bg-branco">
        <View className='gap-2 flex-col items-center w-80'>
            <Text className="text-preto font-bold text-3xl">Login</Text>
            <Input label='E-mail' value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
            <Input label='Senha' password value={password} onChangeText={setPassword}/>
            <Link className="self-start text-azul underline text-xl" href="#">Esqueceu a senha?</Link>
            {loading ? <ActivityIndicator size="large" color="#0000ff" /> : <Button label='Entrar' onPress={handleLogin}/>}
        </View>
        <Text className='text-xl w-4/5 text-center'>Se ainda não possui cadastro, <Link className="self-start text-azul underline" href="/(registers)">Cadastre-se Aqui</Link></Text>
    </View>
  );
}