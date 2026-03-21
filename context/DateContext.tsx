import React, { createContext, useState, useContext, ReactNode } from 'react';
import moment from 'moment';

interface DateContextData {
    selectedDate: any; 
    updateDate: (date: any) => void;
}

const DateContext = createContext<DateContextData>({} as DateContextData);

export function DateProvider({ children }: { children: ReactNode }) {
    const [selectedDate, setSelectedDate] = useState(moment());

    function updateDate(date: any) {
        setSelectedDate(date);
    }

    return (
        <DateContext.Provider value={{ selectedDate, updateDate }}>
            {children}
        </DateContext.Provider>
    );
}

export function useDate() {
    return useContext(DateContext);
}