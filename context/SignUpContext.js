// Arquivo: context/SignUpContext.js
import React, { createContext, useState, useContext } from 'react';

// --- A CORREÇÃO ESTÁ AQUI ---
// Em vez de createContext({}), definimos o "esqueleto" inicial.
// Isso faz o erro sumir e o VS Code sugerir as variáveis para você.
const SignUpContext = createContext({
    userData: {
        Name: '',
        Email: '',
        Password: '',
        Date: '',
        Sex: '',
        Height: '',
        Weight: '',
        ActivityLevel: '',
        Objective: '',
        DoesMusculation: false,
        MuscleDays: [],
        MuscleDuration: 0,
        MuscleIntensity: '',
        DoesCardio: false,
        CardioDays: [],
        CardioDuration: 0,
        CardioIntensity: '',
        TargetProtein: 0,
        TargetFat: 0
    },
    updateUserData: (newData) => {} // Função vazia só para o editor saber que existe
});

export function SignUpProvider({ children }) {
    const [userData, setUserData] = useState({
        Name: '',
        Email: '',
        Password: '',
        Date: '',
        Sex: '',
        Height: '',
        Weight: '',
        ActivityLevel: '',
        Objective: '',
        DoesMusculation: false,
        MuscleDuration: 0,
        MuscleIntensity: '',
        DoesCardio: false,
        CardioDuration: 0,
        CardioIntensity: '',
        TargetProtein: 0,
        TargetFat: 0
    });

    function updateUserData(newData) {
        setUserData((prev) => {
            const updated = { ...prev, ...newData };
            // Deixei o log para você ver a "mochila" enchendo no terminal
            console.log("Dados atuais na mochila:", updated);
            return updated;
        });
    }

    return (
        <SignUpContext.Provider value={{ userData, updateUserData }}>
            {children}
        </SignUpContext.Provider>
    );
}

export function useSignUp() {
    return useContext(SignUpContext);
}