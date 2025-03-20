import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { ImageBackground, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarList, DateData } from 'react-native-calendars';
import 'react-native-reanimated';
import { useProperty } from '../../context/PropertyContext';
import PropertyService from '../../services/propertyService';
import { Property } from '../../types/property';

const CalendarScreen: React.FC = () => {
    const { selectedProperty, setSelectedProperty } = useProperty();
    const [properties, setProperties] = useState<Property[]>([]);
    const [markedDates, setMarkedDates] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [bookingGroups, setBookingGroups] = useState<{ [key: string]: any[] }>({});

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
            const propertyList = response.properties || [];
            setProperties(propertyList);

            // Set the first property as default if no property is selected
            if (propertyList.length > 0 && !selectedProperty) {
                setSelectedProperty(propertyList[0].id.toString());
            }
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
            const groups = bookings.reduce((acc: { [key: string]: any[] }, booking) => {
                if (!acc[booking.booking_id]) {
                    acc[booking.booking_id] = [];
                }
                acc[booking.booking_id].push(booking);
                return acc;
            }, {});

            // Store booking groups in state
            setBookingGroups(groups);

            // Convert bookings to period marking format
            const marked: any = {};
            Object.values(groups).forEach(bookingGroup => {
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
        const selectedDate = day.dateString;
        console.log("onDaypress", day, bookingGroups);
        // Now we can use bookingGroups from state
        Object.values(bookingGroups).forEach(bookingGroup => {
            const firstDate = bookingGroup[0].effectiveDate.split('T')[0];
            const lastDate = bookingGroup[bookingGroup.length - 1].effectiveDate.split('T')[0];
            
            if (selectedDate >= firstDate && selectedDate <= lastDate) {
                console.log("bookingGroup[0]", bookingGroup[0]);
                setSelectedBooking(bookingGroup[0]);
                // bottomSheetRef.current?.expand();
            }
        });
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
                            mode="dropdown"
                            dropdownIconColor="#000"
                            
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
                                /* dayNames={['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']}
                                dayNamesShort={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']} */
                            />
                        </View>
                    )}
                </View>
            </View>
            {/* Bottom Sheet */}
            {/* <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={['50%']}
                enablePanDownToClose
                backgroundStyle={styles.bottomSheetBackground}
            >
                <View style={styles.bottomSheetContent}>
                    {selectedBooking ? (
                        <>
                            <Text style={styles.bookingTitle}>Booking Details</Text>
                            <View style={styles.bookingDetail}>
                                <Text style={styles.label}>Booking ID:</Text>
                                <Text style={styles.value}>{selectedBooking.booking_id}</Text>
                            </View>
                            <View style={styles.bookingDetail}>
                                <Text style={styles.label}>Check-in:</Text>
                                <Text style={styles.value}>
                                    {new Date(selectedBooking.effectiveDate).toLocaleDateString()}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.closeButton}
                                onPress={() => bottomSheetRef.current?.close()}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <Text style={styles.noBookingText}>No booking details available</Text>
                    )}
                </View>
            </bottomSheet> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    topContainer: {
        height: 80,
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
        color: '#000',
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
    bottomSheetBackground: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
    },
    bottomSheetContent: {
        padding: 20,
    },
    bookingTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    bookingDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    label: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    value: {
        fontSize: 16,
        color: '#333',
    },
    closeButton: {
        backgroundColor: '#50cebb',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    noBookingText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
    },
});

export default CalendarScreen;
