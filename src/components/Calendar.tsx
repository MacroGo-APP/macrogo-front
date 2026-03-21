import React, { useMemo } from 'react';
import { View } from 'react-native';
import CalendarStrip from 'react-native-calendar-strip';
import moment from "moment";
import "moment/locale/pt-br";
import { useDate } from '../../context/DateContext';

moment.locale("pt-br");

export function Calendar() {
    const { selectedDate, updateDate } = useDate();

    const customDatesStyles = useMemo(() => [{
        startDate: moment(),
        dateNameStyle: { color: "#2C6BCA" },
        dateNumberStyle: { color: "#2C6BCA", fontWeight: "bold" },
        dateContainerStyle: { backgroundColor: "#E6F0FF" },
    }], []);

    const datesWhitelist = useMemo(() => [
        {
            start: moment().subtract(2, 'years'),
            end: moment().endOf('day')
        }
    ], []);

    return (
        <View className="w-full px-4 pt-4 pb-2 bg-branco">
            <CalendarStrip
                style={{
                    height: 90,
                    borderColor: "#B2B2B2",
                    borderBottomWidth: 1,
                    paddingBottom: 4
                }}
                calendarColor="#FFFCF6"

                datesWhitelist={datesWhitelist}
                maxDate={moment().endOf('day')}

                locale={{
                    name: "pt-br",
                    config: {
                        weekdaysShort: ["D", "S", "T", "Q", "Q", "S", "S"],
                        months: [
                            "Janeiro", "Fevereiro", "Março", "Abril",
                            "Maio", "Junho", "Julho", "Agosto",
                            "Setembro", "Outubro", "Novembro", "Dezembro"
                        ]
                    }
                }}

                dateNameStyle={{ color: "#000", fontSize: 12 }}
                dateNumberStyle={{ color: "#000", fontSize: 16, fontWeight: "bold" }}

                disabledDateNameStyle={{ color: "#000000ff", fontSize: 12 }}
                disabledDateNumberStyle={{ color: "#000000ff", fontSize: 16, fontWeight: "bold" }}

                highlightDateContainerStyle={{
                    backgroundColor: "#2C6BCA",
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                }}
                highlightDateNumberStyle={{
                    color: "#FFF",
                    fontSize: 16,
                    fontWeight: "bold"
                }}
                highlightDateNameStyle={{ color: "#FFF" }}

                customDatesStyles={customDatesStyles}
                selectedDate={selectedDate}

                onDateSelected={(date) => {
                    if (moment(date).isAfter(moment(), 'day')) return;
                    updateDate(date);
                }}

                scrollable={false}
            />
        </View>
    );
}