import React from "react";
import { View, ViewProps, ScrollView, Text, Pressable, FlatList } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type CardProps = ViewProps & {
    children: React.ReactNode;
    direction?: 'row' | 'column';
    label?: string;
    className?: string;
    onPress?: () => void;
    title?: string;
    editType?: boolean
}

export function Card({ children, className, direction, ...rest }: CardProps) {
    return (
        <View className={`bg-branco p-4 shadow-md rounded-md gap-2 ${className ? className : "w-80"} ${direction === "row"? "flex-row" : "flex-col" }`} {...rest}>
            {children}
        </View>
    )
}

export function CardText({ children, className, label, onPress, ...rest }: CardProps) {
    return (
        <View className={`p-4 rounded-xl gap-2 ${className ? className : "w-80"}`} {...rest}>
            <Text className="text-preto text-xl font-bold" onPress={onPress}>{label}</Text>
            <ScrollView contentContainerStyle={{ gap: 8 }} showsVerticalScrollIndicator={true} nestedScrollEnabled={true}>
                {children}
            </ScrollView>
        </View>
    )
}

export function CardContent({ children, className, onPress, ...rest }: CardProps) {
    return (
        <Pressable onPress={onPress} className={`w-full bg-branco p-4 rounded-xl shadow-md gap-2 ${className}`} {...rest}>
            {children}
        </Pressable>
    )
}

export function CardFood({ children, className, onPress, title, editType, ...rest }: CardProps){
    return (
        <View className={`${editType ? "border" : "border-y-hairline border-x-0" } ${className} border-cinza-200 rounded-md p-4 flex-row items-center justify-between`} {...rest}>
            <View className="gap-2 w-9/12">
                <Text className='text-preto font-bold text-xl'>{title}</Text>
                {children}
            </View>
            {editType ? 
            <Pressable onPress={onPress} className="w-2/12 items-center justify-center">
                <MaterialIcons name="remove-circle-outline" size={24} color="#DA3939" />
            </Pressable> : ""}
        </View>
    )
}