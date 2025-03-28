import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useProperty } from '../../context/PropertyContext';
import PropertyService from '../../services/propertyService';
import { Property } from '../../types/property';
import { ActivityIndicator } from 'react-native';

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
                    month: `${months[month]} ${year}`,
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
                                    <Text style={styles.welcomeText}>Earnings</Text>
                                </View>
                            </View>
                        </View>

                        {/* Summary Cards */}
                        <View style={styles.summaryContainer}>
                            <TouchableOpacity style={[styles.summaryCard, styles.singleCard]}>
                                <View style={styles.topRow}>
                                    <Text style={styles.summaryLabel}>Gross Booking Value (current month)</Text>
                                    <Ionicons name="chevron-forward" size={15} color="#008489" />
                                </View>

                                <View style={styles.bottomRow}>
                                    <View style={styles.leftContent}>
                                        <View style={styles.curvedContainer}>
                                            <Image
                                                source={require('../../assets/images/dollar.png')}
                                                style={styles.currencyImage}
                                            />
                                        </View>
                                        <Text style={styles.bookingValue}> {formatAmount(propertyDetails?.earnings.reduce((total, item) => total + item.amount, 0))}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </ImageBackground>
            </View>

            {/* Content Area */}
            <View style={styles.contentArea}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.earningsSection}>
                        <Text style={styles.sectionTitle}>Select property</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedProperty || (properties.length > 0 ? properties[0].id.toString() : "")}
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

                        {loading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#008489" />
                            </View>
                        )}
                    </View>

                    {/* Only show statistics if a property is selected */}
                    {propertyDetails && (
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Statistics</Text>
                            <View style={styles.bookingSummary}>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryValue}>
                                        {totals.checkedOut || 0}
                                    </Text>
                                    <Text style={[styles.summaryLabel, styles.checkedOutText]}>
                                        Checked Out
                                    </Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryValue}>
                                        {totals.current || 0}
                                    </Text>
                                    <Text style={[styles.summaryLabel, styles.currentText]}>
                                        Current
                                    </Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryValue}>
                                        {totals.upcoming || 0}
                                    </Text>
                                    <Text style={[styles.summaryLabel, styles.upcomingText]}>
                                        Upcoming
                                    </Text>
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
                                            onPress={() => setSelectedMonth(index)}
                                        >
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

                    {selectedMonth !== null && (
                        <View style={[styles.detailsCard, { marginHorizontal: 20, marginBottom: 40 }]}>
                            <View style={styles.detailsRow}>
                                <Text style={styles.detailsMonth}>
                                    {bookingsData[selectedMonth].month}
                                </Text>
                            </View>
                            <View style={styles.detailsRow}>
                                <Text style={styles.detailsNights}>
                                    {bookingsData[selectedMonth].totalNights} nights booked
                                </Text>
                                <Text style={styles.detailsEarnings}>
                                    {(bookingsData[selectedMonth].totalEarnings.toLocaleString())}
                                </Text>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
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
        height: 180,
    },
    topBackground: {
        width: '100%',
    },
    contentArea: {
        flex: 1,
        marginTop: -10,
    },
    scrollContent: {
        paddingBottom: 10,
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
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
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
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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
    },
    earningsSection: {
        backgroundColor: '#f8f8f8',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingHorizontal: 15,
        paddingTop: 0,
        flex: 1,
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
        height: 55,
        width: '100%',
        color: '#000',

    },
    chartContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginHorizontal: 20,
        marginTop: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    barChartScrollContent: {
        paddingHorizontal: 10,
    },
    barChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 150,
        paddingTop: 10,
        paddingBottom: 5,
        position: 'relative',
    },
    barWrapper: {
        alignItems: 'center',
        marginHorizontal: 8,
    },
    bar: {
        width: 30,
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
        marginTop: 15,
        padding: 15,
        backgroundColor: '#3A3B3F',
        borderRadius: 10,
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
});

export default EarningsScreen;
