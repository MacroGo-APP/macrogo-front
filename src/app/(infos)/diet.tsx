import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { CardText, CardContent } from '../../components/Card';
import React from 'react';

export default function User() {
    const router = useRouter();

    return (
        <View className={`flex-col pt-10 items-center gap-10 bg-branco h-full`}>
            <CardText className='w-11/12 border-t-hairline border-cinza-200'>
                <CardContent className='border border-cinza-100' onPress={() => router.push("/(diet)")}>
                    <Text className='text-preto text-2xl font-bold'>Seu Treino</Text>
                </CardContent>
                <CardContent className='border border-cinza-100' onPress={() => router.push("/(diet)/regulation")}>
                    <Text className='text-preto text-2xl font-bold'>Regulação de MacroNutrientes</Text>
                </CardContent>
            </CardText>
        </View>
    );
}
