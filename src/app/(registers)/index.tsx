import { View, Alert } from 'react-native';
import { Input } from '../../components/Input';
import { Button, RadioButton } from '../../components/Button';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSignUp } from '../../../context/SignUpContext';

export default function Register() {
    const router = useRouter();
    const { updateUserData } = useSignUp();

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [genero, setGenero] = useState('');
    const [senha, setSenha] = useState('');
    
    const [dataNasc, setDataNasc] = useState(''); 

    const formatarParaBanco = (dataBR: string) => {
        if (!dataBR) return '';
        const [dia, mes, ano] = dataBR.split('/');
        return `${ano}-${mes}-${dia}`;
    };

    const handleNext = () => {
        console.log("Validando:", { nome, email, genero, dataNasc, senha });

        if(!nome || !email || !genero || !dataNasc || !senha) {
            Alert.alert("Erro", "Preencha todos os campos!");
            return;
        }

        updateUserData({
            Name: nome,
            Email: email,
            Sex: genero === 'M' ? 'Masculino' : 'Feminino',
            Date: formatarParaBanco(dataNasc), 
            Password: senha
        });

        router.push('/aboutyou');
    }

    return (
        <View className="flex-col my-10 items-center justify-center gap-10 bg-branco">
            <View className='gap-2 flex-col items-center w-80'>
                <Input label='Nome' value={nome} onChangeText={setNome}/>
                <Input label='Email' value={email} onChangeText={setEmail} keyboardType="email-address"/>
                
                <RadioButton label='Gênero' direction='row' options={[
                    { label: "Masculino", value: "M" },
                    { label: "Feminino", value: "F" },
                ]} value={genero} onChange={setGenero}/>
                
                <Input 
                    date 
                    label='Data de Nascimento' 
                    placeholder="Toque para selecionar"
                    value={dataNasc}
                    onChangeText={setDataNasc}
                />
                
                <Input label='Senha' password value={senha} onChangeText={setSenha}/>
                
                <Button label='Cadastrar' onPress={handleNext}/>
            </View>
        </View>
    );
}