import { faBed, faCalendarDays, faChevronDown, faPersonWalkingLuggage, faSun } from '@fortawesome/free-solid-svg-icons';
import { faChevronCircleRight } from '@fortawesome/free-solid-svg-icons/faChevronCircleRight';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useProperty } from '../../context/PropertyContext';
import PropertyService from '../../services/propertyService';
import { Property } from '../../types/property';
import { faUser, faCalendar, faMoon, faChartLine } from '@fortawesome/free-solid-svg-icons';

// const { width } = Dimensions.get('window');
// const cardWidth = width * 0.8;

// Update the interface to match the service response and include listing_name
interface EarningsByMonth {
    listing_name: string;
    totalEarnings: number;
    earnings: Array<{
        count: number;
        amount: number;
        date: string;
    }>;
    nights: Array<{
        count: number;
        date: string;
    }>;
}

const EarningsScreen: React.FC = () => {
    const { selectedProperty, setSelectedProperty } = useProperty();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [propertyDetails, setPropertyDetails] = useState<EarningsByMonth | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    // Add new function to transform API data into chart format
    const transformPropertyDataToChartFormat = (details: EarningsByMonth | null) => {
        if (!details) return [];

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const monthsRange = Array.from({ length: 8 }, (_, i) => {
            const monthOffset = i - 5;
            const month = (currentMonth + monthOffset + 12) % 12;
            const year = currentYear + Math.floor((currentMonth + monthOffset) / 12);
            return { month, year };
        });

        console.log(monthsRange);

        return monthsRange.flatMap(({ month, year }) => {
            const getData = (data: any, month: any, year: any) =>
                data.find((e: any) => {
                    const [m, y] = e.date.split('-').map(Number);
                    return (m - 1 + 12) % 12 === month && y === year;
                }) || { amount: 0, count: 0 };

            const currentMonthData = getData(details.earnings, month, year);
            const currentNightsData = getData(details.nights, month, year);

            const type = year < currentYear || (year === currentYear && month < currentMonth)
                ? 'checkedOut'
                : month === currentMonth && year === currentYear
                    ? 'current'
                    : 'upcoming';

            // Return only the required months within the selected range
            if (
                (year === currentYear && month >= currentMonth - 5 && month <= currentMonth + 2) ||
                (year === currentYear - 1 && month >= 12 - (5 - currentMonth)) // Handle last year's months
            ) {
                return {
                    month: `${months[month]} ${year.toString().slice(-2)}`,
                    bookings: currentNightsData.count,
                    type,
                    totalNights: currentNightsData.count,
                    totalEarnings: currentMonthData.amount
                };
            }
            return [];
        }).sort((a, b) => {
            const [monthA, yearA] = a.month.split(' ').map((val, index) =>
                index === 0 ? months.indexOf(val) : Number(val)
            );
            const [monthB, yearB] = b.month.split(' ').map((val, index) =>
                index === 0 ? months.indexOf(val) : Number(val)
            );
            return yearA === yearB ? monthA - monthB : yearA - yearB;
        });
    };



    // Replace static bookingsData with transformed API data
    const bookingsData = transformPropertyDataToChartFormat(propertyDetails);
    const totalEarnings = bookingsData.reduce((acc, item) => acc + item.totalEarnings, 0);
    console.log('Total Earnings:', totalEarnings);

    // Update totals calculation to use the new bookingsData
    const totals = bookingsData.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + item.bookings;
        return acc;
    }, {} as Record<string, number>);

    const maxBookings = Math.max(...bookingsData.map(data => data.bookings));

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await PropertyService.getAllProperties();
                const propertyList = response.properties || [];
                setProperties(propertyList);
                // Set the first property as selected if available
                if (propertyList.length > 0) {
                    setSelectedProperty(propertyList[0].id.toString());
                }
            } catch (error) {
                console.error('Error fetching properties:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    useEffect(() => {
        const fetchPropertyDetails = async () => {
            if (!selectedProperty) {
                setPropertyDetails(null);
                return;
            }
            try {
                setLoading(true);
                const details = await PropertyService.getEarningsByMonth(selectedProperty);
                const totalAmount = details.earnings.reduce((total, item) => total + item.amount, 0);
                setPropertyDetails({
                    ...details,
                    listing_name: selectedProperty || '',
                    totalEarnings: totalAmount // Add total earnings to property details
                });
            } catch (error) {
                console.error('Error fetching property details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPropertyDetails();
    }, [selectedProperty]);

    function formatAmount(amount: number | undefined): string {
        if (amount === undefined) return '0.00';
        return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Format items for picker
    const pickerItems = properties.map(property => ({
        label: property.listing_name,
        value: property.id.toString(),
    }));

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
                                <Image source={require('../../assets/images/StayMaster-Logo.png')} style={styles.avatar} />
                                <View>
                                    <Text style={styles.welcomeText}>Earnings</Text>
                                </View>
                            </View>
                        </View>

                        {/* Summary Cards */}
                        <View style={styles.summaryContainer}>
                            <TouchableOpacity style={[styles.summaryCard, styles.singleCard]}>
                                <View style={styles.topRow}>
                                    <Text style={styles.summaryLabel}>Revenue Current FY</Text>
                                    <FontAwesomeIcon icon={faChevronCircleRight} size={15} color="#008489" />
                                </View>

                                <View style={styles.bottomRow}>
                                    <View style={styles.leftContent}>
                                        <View style={styles.curvedContainer}>
                                            <Image
                                                source={require('../../assets/images/dollar.png')}
                                                style={styles.currencyImage}
                                            />
                                        </View>
                                        <Text style={styles.bookingValue}>
                                            {formatAmount(propertyDetails?.earnings.reduce((total, item) => total + item.amount, 0))}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </ImageBackground>
            </View>

            {/* Content Area with enhanced ScrollView */}
            <ScrollView
                style={styles.contentArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
                overScrollMode="always"
                nestedScrollEnabled={true}
            >
                <View style={styles.earningsSection}>
                    <Text style={styles.sectionTitle}>Select property</Text>
                    <View style={styles.pickerWrapper}>
                        <RNPickerSelect
                            onValueChange={(value) => setSelectedProperty(value)}
                            items={pickerItems}
                            value={selectedProperty}
                            style={pickerSelectStyles}
                            useNativeAndroidPickerStyle={false}
                            placeholder={{ label: 'Select a property', value: null }}
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

                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#008489" />
                        </View>
                    )}
                </View>

                {/* Statistics Section */}
                {propertyDetails && (
                    <View style={styles.chartContainer}>
                        {/* <Text style={styles.chartTitle}>Statistics</Text> */}
                        <View style={styles.bookingSummary}>
                            <View style={styles.legendContainer}>
                                <LegendItem color="#50cebb" label="Checked Out" />
                                <LegendItem color="#FF7F7B" label="Current" />
                                <LegendItem color="#E3C063" label="Upcoming" />
                            </View>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.barChartScrollContent}
                        >
                            <View style={styles.barChart}>
                                {/* Add horizontal grid lines */}
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((line) => (
                                    <View
                                        key={`grid-${line}`}
                                        style={[
                                            styles.gridLine,
                                            { bottom: (line * 30) + 25 }
                                        ]}
                                    />
                                ))}
                                {bookingsData.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.barWrapper}
                                        onPress={() => setSelectedMonth(index)}>
                                        <View
                                            style={[
                                                styles.bar,
                                                item.type === 'current' ? styles.current :
                                                    item.type === 'upcoming' ? styles.upcoming :
                                                        styles.checkedOut,
                                                { height: (item.bookings / maxBookings) * 150 }
                                            ]}
                                        />
                                        <Text style={styles.barLabel}>{item.month}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}

                {/* Details Card */}
                {selectedMonth !== null && (
                    <View style={[styles.detailsCard, { marginHorizontal: 20, marginBottom: 60, padding: 20, borderRadius: 40, backgroundColor: '#F7F0ED', elevation: 1 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                            <Text style={{ color: '#B66E63', fontSize: 18, fontWeight: 'bold' }}>You've made </Text>
                            <Text style={{ color: '#008489', fontSize: 18, fontWeight: 'bold' }}>₹{formatAmount(bookingsData[selectedMonth].totalEarnings)}</Text>
                            <Text style={{ color: '#B66E63', fontSize: 18, fontWeight: 'bold' }}> in </Text>
                            <Text style={{ color: '#008489', fontSize: 18, fontWeight: 'bold' }}>{bookingsData[selectedMonth].month}</Text>
                            <Text style={{ color: '#B66E63', fontSize: 18, fontWeight: 'bold' }}>!</Text>
                        </View>

                        <View style={[styles.statsGrid, { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }]}>
                            {/* Guests Hosted */}
                            <View style={styles.statsItem}>
                                <View style={styles.statsItemContent}>
                                    <View style={styles.iconContainer}>
                                        <FontAwesomeIcon icon={faPersonWalkingLuggage} size={28} color="#000" />
                                    </View>
                                    <View style={styles.statsTextContainer}>
                                        <Text style={[styles.statsValue, { color: '#008080' }]}>{bookingsData[selectedMonth].bookings}</Text>
                                        <Text style={styles.statsLabel}>Guests Hosted</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Occupancy */}
                            <View style={styles.statsItem}>
                                <View style={styles.statsItemContent}>
                                    <View style={styles.iconContainer}>
                                        <FontAwesomeIcon icon={faCalendarDays} size={28} color="#000" />
                                    </View>
                                    <View style={styles.statsTextContainer}>
                                        <Text style={[styles.statsValue, { color: '#008080' }]}>{69}%</Text>
                                        <Text style={styles.statsLabel}>Occupancy</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Nights */}
                            <View style={styles.statsItem}>
                                <View style={styles.statsItemContent}>
                                    <View style={styles.iconContainer}>
                                        <FontAwesomeIcon icon={faBed} size={28} color="#000" />
                                    </View>
                                    <View style={styles.statsTextContainer}>
                                        <Text style={[styles.statsValue, { color: '#008080' }]}>{(bookingsData[selectedMonth].totalNights)}</Text>
                                        <Text style={styles.statsLabel}>Nights</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Revenue Growth */}
                            <View style={styles.statsItem}>
                                <View style={styles.statsItemContent}>
                                    <View style={styles.iconContainer}>
                                        <FontAwesomeIcon icon={faChartLine} size={28} color="#000" />
                                    </View>
                                    <View style={styles.statsTextContainer}>
                                        <Text style={[styles.statsValue, { color: '#008080' }]}>12%</Text>
                                        <Text style={styles.statsLabel}>MoM Revenue Growth</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

            </ScrollView>

            {isPickerOpen && (
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsPickerOpen(false)}
                />
            )}
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
        paddingRight: 30, // to ensure the text is never behind the icon
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
        paddingRight: 30, // to ensure the text is never behind the icon
        height: 55,
    },
    iconContainer: {
        top: 15,
        right: 12,
    },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    container2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        paddingRight: 6,
        paddingTop: 8,
    },
    curvedContainer: {
        width: 35,
        height: 35,
        backgroundColor: '#e8f6f6',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.0,
        shadowRadius: 0,
        elevation: 0,
    },
    topContainer: {
        height: 200,
        zIndex: 1,
    },
    topBackground: {
        width: '100%',
    },
    contentArea: {
        flex: 1,
        marginTop: -20,
        zIndex: 1,
    },
    scrollContent: {
        paddingBottom: 30,  // Increased padding for better scroll experience
        flexGrow: 1,       // Ensures content can grow
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 15,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 20,
        marginRight: 10,
        resizeMode: 'contain',
    },
    welcomeText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        opacity: 0.9,
    },
    userName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        marginTop: 5,
        marginBottom: 20,
        zIndex: 1,
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        zIndex: 2,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
        paddingRight: 6,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 3,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 3,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        zIndex: 4,
    },
    currencyImage: {
        width: 15,
        height: 15,
        resizeMode: 'contain',
    },
    bookingValue: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingTop: 5,
        zIndex: 5,
    },
    earningsSection: {
        backgroundColor: '#f8f8f8',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingHorizontal: 15,
        paddingTop: 0,
        paddingBottom: 5,
        position: 'relative',
        zIndex: 3000,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        marginLeft: 5,
        color: '#333',
    },
    singleCard: {
        width: '100%',
    },
    pickerWrapper: {
        marginHorizontal: 5,
        marginBottom: 5,
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
    },
    picker: {
        height: 55,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    pickerOpen: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    chartContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 5,
        marginHorizontal: 20,
        marginTop: 5,
        marginBottom: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        zIndex: 1,
    },
    barChartScrollContent: {
        paddingHorizontal: 5,
    },
    barChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 160,
        paddingTop: 10,
        paddingBottom: 5,
        position: 'relative',
    },
    barWrapper: {
        alignItems: 'center',
        marginHorizontal: 8,
    },
    bar: {
        width: 15,
        borderRadius: 5,
        marginHorizontal: 5,
        zIndex: 2,
    },
    checkedOut: {
        backgroundColor: '#00BAB8',
    },
    current: {
        backgroundColor: '#FF7F7B',
    },
    upcoming: {
        backgroundColor: '#E3C063',
    },
    barLabel: {
        marginTop: 5,
        fontSize: 12,
        color: '#666',
    },
    bookingSummary: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 5,
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    checkedOutText: {
        color: '#00BAB8',
    },
    currentText: {
        color: '#FF7F7B',
    },
    upcomingText: {
        color: '#E3C063',
    },
    detailsCard: {
        marginTop: 5,
        marginBottom: 10,  // Increased margin bottom
        padding: 15,
        backgroundColor: '#F9F4F1',
        borderRadius: 50,
        borderColor: '#008489',
        borderWidth: 1,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    detailsMonth: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    detailsNights: {
        fontSize: 14,
        color: '#ccc',
    },
    detailsEarnings: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#008489',
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 1,
        color: '#333',
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 0.5,
        borderWidth: 0.5,
        borderColor: '#E9E9E9',
        borderStyle: 'dashed',
        zIndex: 1,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    propertyDetails: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginTop: 10,
        marginHorizontal: 5,
    },
    propertyName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: 'transparent',
        // marginBottom: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    legendText: {
        fontSize: 12,
        color: '#666',
    },
    statsTitle: {
        fontSize: 16,
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    statsItem: {
        width: '45%',
        marginBottom: 10,
    },
    statsItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statsTextContainer: {
        flex: 1,
    },
    statsValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    statsLabel: {
        fontSize: 8,
        color: '#666',
    },
});

export default EarningsScreen;
