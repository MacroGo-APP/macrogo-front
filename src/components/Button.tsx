import React, { Children, useEffect } from "react";
import { TouchableOpacity, TouchableOpacityProps, Text, Switch, View, Pressable } from "react-native";
import { useState } from "react";
import { Card } from "./Card";

type ButtonProps = TouchableOpacityProps & {
  label?: string;
  children?: React.ReactNode;
  icon?: boolean;
  className?: string;
};

export function Button({ label, icon, className, children, ...props }: ButtonProps) {
  return (
    <TouchableOpacity 
      {...props} 
      className={`${icon ? className : "w-full h-14 justify-center items-center rounded-md mt-5"} bg-azul ${className || ""}`}
    >
      { !icon ? <Text className="text-branco font-bold text-xl">{label}</Text> : ""}
        {children}
    </TouchableOpacity>
  );
}

type SwitchButtonProps = {
  label?: string;
  lastlabel?: string;
  value?: boolean; 
  onValueChange?: (newValue: boolean) => void;
}

export function SwitchButton({ label, lastlabel, value = false, onValueChange }: SwitchButtonProps) {

  return (
    <View className="flex-row items-center gap-3">
      <Text className="text-preto">{label}</Text>
      <Switch 
        value={value} 
        onValueChange={onValueChange} 
        thumbColor={value ? "#2C6BCA" : "#B2B2B2"} 
        trackColor={{ false: "#B2B2B2", true: "#2C6BCA"}}
      />
      {lastlabel && <Text className="text-preto">{lastlabel}</Text>}
    </View>
  )
}

type Option = {
  label: string;
  value: string;
}

type RadioButtonProps = {
  label?: string;
  options: Option[];
  onChange: (value: string) => void;
  direction?: 'row' | 'column';
  className?: string;
  value?: string;
}

export function RadioButton({ label, options, onChange, value, className, direction }: RadioButtonProps) {
  return (
    <View className={`${className ? className : "w-full"} gap-3`}>
      <Text className="text-preto text-xl font-bold">{label}</Text>
      <View className={`gap-3 ${direction === "row" ? "flex-row justify-between": "flex-col"}`}>
        {options.map((opt) => (
          <Pressable key={opt.value} onPress={() => onChange(opt.value)} className="flex-row items-center gap-3">
            <View className="w-6 h-6 rounded-full border-2 border-cinza-200 items-center justify-center">
              {value === opt.value && (
                <View className="w-4 h-4 rounded-full bg-azul"/>
              )}
            </View>
            <Text className="text-preto text-xl">{opt.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

type MultiSelectOption = {
  label: string;
  value: string;
}
type MultiSelectButtonProps = {
  label?: string;
  options: MultiSelectOption[];
  onChange: (selected: string[]) => void;
  selectedValues?: string[];
}

export function MultiSelectButton({ label, options, onChange, selectedValues }: MultiSelectButtonProps) {
  const [selected, setSelected] = useState<string[]>(selectedValues || []);
  
  useEffect(() => {
    if (selectedValues) {
      if (JSON.stringify(selected) !== JSON.stringify(selectedValues)) {
        setSelected(selectedValues);
      }
    }
  }, [selectedValues]);
  
  function toggle(value: string) {
    let update;

    if (selected.includes(value)) {
      update = selected.filter(v => v !== value);
    } else {
      update = [...selected, value];
    }

    setSelected(update);
    onChange?.(update);
  }

  return (
    <View className="gap-2 w-full flex">
      <Text className="text-preto font-bold text-xl">{label}</Text>

      <View className="flex-row justify-around w-full p-2 rounded-xl border-preto border">
        {options.map((opt, index) => {
          const active = selected.includes(opt.value);
          return (
            <Pressable key={index} onPress={() => toggle(opt.value)} className={`h-10 w-10 rounded-full items-center justify-center border ${active ? "bg-azul border-azul": "border-cinza-200"}`}>
              <Text className={`font-bold ${active ? "text-branco" : "text-azul"}`}>{opt.label}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}