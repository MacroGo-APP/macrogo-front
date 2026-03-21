import React from "react";
import { View, Text } from "react-native";

type Props = {
  value: number;
  max: number;
  color?: string;
  label?: string;
};

export function ProgressBar({ value, max, color, label }: Props) {
  const safeMax = max > 0 ? max : 1;
  const percentValue = Math.round((value / safeMax) * 100);
  const visualWidth = Math.min(percentValue, 100);

  return (
    <View className="flex-row gap-3 items-center mb-4">
        
        <View className="flex-1 h-10 bg-cinza-200 rounded-md overflow-hidden relative">
            <View 
                style={{ width: `${visualWidth}%`}} 
                className={`h-full ${color}`}
            />
            
            <View className="absolute inset-0 justify-center pl-3">
                <Text 
                    className="text-preto font-bold text-xl" 
                    style={{ textShadowColor: 'rgba(255, 255, 255, 0.4)', textShadowRadius: 3 }}
                >
                    {percentValue}%
                </Text>
            </View>
        </View>

        <View className="flex-col items-end min-w-[80px]">
            <Text className="text-preto font-bold text-xl">
                {Math.round(value)} <Text className="text-base text-cinza-400 font-normal">/ {max}</Text>
            </Text>
            
            {label && (
                <Text className="text-cinza-400 text-sm font-medium uppercase" numberOfLines={1}>
                    {label}
                </Text>
            )}
        </View>

    </View>
  );
}

export function ProgressBarVertical({ value, max, color }: Props){
    const safeMax = max > 0 ? max : 1;
    const percentValue = Math.round((value / safeMax) * 100);
    const visualHeight = Math.min(percentValue, 100);

    return (
        <View className="w-1/2 items-center gap-2">
            <Text className="font-bold text-preto text-2xl">{max} L</Text>
            <View className="w-20 h-72 bg-cinza-200 rounded-md overflow-hidden justify-end">
                <View 
                    className={`w-full ${color}`} 
                    style={{ height: `${visualHeight}%`}}
                />
            </View>
            <Text className="font-bold text-cinza-400">{percentValue}%</Text>
        </View>
    )
}