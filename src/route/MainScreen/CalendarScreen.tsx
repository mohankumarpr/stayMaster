import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { ImageBackground, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { CalendarList, DateData } from 'react-native-calendars';
import PropertyService from '../../services/propertyService';
import { Property } from '../../types/property';

const CalendarScreen: React.FC = () => {
    const [selectedProperty, setSelectedProperty] = useState('');
    const [properties, setProperties] = useState<Property[]>([]);
    const [markedDates, setMarkedDates] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProperties();
    }, []);

    useEffect(() => {
        if (selectedProperty) {
            fetchCalendarData();
        }
    }, [selectedProperty]);

    const fetchProperties = async () => {
        try {
            const response = await PropertyService.getAllProperties();
            setProperties(response.properties || []);
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCalendarData = async () => {
        try {
            setLoading(true);
            const response = await PropertyService.getPropertyCalendar(selectedProperty);
            const bookings = response.calendar.bookings;
            
            // Group bookings by booking_id
            const bookingGroups = bookings.reduce((acc: { [key: string]: any[] }, booking) => {
                if (!acc[booking.booking_id]) {
                    acc[booking.booking_id] = [];
                }
                acc[booking.booking_id].push(booking);
                return acc;
            }, {});

            // Convert bookings to period marking format
            const marked: any = {};
            Object.values(bookingGroups).forEach(bookingGroup => {
                // Sort dates in the group
                bookingGroup.sort((a, b) => 
                    new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime()
                );

                // Get first and last dates
                const firstDate = bookingGroup[0].effectiveDate.split('T')[0];
                const lastDate = bookingGroup[bookingGroup.length - 1].effectiveDate.split('T')[0];

                // Mark first date
                marked[firstDate] = {
                    startingDay: true,
                    color: '#50cebb',
                    textColor: 'white'
                };

                // Mark last date
                marked[lastDate] = {
                    endingDay: true,
                    color: '#50cebb',
                    textColor: 'white'
                };

                // Mark middle dates
                bookingGroup.slice(1, -1).forEach(booking => {
                    const date = booking.effectiveDate.split('T')[0];
                    marked[date] = {
                        color: '#50cebb',
                        textColor: 'white'
                    };
                });
            });

            setMarkedDates(marked);
        } catch (error) {
            console.error('Error fetching calendar data:', error);
        } finally {
            setLoading(false);
        }
    };

    const onDayPress = (day: DateData) => {
        console.log('selected day', day);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#008489" />

            {/* Top portion with curved image background */}
            <View style={styles.topContainer}>
                <ImageBackground
                    source={require('../../assets/images/curved_bg.png')}
                    style={styles.topBackground}
                    resizeMode="cover"
                >
                    <SafeAreaView>
                        <View style={styles.header}>
                            <View style={styles.userInfo}>
                                <View>
                                    <Text style={styles.welcomeText}>Calendar</Text>
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                </ImageBackground>
            </View>

            {/* Content Area */}
            <View style={styles.contentArea}>
                <View style={styles.calendarSection}>
                    <Text style={styles.sectionTitle}>Select property</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedProperty}
                            onValueChange={(itemValue) => setSelectedProperty(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select a property" value="" />
                            {properties.map((property) => (
                                <Picker.Item
                                    key={property.id}
                                    label={property.listing_name}
                                    value={property.id}
                                />
                            ))}
                        </Picker>
                    </View>

                    {loading && (
                        <View style={styles.loadingContainer}>
                            <Text>Loading calendar...</Text>
                        </View>
                    )}

                    {selectedProperty && !loading && (
                        <View style={styles.calendarContainer}>
                            <CalendarList
                                style={styles.calendar}
                                onDayPress={onDayPress}
                                markingType={'period'}
                                markedDates={markedDates}
                                pastScrollRange={12}
                                futureScrollRange={12}
                                scrollEnabled={true}
                                showScrollIndicator={true}
                                calendarHeight={360}
                                firstDay={0}
                                theme={{
                                    backgroundColor: '#ffffff',
                                    calendarBackground: '#ffffff',
                                    textSectionTitleColor: '#b6c1cd',
                                    selectedDayBackgroundColor: '#50cebb',
                                    selectedDayTextColor: '#ffffff',
                                    todayTextColor: '#50cebb',
                                    dayTextColor: '#2d4150',
                                    textDisabledColor: '#d9e1e8',
                                    dotColor: '#50cebb',
                                    selectedDotColor: '#ffffff',
                                    arrowColor: '#50cebb',
                                    monthTextColor: '#2d4150',
                                    textDayFontFamily: 'monospace',
                                    textMonthFontFamily: 'monospace',
                                    textDayHeaderFontFamily: 'monospace',
                                    textDayFontSize: 16,
                                    textMonthFontSize: 16,
                                    textDayHeaderFontSize: 16
                                }}
                                dayNames={['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']}
                                dayNamesShort={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                            />
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    topContainer: {
        height: 120,
    },
    topBackground: {
        width: '100%',
        height: '100%',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    welcomeText: {
        color: 'white',
        fontSize: 14,
        opacity: 0.9,
    },
    contentArea: {
        flex: 1,
        marginTop: -20,
    },
    calendarSection: {
        backgroundColor: '#f8f8f8',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingHorizontal: 15,
        paddingTop: 20,
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        marginLeft: 5,
        color: '#333',
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginHorizontal: 5,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    picker: {
        height: 50,
        width: '100%',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    calendarContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        flex: 1,
    },
    calendar: {
        marginBottom: 10,
    },
});

export default CalendarScreen;
