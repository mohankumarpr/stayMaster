import BottomSheet from '@gorhom/bottom-sheet';
import 'react-native-gesture-handler';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useRef, useState } from 'react';
import {
    ImageBackground,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image
} from 'react-native';
import { CalendarList, DateData } from 'react-native-calendars';
// import 'react-native-reanimated';
import { useProperty } from '../../context/PropertyContext';
import PropertyService from '../../services/propertyService';
import { Property } from '../../types/property';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { ActivityIndicator } from 'react-native';
import { Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';



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


const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
    const { selectedProperty, setSelectedProperty } = useProperty();
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
            const bookings = response.calendar;

            // Group bookings by booking_id
            const groups = bookings.reduce((acc: { [key: string]: any[] }, booking: any) => {
                if (!acc[booking.id]) {
                    acc[booking.id] = [];
                }
                acc[booking.id].push(booking);
                return acc;
            }, {});

            // Store booking groups in state
            setBookingGroups(groups as any);
            // Convert bookings to period marking format
            const marked: any = {};

            Object.values(groups).forEach(bookingGroup => {
                // Determine if this is a maintenance booking

                const isMaintenance = bookingGroup[0].maintenance === true;
                const color = isMaintenance ? '#FFD700' : '#50cebb';

                // Get start and end dates from server data
                const firstDate = bookingGroup[0].start; // Assuming startDate is provided by the server
                const lastDate = bookingGroup[0].end; // Assuming endDate is provided by the server

                // Mark first date
                marked[firstDate] = {
                    startingDay: true,
                    color: color,
                    textColor: 'white'
                };
                // Mark last date
                marked[lastDate] = {
                    endingDay: true,
                    color: color,
                    textColor: 'white'
                };
                // Mark middle dates
                const currentDate = new Date(firstDate);
                const endDate = new Date(lastDate);
                while (currentDate <= endDate) {
                    const dateString = currentDate.toISOString().split('T')[0];
                    if (dateString !== firstDate && dateString !== lastDate) {
                        marked[dateString] = {
                            color: color,
                            textColor: 'white'
                        };
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            });

            setMarkedDates(marked);
        } catch (error) {
            console.error('Error fetching calendar data:', error);
        } finally {
            setLoading(false);
        }
    };

    const onDayPress = (day: DateData) => {
        console.log("Day pressed:", day.dateString);
        console.log("Day pressed:", day.dateString);
        let bookingId = null; // Variable to store the booking ID
        const selectedDate = day.dateString;
        let bookingFound = false; // Flag to check if a booking is found

        // Animate the transition to the CalendarInfo screen
        Object.values(bookingGroups).forEach(bookingGroup => {
            const firstDate = bookingGroup[0].start;
            const lastDate = bookingGroup[bookingGroup.length - 1].end;

            if (selectedDate >= firstDate && selectedDate <= lastDate) {
                console.log("Booking found for date:", selectedDate);
                const startDate = bookingGroup[0].start; // Get the start date
                const endDate = bookingGroup[bookingGroup.length - 1].end; // Get the end date
                bookingId = bookingGroup[0].id; // Assuming the booking ID is stored in the first booking of the group

                console.log("Booking ID:", bookingId);
                console.log("Start Date:", startDate);
                console.log("End Date:", endDate);

                // Animate the transition to the CalendarInfo screen with booking ID
                navigation.navigate('CalendarInfo', { bookingId, startDate, endDate } as any);
                bookingFound = true; // Set flag to true if booking is found
            }
        });

        // If no booking is found, you may want to handle that case
        if (!bookingFound) {
            console.warn("No booking found for the selected date.");
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

    function showToast(arg0: string) {
        Toast.show({
            text1: arg0,
            type: 'error',
            position: 'bottom',
            visibilityTime: 3000,
            autoHide: true,
        });
    }

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
                            {/* <Text style={styles.headerText}>Good {timeSession}</Text> */}
                            <Text style={styles.subHeaderText}>Calendar</Text>
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
                            selectedValue={selectedProperty || (properties.length > 0 ? properties[0].id : '')}
                            mode="dropdown"
                            dropdownIconColor="#000"
                            onValueChange={(itemValue) => setSelectedProperty(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select a property" value={properties.length > 0 ? properties[0].id.toString() : ""} />
                            {properties.map((property) => (
                                <Picker.Item
                                    key={property.id}
                                    label={property.listing_name}
                                    value={property.id.toString()}
                                />
                            ))}
                        </Picker>
                    </View>
                    <View style={styles.legendContainer}>
                        <LegendItem color="#50cebb" label="Checked-in Bookings" />
                        <LegendItem color="#FFC107" label="Upcoming Bookings" />
                        <LegendItem color="#FF5252" label="Current" />
                    </View>
                    <View style={[styles.legendContainer2, { alignItems: 'flex-end' }]}>
                        <TouchableOpacity 
                            style={styles.addButton} 
                            onPress={() =>  {
                                const propertyId = selectedProperty?.toString() || '';
                                console.log('selectedProperty', selectedProperty);
                                if (!selectedProperty) {
                                    showToast('Please select a property');
                                    return;
                                }
                                return navigation.navigate('UnblockBlockScreen', { propertyId } as any);
                            }} 
                           
                        >
                            <Icon name="add" size={20} color="black" />
                        </TouchableOpacity>
                    </View>

                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#008489" />
                        </View>
                    )}
                   

                    {selectedProperty && !loading && (
                        <View style={styles.calendarContainer}>
                            <View style={styles.monthHeader}>
                                {/* <Text style={styles.monthText}>{getCurrentMonthText()}</Text> */}
                            </View>
                            <CalendarList
                                style={styles.calendar}
                                onDayPress={onDayPress}
                                onMonthChange={onMonthChange}
                                markingType={'period'}
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
                                    // Removed dayNames as it does not exist on the CalendarListProps
                                    // dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] // Commented out as it does not exist
                                }}
                            />
                        </View>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    addButton: {
        padding: 10,
        borderRadius: 50, 
        alignItems: 'flex-end',
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
        fontSize: 16,
        fontWeight: '600',
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
        height: 60,
        width: '100%',
        color: '#000',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
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
        backgroundColor: '#e0e0e0',
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
        backgroundColor: '#e0e0e0',
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
        borderTopColor: '#e0e0e0',
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
        borderBottomColor: '#E0E0E0',
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
        borderBottomColor: '#E0E0E0',
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
});

export default CalendarScreen;