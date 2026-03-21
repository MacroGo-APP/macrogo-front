import React, { useState } from "react";
import { TextInput, TextInputProps, Text, View, Modal, Pressable, FlatList, Platform } from "react-native";
import { Entypo } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

type InputProps = TextInputProps & {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  password?: boolean;
  date?: boolean;
  className?: string;
  chat?: boolean;
};

export function Input({ label, placeholder, password = false, date = false, className, chat = false, disabled, value, onChangeText, ...rest }: InputProps) {
  const [showPicker, setShowPicker] = useState(false);

  function openPicker() {
    if (!disabled) setShowPicker(true);
  }

  function onChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === "set" && selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString("pt-BR");
      
      if (onChangeText) {
        onChangeText(formattedDate);
      }
    } else {
        setShowPicker(false);
    }
  }

  const getDateObject = () => {
    if (!value) return new Date();
    try {
        const parts = value.split('/');
        if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return new Date();
    } catch {
        return new Date();
    }
  }

  return (
    <View className={`${chat ? className : "w-full max-w-[320px]"} gap-2`}>
      
        { !chat ? <Text className="text-preto text-xl font-bold">{label}</Text> : ""}
        
        { date ? (
          <View>
            <Pressable onPress={openPicker} className="border h-14 bg-transparent px-2 w-full rounded-md border-preto justify-center">
              <Text className={value ? "text-preto text-lg" : "text-cinza-200 text-lg"}>
                { value || placeholder || "Selecione a data"}
              </Text>
            </Pressable>

            { showPicker && (
              <DateTimePicker 
                value={getDateObject()} 
                mode="date" 
                display="default" 
                onChange={onChange}
                maximumDate={new Date()} 
              />
            )}
          </View>
        ) : (
            <TextInput 
                className={`border h-14 bg-transparent px-2 w-full rounded-md border-preto`} 
                placeholder={placeholder} 
                secureTextEntry={password} 
                value={value}
                onChangeText={onChangeText}
                {...rest}
            />
        )}
    </View>
  )
}

export function InputArea({ label, placeholder, disabled, ...rest }: InputProps) {
  return (
    <View className="w-full max-w-[320px] gap-2">
        <Text className="text-preto">{label}</Text>
        <TextInput multiline numberOfLines={6} textAlignVertical="top" className="border pt-2 h-28 bg-transparent px-2 w-full rounded-md border-preto" placeholder={placeholder} {...rest}/>
    </View>
  )
}

type SelectOption ={
  label: string;
  value: string;
}

type SelectProps = {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  value?: string;
}

export function InputSelect({ label, placeholder, options, onSelect, value }: SelectProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find(opt => opt.value === value)?.label;

  return (
    <View className="w-full max-w-[320px] gap-2">
      <Text className="text-preto text-xl font-bold">{label}</Text>

      <Pressable onPress={() => setOpen(true)} className="
      flex-row justify-between items-center border h-14 bg-transparent px-2 w-full rounded-md border-preto">
        <Text className={value ? "text-preto font-medium text-xl" : "text-cinza-200 text-xl"}>
          {selectedLabel || placeholder || 'Selecione uma opção'}
        </Text>
        <Entypo name="chevron-down" size={20} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable className="flex-1 justify-center items-center bg-preto/50" onPress={() => setOpen(false)}>
          <View className="bg-branco p-4 rounded-md w-72 max-h-80">
            <FlatList data={options} keyExtractor={(item) => item.value} renderItem={({ item }) => (
              <Pressable className="p-3 border-b border-cinza-100" onPress={() => {
                onSelect(item.value);
                setOpen(false);
              }}>
                <Text className="text-preto text-xl font-medium">{item.label}</Text>
              </Pressable>
            )}>
            </FlatList>
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}