import BottomSheet from '@gorhom/bottom-sheet';
import React, { useEffect, useRef, useState } from 'react';
import {
    Image,
    ImageBackground,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Calendar, CalendarList, DateData } from 'react-native-calendars';
import 'react-native-gesture-handler';
// import 'react-native-reanimated';
import { faAdd, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { StackNavigationProp } from '@react-navigation/stack';
import { ActivityIndicator } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Toast from 'react-native-toast-message';
import { useProperty } from '../../context/PropertyContext';
import { RootStackParamList } from '../../navigation/AppNavigator';
import PropertyService from '../../services/propertyService';
import { Property } from '../../types/property';
import Storage from '../../utils/Storage';



/* booking_id: string;
    effectiveDate: string;
    guest_name?: string;
    guest_phone?: string;
    guest_email?: string;
    checkin_date?: string;
    checkout_date?: string;
    duration?: string; */
interface BookingData {
    end: any;
    start: any;
    currentStatus: any;
    id: any;
    number_of_bedrooms?: number;
    maintenance?: boolean;
    title?: string;
    status?: string;
    type?: string;
}

type CalendarScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'Calendar'>;
};

const getTimeSession = (): string => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return 'Morning';
    } else if (hour >= 12 && hour < 17) {
        return 'Afternoon';
    } else if (hour >= 17 && hour < 20) {
        return 'Evening';
    } else {
        return 'Night';
    }
};

interface LegendItemProps {
    color: string;
    label: string;
}
const LegendItem: React.FC<LegendItemProps> = ({ color, label }) => {
    return (
        <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{label}</Text>
        </View>
    );
};

// Custom Day Component for overlapping and normal days
const CustomDay = ({ date, state, marking }: { date: any, state: any, marking: any }) => {
    if (marking && marking.leftColor && marking.rightColor) {
        return (
            <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent',
                overflow: 'hidden',
            }}>
                {/* Left color fill */}
                <View style={{
                    position: 'absolute',
                    left: 0,
                    width: '54%',
                    height: 36,
                    backgroundColor: marking.leftColor,
                    borderTopRightRadius: 18,
                    borderBottomRightRadius: 18,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                }} />
                {/* Right color fill */}
                <View style={{
                    position: 'absolute',
                    right: 0,
                    width: '54%',
                    height: 36,
                    backgroundColor: marking.rightColor,
                    borderTopLeftRadius: 18,
                    borderBottomLeftRadius: 18,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                }} />
                {/* Centered date number */}
                <Text style={{
                    color: 'white',
                    zIndex: 2,
                    textAlign: 'center',
                    fontSize: 14,
                }}>
                    {date.day}
                </Text>
            </View>
        );
    }
    // Fallback to default rendering for non-overlapping days
    if (marking && marking.customStyles) {
        return (
            <View style={[{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', overflow: 'hidden' }, marking.customStyles.container]}>
                <Text style={[{ color: state === 'disabled' ? '#d9e1e8' : 'white', fontSize: 14 }, marking.customStyles.text]}>
                    {date.day}
                </Text>
            </View>
        );
    }
    // Default day
    return (
        <View style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', overflow: 'hidden' }}>
            <Text style={{ color: state === 'disabled' ? '#d9e1e8' : 'black', fontSize: 14 }}>{date.day}</Text>
        </View>
    );
};

const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
    const { selectedProperty, setSelectedProperty, numberOfBedrooms, setNumberOfBedrooms } = useProperty();
    const [properties, setProperties] = useState<Property[]>([]);
    const [markedDates, setMarkedDates] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
    const bottomSheetRef = useRef<BottomSheet>(null);

    const [bookingGroups, setBookingGroups] = useState<{ [key: string]: BookingData[] }>({});
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().split('T')[0].substring(0, 7));
    const [timeSession, setTimeSession] = useState<string>(getTimeSession());

    useEffect(() => {
        fetchProperties();
    }, []);

    useEffect(() => {
        if (selectedProperty) {
            fetchCalendarData();
        }
    }, [selectedProperty]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeSession(getTimeSession());
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await PropertyService.getAllProperties();
            const propertyList = response.properties || [];
            // Adding the dummy record to the property list
            /*   propertyList.push({
                  id: "43", // Changed from number to string
                  listing_name: "Test ",
                  internal_name: "Cranberry Corner ",
                  number_of_bedrooms: 4,
                  number_of_bathrooms: 4,
                  number_of_guests: 8,
                  number_of_extra_guests: 2,
                  google_latitude: "15.4612813771341",
                  google_longitude: "73.81050413558205",
                  address_line_1: "Staymaster Cranberry Corner (centre villa) ",
                  address_line_2: "La Citadel Colony  Durgavado",
                  city: "Dona Paula",
                  state: "Goa",
                  country: 14,
                  media_filename: "126_display_image.jpg",
                  url: "https://staymaster.s3.ap-south-1.amazonaws.com/property/126/126_display_image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA2VBA7ZYA7ET7KSK3%2F20250401%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250401T141447Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFUaCmFwLXNvdXRoLTEiRjBEAiBDjo3l%2Fbt8%2F%2BOX2V%2B9zd15yUh43oTc8QSsigI4dAs09gIgBto7EX5nDHMoco2iBLaRC8vO6Bbq8I2cTtYYzMhINE0qyQUIvv%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw3MzIzNjExMTcxODUiDAgHN7fKOWfOT0AcWCqdBcnD0T6hTZcQ2JGWFYofI5o%2BM%2F3WUsj6yI7u0YKigRHcA1TkSoa8TpuuzpFHUneM6xYUM%2F%2B1DMs7ocMpFm2LWwK93CSBsJ1u2JQWfXZiKo5s5Wy3EsO1JxAVoIf7rSM0weI2UxYMcpFM%2BftBGj89fDmw5FRtPu2GtKPn3%2BpF%2BLm83zN2cOW0cODsaEk5P6U%2BX6XLLgnGQtwHzG18qUO3XqMxSmwD6NV63x8chqrCqGV%2F%2FoX9TNzTrC05V%2BkOY%2FdL2PYLVg1S2bfPaXy9jX37IJ%2BxsNxhM1TY%2Fz4kRVSeI1MligLQ9t9XWc3LV%2B7Bxr3H9nhEZ2QrY%2BD9TNh3K2PTLTWjha1cnRNTR%2BsIemoQSmhXNWahjrJG0Ru0pzWweYZJFrQuX3b8IWNaR4dU%2Butd%2F%2Fyr2%2BCJ6Rlbek4sYU05SN%2B7IUQFlCx9W6WwDnVvkEqkE7FYEAtIQeYEAjh5e7Mr1NCbkdMKx0rMIYM2yCF41Fq4m%2B5wNJeyVxrdaiKHgk3Me8QJNoyDiaDEBgZM%2BgkU40DX4nKmi6gw6AWitizEy9GAAE2n2a01sAzcJuOgVkd%2FRpT3%2BRtxcicE82LMLXyC%2FvHEhfOKudnelqiLEf6OYYwCoocrlDJcIxrAPiXDMFwgnWQ27yyQkxz8%2Ff6%2B43s%2BqR4apQqlHc5Mzx9mZAasXCO1bz8tyYrnZp24Bfkn7k1pUlH4xHnsBFTCTtE9iqnsC99jXvKwtuqOsrFKzqehkygliQSlaO6O7flfH562rKxs%2F1BhHMOhVZ8Dd3tpxhpF%2FBcI%2FoL1r1JxVIRXbsraEaHVIw1gRl1BtEO8U9LT9rMCJKM468lle1rty6GVpc1T4Uj0e6SwPvMURt0HY0ds6%2BnLHCz09P6qjwOS%2Buw2ITDKy6%2B%2FBjqyAZ6syFLUxm0V%2FikgtNZ295un0D6JvOf1dart0dcpL8heCPHH2rPc5CpYi7XdCZl3tKNgkXfGUbPwU%2BaGKIRBUbiebmsDQJR5AKcqmqO2i01PdTi7QH%2FbzSV1FlBMONJEnZ6bo1TcXMwzudlX1puocWwmn1New0XvYolRw7bNZbe5TKcEuEVvWu1g1HAvojDBWYL0hKF4x7Sw1TByST0yFePDB0%2Fs2JWHkTu38%2FZBlhNVpoI%3D&X-Amz-Signature=d7655d87de54371848cfa5fef5109d5e1df9a95407791539870ee7fb60ed9dc0&X-Amz-SignedHeaders=host",
                  nbv: 1064223,
                  nights: 81,
                  average_rating: undefined,
                  total_reviews: undefined,
                  earnings: [],
                  location: '',
                  image: '',
                  amenities: [],
                  description: '',
                  number_of_beds: 0
              }); */

            setProperties(propertyList);

            // Set the first property as default if no property is selected
            if (propertyList.length > 0 && !selectedProperty) {
                setSelectedProperty(propertyList[0].id.toString());
                const property = propertyList[0];
                setNumberOfBedrooms(property.number_of_bedrooms || 0);
                console.log('Number of Bedrooms:', numberOfBedrooms);
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
            const bookings = response.calendar;

            const groups = bookings.reduce((acc: { [key: string]: any[] }, booking: any) => {
                if (!acc[booking.id]) {
                    acc[booking.id] = [];
                }
                acc[booking.id].push(booking);
                return acc;
            }, {});

            setBookingGroups(groups as any);
            const marked: any = {};

            // First mark all regular dates
            Object.values(groups).forEach(bookingGroup => {
                const type = bookingGroup[0].type;
                let color = '';
                if (type === 'Owner block') {
                    color = '#FFC107';
                } else if (type === 'Booking') {
                    color = '#50cebb';
                } else if (type === 'Maintenance block') {
                    color = '#FF5252';
                }

                const firstDate = bookingGroup[0].start;
                const lastDate = bookingGroup[0].end;

                // Mark start date
                if (!marked[firstDate]?.endingDay) { // Only mark if not already marked as an end date
                    marked[firstDate] = {
                        startingDay: true,
                        color: color,
                        customStyles: {
                            container: {
                                backgroundColor: color,
                                width: '50%',
                                marginLeft: '50%',
                                borderTopLeftRadius: 20,
                                borderBottomLeftRadius: 20,
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                            },
                            text: {
                                color: 'white',
                            },
                        },
                    };
                }

                // Mark end date
                if (!marked[lastDate]?.startingDay) { // Only mark if not already marked as a start date
                    marked[lastDate] = {
                        endingDay: true,
                        color: color,
                        customStyles: {
                            container: {
                                backgroundColor: color,
                                width: '45%',
                                marginRight: '55%',
                                borderTopRightRadius: 20,
                                borderBottomRightRadius: 20,
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                            },
                            text: {
                                color: 'white',
                            },
                        },
                    };
                }

                // Mark middle dates
                const currentDate = new Date(firstDate);
                const endDate = new Date(lastDate);

                while (currentDate <= endDate) {
                    const dateString = currentDate.toISOString().split('T')[0];
                    if (dateString !== firstDate && dateString !== lastDate) {
                        marked[dateString] = {
                            color: color,
                            customStyles: {
                                container: {
                                    backgroundColor: color,
                                    width: '100%',
                                    borderRadius: 0,
                                },
                                text: {
                                    color: 'white',
                                }
                            }
                        };
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            });

            // Then handle overlapping dates
            Object.values(groups).forEach(bookingGroup => {
                const endDate = bookingGroup[0].end;

                const overlappingBooking = Object.values(groups).find(
                    group => group[0].start === endDate && group[0].id !== bookingGroup[0].id
                );

                if (overlappingBooking) {
                    const currentColor = bookingGroup[0].type === 'Owner block' ? '#FFC107' : 
                                       bookingGroup[0].type === 'Booking' ? '#50cebb' : '#FF5252';

                    const nextColor = overlappingBooking[0].type === 'Owner block' ? '#FFC107' : 
                                     overlappingBooking[0].type === 'Booking' ? '#50cebb' : '#FF5252';

                    marked[endDate] = {
                        leftColor: currentColor,
                        rightColor: nextColor,
                    };
                }
            });

            setMarkedDates(marked);
        } catch (error: any) {
            console.error('Error fetching calendar data:', error);

            // Handle authentication errors
            if (error.message === 'Guest token not found' || error.response?.status === 401) {
                Toast.show({
                    type: 'error',
                    text1: 'Session Expired',
                    text2: 'Please log in again to continue.',
                    position: 'top',
                    visibilityTime: 4000,
                });

                await Storage.clear();

                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const onDayPress = (day: DateData) => {
        console.log("Day pressed:", day.dateString);
        let bookingId = null;
        const selectedDate = day.dateString;
        let bookingFound = false;

        Object.values(bookingGroups).forEach(bookingGroup => {
            console.log("bookingGroup", bookingGroup);
            const firstDate = bookingGroup[0].start;
            const lastDate = bookingGroup[bookingGroup.length - 1].end;

            if (selectedDate >= firstDate && selectedDate <= lastDate) {
                console.log("Booking found for date:", selectedDate);
                const startDate = bookingGroup[0].start;
                const endDate = bookingGroup[bookingGroup.length - 1].end;
                bookingId = bookingGroup[0].id;
                const type = bookingGroup[0].type;

                if (type?.toLowerCase() === 'booking') {
                    navigation.navigate('CalendarInfo', { bookingId, startDate, endDate, numberOfBedrooms, type } as any);
                } else if (type?.toLowerCase() === 'owner block' || type?.toLowerCase() === 'maintenance block') {
                    navigation.navigate('BlockInfoScreen', { bookingId, startDate, endDate, numberOfBedrooms, type } as any);
                    navigation.addListener('focus', () => {
                        fetchCalendarData();
                    });
                }
                bookingFound = true;
            }
        });

        if (!bookingFound) {
            console.warn('No booking found for the selected date.');
            navigation.navigate('UnblockBlockScreen', { propertyId: selectedProperty, date: selectedDate } as any);
            navigation.addListener('focus', () => {
                fetchCalendarData();
            });
        }
    };

    const onMonthChange = (month: any) => {
        setSelectedMonth(month.dateString.substring(0, 7));
    };

    // Get current visible month in text format
    const getCurrentMonthText = () => {
        const month = new Date(selectedMonth + "-01").toLocaleString('default', { month: 'long' });
        const year = selectedMonth.split('-')[0];
        return `${month} ${year}`;
    };

    const renderSelectedPropertyName = () => {
        if (!selectedProperty) return "Select Property";
        const property = properties.find(p => p.id === selectedProperty);
        return property ? property.listing_name : "Select Property";
    };

    const showToast = (message: string) => {
        Toast.show({
            text1: message,
            type: 'error',
            position: 'bottom',
            visibilityTime: 3000,
            autoHide: true,
        });
    }

    // Format items for picker
    const pickerItems = properties.map(property => ({
        label: property.listing_name || 'Unnamed Property',
        value: property.id.toString(),
        key: property.id.toString()
    }));

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
                        <View style={styles.userInfo}>
                            <Image source={require('../../assets/images/StayMaster-Logo.png')} style={styles.avatar} />
                            <View>
                                <Text style={styles.welcomeText}>Calendar</Text>
                            </View>
                        </View>
                    </SafeAreaView>
                </ImageBackground>
            </View>

            {/* Content Area */}
            <View style={styles.contentArea}>
                <View style={styles.calendarSection}>
                    <Text style={styles.sectionTitle}>Select property</Text>
                    <View style={styles.pickerWrapper}>
                        <RNPickerSelect
                            onValueChange={(value) => {
                                if (value) {
                                    setSelectedProperty(value);
                                    const property = properties.find(p => p.id.toString() === value);
                                    setNumberOfBedrooms(property?.number_of_bedrooms || 0);
                                }
                            }}
                            items={pickerItems}
                            value={selectedProperty}
                            style={pickerSelectStyles}
                            useNativeAndroidPickerStyle={false}
                            placeholder={{
                                label: 'Select a property',
                                value: null,
                                color: '#9EA0A4',
                            }}
                            Icon={() => (
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    size={16}
                                    color="#666"
                                    style={{ marginRight: 12 }}
                                />
                            )}
                        />
                    </View>
                    <View style={styles.legendContainer}>
                        <LegendItem color="#50cebb" label="Guest" />
                        <LegendItem color="#FFC107" label="Owner" />
                        <LegendItem color="#FF5252" label="Maintenance" />
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#008489" />
                            <Text style={styles.loadingText}>Loading calendar data...</Text>
                        </View>
                    ) : (
                        selectedProperty && (
                            <View style={styles.calendarContainer}>
                                <CalendarList
                                    style={styles.calendar}
                                    onDayPress={onDayPress}
                                    onMonthChange={onMonthChange}
                                    markingType="custom"
                                    markedDates={markedDates}
                                    pastScrollRange={12}
                                    futureScrollRange={12}
                                    scrollEnabled={true}
                                    showScrollIndicator={true}
                                    calendarHeight={360}
                                    firstDay={0}
                                    hideExtraDays={false}
                                    showSixWeeks={true}
                                    disableMonthChange={false}
                                    enableSwipeMonths={true}
                                    dayComponent={({ date, state, marking }: { date: DateData, state: string, marking: any }) => (
                                        <TouchableOpacity 
                                            onPress={() => onDayPress(date)}
                                            activeOpacity={0.7}
                                            style={{
                                                flex: 1,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative',
                                                width: '100%',
                                                height: '100%',
                                                backgroundColor: 'transparent',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {marking && marking.leftColor && marking.rightColor ? (
                                                <>
                                                    <View style={{
                                                        position: 'absolute',
                                                        left: 0,
                                                        width: '54%',
                                                        height: 36,
                                                        backgroundColor: marking.leftColor,
                                                        borderTopRightRadius: 18,
                                                        borderBottomRightRadius: 18,
                                                        borderTopLeftRadius: 0,
                                                        borderBottomLeftRadius: 0,
                                                    }} />
                                                    <View style={{
                                                        position: 'absolute',
                                                        right: 0,
                                                        width: '54%',
                                                        height: 36,
                                                        backgroundColor: marking.rightColor,
                                                        borderTopLeftRadius: 18,
                                                        borderBottomLeftRadius: 18,
                                                        borderTopRightRadius: 0,
                                                        borderBottomRightRadius: 0,
                                                    }} />
                                                    <Text style={{
                                                        color: 'white',
                                                        zIndex: 2,
                                                        textAlign: 'center',
                                                        fontSize: 14,
                                                    }}>
                                                        {date.day}
                                                    </Text>
                                                </>
                                            ) : marking && marking.customStyles ? (
                                                <View style={[{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', overflow: 'hidden' }, marking.customStyles.container]}>
                                                    <Text style={[{ color: state === 'disabled' ? '#d9e1e8' : 'white', fontSize: 14 }, marking.customStyles.text]}>
                                                        {date.day}
                                                    </Text>
                                                </View>
                                            ) : (
                                                <View style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', overflow: 'hidden' }}>
                                                    <Text style={{ color: state === 'disabled' ? '#d9e1e8' : 'black', fontSize: 14 }}>{date.day}</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    )}
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
                                        textMonthFontSize: 16,
                                        textDayFontSize: 12,
                                        textDayHeaderFontSize: 12,
                                        'stylesheet.calendar.main': {
                                            week: {
                                                marginTop: 0,
                                                marginBottom: 0,
                                                flexDirection: 'row',
                                                justifyContent: 'space-around',
                                                borderBottomWidth: 1,
                                                borderBottomColor: '#d5fff8',
                                            },
                                            dayContainer: {
                                                borderRightWidth: 1,
                                                borderRightColor: '#d5fff8',
                                                flex: 1,
                                                alignItems: 'center',
                                            }
                                        },
                                        'stylesheet.calendar.header': {
                                            week: {
                                                marginTop: 5,
                                                marginBottom: 5,
                                                flexDirection: 'row',
                                                justifyContent: 'space-around',
                                                paddingHorizontal: 5,
                                                borderBottomWidth: 1,
                                                borderBottomColor: '#d5fff8',
                                            },
                                            dayHeader: {
                                                marginTop: 2,
                                                marginBottom: 7,
                                                width: 32,
                                                textAlign: 'center',
                                                fontSize: 12,
                                                color: '#b6c1cd',
                                            }
                                        }
                                    }}
                                />
                            </View>
                        )
                    )}
                </View>
            </View>

            {/* Bottom Sheet */}
            {/* <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['25%', '60%']}
        enablePanDownToClose
        backgroundStyle={styles.bottomSheetBackground}
      >
        <View style={styles.bottomSheetContent}>
          {selectedBooking ? (
            <>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingTitle}>{selectedBooking.title || "Booking Details"}</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => bottomSheetRef.current?.close()}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              {selectedBooking.maintenance ? (
                <View style={styles.maintenanceContainer}>
                  <View style={styles.maintenanceMarker}>
                    <Text style={styles.maintenanceMarkerText}>M</Text>
                  </View>
                  <Text style={styles.maintenanceText}>Maintenance Block</Text>
                </View>
              ) : null}

              <View style={styles.divider} />
              
              {!selectedBooking.maintenance && (
                <View style={styles.guestSection}>
                  <View style={styles.bookingDetail}>
                    <Text style={styles.label}>Guest</Text>
                    <Text style={styles.value}>{selectedBooking.guest_name}</Text>
                  </View>
                  
                  <View style={styles.bookingDetail}>
                    <Text style={styles.label}>Phone</Text>
                    <Text style={styles.value}>{selectedBooking.guest_phone}</Text>
                  </View>
                  
                  <View style={styles.bookingDetail}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{selectedBooking.guest_email}</Text>
                  </View>
                </View>
              )}
              
              {selectedBooking.maintenance && (
                <View style={styles.maintenanceSection}>
                  <View style={styles.bookingDetail}>
                    <Text style={styles.label}>Title</Text>
                    <Text style={styles.value}>{renderSelectedPropertyName()}</Text>
                  </View>
                  
                  <View style={styles.bookingDetail}>
                    <Text style={styles.label}>Duration info</Text>
                    <Text style={styles.value}>{selectedBooking.guest_phone}</Text>
                  </View>
                </View>
              )}
              
              <View style={styles.divider} />
              
              <View style={styles.dateSection}>
                <Text style={styles.dateRangeText}>
                  {new Date(selectedBooking.checkin_date || "").toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - {new Date(selectedBooking.checkout_date || "").toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                </Text>
                <TouchableOpacity style={styles.editButton}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.noBookingText}>No booking details available</Text>
          )}
        </View>
      </BottomSheet> */}


            {/*    <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={['25%', '50%']}
            >
                <View>
                    <Text>{selectedBooking?.title || 'Booking Details'}</Text>
                </View>
            </BottomSheet> */}


            {/* Bottom Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity style={styles.tabItem}>
                    <Image
                        source={require('../../assets/images/calender.png')}
                        style={styles.tabIcon}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <Image
                        source={require('../../assets/images/calender.png')}
                        style={styles.tabIcon}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tabItem, styles.activeTab]}>
                    <Image
                        source={require('../../assets/images/calender.png')}
                        style={[styles.tabIcon, styles.activeTabIcon]}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <Image
                        source={require('../../assets/images/calender.png')}
                        style={styles.tabIcon}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>

            {/* Floating Action Button for Reserve Property */}
            {/* <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => {
                    const propertyId = selectedProperty?.toString() || '';
                    console.log('selectedProperty', selectedProperty);
                    if (!selectedProperty) {
                        showToast('Please select a property');
                        return;
                    }
                    navigation.navigate('UnblockBlockScreen', { propertyId } as any);
                    navigation.addListener('focus', () => {
                        fetchCalendarData();
                    });
                }}
            >
                <FontAwesomeIcon icon={faAdd} size={20} color="#FFFFFF" />
            </TouchableOpacity> */}
        </View>
    );
};

const pickerSelectStyles = {

    inputIOS: {
        fontSize: 14,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#e8e8e8',
        borderRadius: 10,
        color: 'black',
        backgroundColor: 'white',
        paddingRight: 30,
        height: 55,
    },

    inputAndroid: {
        fontSize: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#e8e8e8',
        borderRadius: 10,
        color: 'black',
        backgroundColor: 'white',
        paddingRight: 30,
        height: 55,
    },
    iconContainer: {
        top: 15,
        right: 12,
    },
    placeholder: {
        color: '#9EA0A4',
    },
};

const styles = StyleSheet.create({
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        paddingLeft: 10,
        textAlign: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 50,
        paddingRight: 20,
    },
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 50,
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
        paddingTop: 40,
        paddingBottom: 15,
    },
    headerText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 5,
    },
    subHeaderText: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    contentArea: {
        flex: 1,
        marginTop: -40,
    },
    calendarSection: {
        backgroundColor: '#f8f8f8',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 2,
        paddingHorizontal: 15,
        paddingTop: 20,
        flex: 1,
        zIndex: 1000,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
        marginLeft: 5,
        color: '#333',
    },
    pickerWrapper: {
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
        backgroundColor: 'white',
        borderRadius: 10,
        zIndex: 2000,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    calendarContainer: {
        backgroundColor: '#fff',
        // borderRadius: 10,
        padding: 0,
        marginHorizontal: 0,
        shadowColor: '#000',
        /*  shadowOffset: {
             width: 0,
             height: 2,
         }, */
        /*  shadowOpacity: 0.1,
         shadowRadius: 3,
         elevation: 3, */
        flex: 2,
    },
    monthHeader: {
        alignItems: 'center',
        marginBottom: 10,
        paddingRight: 15,
    },
    monthText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    calendar: {
        marginBottom: 0,
        paddingRight: 20,
        paddingLeft: 0,
    },
    bottomSheetBackground: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
    },
    bottomSheetContent: {
        padding: 20,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    bookingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: 22,
        color: '#666',
        fontWeight: 'bold',
    },
    maintenanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    maintenanceMarker: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFD700',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    maintenanceMarkerText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },
    maintenanceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#d5fff8',
        marginVertical: 15,
    },
    guestSection: {
        marginBottom: 10,
    },
    maintenanceSection: {
        marginBottom: 10,
    },
    bookingDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    label: {
        fontSize: 15,
        color: '#666',
        fontWeight: '500',
    },
    value: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    dateSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateRangeText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    editButton: {
        backgroundColor: '#d5fff8',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    editButtonText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    noBookingText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
    },
    tabContainer: {
        flexDirection: 'row',
        height: 60,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#d5fff8',
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeTab: {
        borderTopWidth: 2,
        borderTopColor: '#008489',
    },
    tabIcon: {
        width: 24,
        height: 24,
        opacity: 0.6,
    },
    activeTabIcon: {
        opacity: 1,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#d5fff8',
        marginBottom: 10,
    },
    legendContainer2: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        backgroundColor: 'white',
        paddingVertical: 3,
        paddingHorizontal: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#d5fff8',
        marginBottom: 5,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        color: '#333333',
    },
    addButtonText: {
        marginRight: 8,
        fontSize: 14,
        color: 'black',
        fontWeight: '500',
    },
    // Add floating button styles
    floatingButton: {
        position: 'absolute',
        right: 20,
        bottom: 80, // Position above the tab bar
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#008489',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        zIndex: 1000,
    },
});

export default CalendarScreen;