import { faChevronCircleLeft, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useProperty } from '../../context/PropertyContext';
import PropertyService from '../../services/propertyService';
import { Property } from '../../types/property';
import Toast from 'react-native-toast-message';


interface MonthlyStatement {
    name: string; // e.g., "2024_11.pdf"
    year: string; // e.g., "2024"
    month: string; // e.g., "11"
}


const MonthlyStatements = ({ navigation }: { navigation: any }) => {
    const { selectedProperty, setSelectedProperty } = useProperty();
    const [selectedYear, setSelectedYear] = useState('2024');
    const [selectedMonth, setSelectedMonth] = useState('October');
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);
    const [monthlyStatements, setMonthlyStatements] = useState<MonthlyStatement[]>([]);
    const [totalNBV, settotalNBV] = useState(0);


    useEffect(() => {
        fetchProperties();
    }, []);

    useEffect(() => {
        if (selectedProperty) {
            fetchMonthlyStatement(selectedProperty);
        }
    }, [selectedProperty]);



    const fetchProperties = async () => {
        try {
            const response = await PropertyService.getAllProperties();
            const propertyList = response.properties || [];
            settotalNBV(response.totalNBV || 0); // Capture totalNBV from the response and set it in state
            setProperties(propertyList);

            // Set the first property as default if no property is selected
            if (propertyList.length > 0 && !selectedProperty) {
                setSelectedProperty(propertyList[0].id.toString());
                fetchMonthlyStatement(propertyList[0].id.toString());

            }
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMonthlyStatement = async (propertyId: string) => {
        try {
            const response = await PropertyService.getMonthlyStatement(propertyId);
            console.log(response);
            setMonthlyStatements(response);
        } catch (error) {
            console.error('Error fetching monthly statement:', error);
        }
    };

    // Add these helper functions to get unique years and months
    const getUniqueYears = () => {
        const years = monthlyStatements.map(statement => statement.year);
        return [...new Set(years)].sort((a, b) => b.localeCompare(a)); // Sort descending
    };

    const getMonthsForSelectedYear = () => {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const monthsInYear = monthlyStatements
            .filter(statement => statement.year === selectedYear)
            .map(statement => ({
                number: statement.month,
                name: monthNames[parseInt(statement.month) - 1]
            }));

        // Remove duplicates by using a Set with a unique key
        const uniqueMonths = Array.from(
            new Map(monthsInYear.map(item => [item.number, item]))
                .values()
        );

        return uniqueMonths.sort((a, b) => parseInt(b.number) - parseInt(a.number));
    };

    // Update useEffect to set initial year and month
    useEffect(() => {
        if (monthlyStatements.length > 0) {
            const years = getUniqueYears();
            if (years.length > 0) {
                setSelectedYear(years[0]);
                const monthsForYear = getMonthsForSelectedYear();
                if (monthsForYear.length > 0) {
                    setSelectedMonth(monthsForYear[0].number);
                }
            }
        }
    }, [monthlyStatements]);

    const showToast = (type: string, title: string, message: string) => {
        Toast.show({
          type: type,
          text1: title,
          text2: message,
          visibilityTime: 4000, // Duration for which the toast is visible
          autoHide: true, // Automatically hide the toast after the visibility time
          topOffset: 30, // Offset from the top of the screen
        });
      };
    function formatAmount(totalNBV: number): string {
        if (totalNBV === undefined) return '0.00';
        return totalNBV.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.00$/, '');
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <FontAwesomeIcon icon={faChevronCircleLeft} size={24} color="#000" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { textAlign: 'left' }]}>Monthly Statements</Text>
                <View style={styles.placeholder} />
            </View>
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.label}>Select property</Text>
                    <View style={styles.pickerContainerlist}>
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#008489" />
                            </View>
                        ) : (
                            <RNPickerSelect
                                onValueChange={(value) => setSelectedProperty(value)}
                                items={[
                                    ...(properties || []).map((property) => ({
                                        label: property.listing_name,
                                        value: property.id.toString(),
                                    }))
                                ]}
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
                        )}
                    </View>

                    <View style={styles.grossValueCard}>
                        <Text style={styles.cardTitle}>Total Gross Value</Text>
                        <Text style={styles.grossValue}>₹ {formatAmount(totalNBV)}</Text>
                    </View>

                    <View style={styles.dropdownContainer}>
                        <View style={styles.pickerContainer}>
                            <Text style={styles.cardTitle1}>Select Year</Text>
                            <View style={styles.pickerContainer1}>

                                <RNPickerSelect
                                    onValueChange={(itemValue) => {
                                        setSelectedYear(itemValue);
                                        // Reset month when year changes
                                        const monthsForYear = monthlyStatements
                                            .filter(statement => statement.year === itemValue);
                                        if (monthsForYear.length > 0) {
                                            setSelectedMonth(monthsForYear[0].month);
                                        }
                                    }}
                                    items={getUniqueYears().map((year) => ({
                                        label: year,
                                        value: year,
                                    }))}
                                    value={selectedYear}
                                    style={pickerSelectStyles}
                                    useNativeAndroidPickerStyle={false}
                                    placeholder={{ label: 'Select a year', value: null }}
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
                        </View>

                        <View style={styles.pickerContainer}>
                            <Text style={styles.cardTitle1}>Select Month</Text>
                            <View style={styles.pickerContainer1}>

                                <RNPickerSelect
                                    onValueChange={(itemValue) => {
                                        setSelectedMonth(itemValue);
                                        // Reset month when year changes
                                        const monthsForYear = monthlyStatements
                                            .filter(statement => statement.year === selectedYear);
                                        if (monthsForYear.length > 0) {
                                            setSelectedMonth(monthsForYear[0].month);
                                        }
                                    }}
                                    items={getMonthsForSelectedYear().map((month) => ({
                                        label: month.name,
                                        value: month.number,
                                    }))}
                                    value={selectedMonth}
                                    style={pickerSelectStyles}
                                    useNativeAndroidPickerStyle={false}
                                    placeholder={{ label: 'Select a month', value: null }}
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
                        </View>
                    </View>
                </ScrollView>


                <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={async () => {
                        if (!selectedYear || !selectedMonth) {
                            showToast('error', 'Error', 'Please select both year and month');
                            return;
                        }

                        const statement = monthlyStatements.find(
                            s => s.year === selectedYear && s.month === selectedMonth
                        );
                        if (statement) {
                            // Handle download using statement.name
                            console.log(`Downloading statement: ${statement.name}`);
                            setLoading(true); // Start loading state
                            try {
                                const downloadUrl = await PropertyService.downloadMonthlyStatement(selectedProperty, statement.name);
                                const fileUrl = downloadUrl; // Extract the URL from the response
                                console.log('File URL:', fileUrl);
                                const url = new URL(fileUrl.toString()).toString();
                                console.log(`Statement downloaded: ${url}`);
                                // Remove last character if it's a forward slash
                                const formattedUrl = url.endsWith('/') ? url.slice(0, -1) : url;

                                // Check if the URL is valid
                                if (!formattedUrl) {
                                    showToast('error', 'Invalid URL', 'The download URL is not valid');
                                    return;
                                }
                              
                                await Linking.openURL(formattedUrl).catch(err => {
                                    console.error('Error opening URL:', err);
                                    return showToast('error', 'Error opening URL', err.message);
                                });

                                // console.log(`Statement downloaded: ${fileUrl}`);
                                // Optionally, you can handle the download URL here (e.g., open it)
                            } finally {
                                setLoading(false); // End loading state
                            }
                        } else {
                            console.log('No statement found');
                            showToast('error', 'No statement found', '');
                        }
                    }}
                    disabled={!selectedYear || !selectedMonth} // Disable button if year or month is not selected
                >
                    <Text style={styles.downloadButtonText}>Download Statement</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>

    );
};


const pickerSelectStyles = {
    viewContainer: {
        borderRadius: 10,
        backgroundColor: '#fff',
        padding: 2,
    },
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
    itemStyle: {
        color: '#008281',
        fontWeight: 'bold',
    },

};


const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    picker: { color: '#000', fontSize: 14 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    pickerInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        padding: 12,
        // marginBottom: 16,
        fontSize: 16,
        color: 'black',
        paddingRight: 30, // Make room for the icon
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
    },
    placeholder: { flex: 1 },

    pickerItem: { color: '#000', fontSize: 14 },
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    scrollContent: { flexGrow: 1, padding: 20 },
    label: { fontSize: 14, color: '#666', marginBottom: 5 },
    input: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginBottom: 20 },
    grossValueCard: { backgroundColor: '#008281', padding: 20, borderRadius: 8, marginBottom: 20 },
    cardTitle: { color: '#FFF', fontSize: 14 },
    cardTitle1: { color: '#000', fontSize: 14, marginBottom: 10 },
    grossValue: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    dropdownContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    pickerContainerlist: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        color: '#000',
    },
    pickerContainer: { flex: 1, borderRadius: 8, marginRight: 10 },
    pickerContainer1: { flex: 1, borderRadius: 8, marginRight: 10 },
    downloadButton: { backgroundColor: '#008281', padding: 15, borderRadius: 8, alignItems: 'center', margin: 20 },
    downloadButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    iconContainer: {
        position: 'absolute',
        right: 10,
        top: '50%',
        transform: [{ translateY: -8 }], // Half of icon size to center it
    },
    pickerIcon: {
        position: 'absolute',
        right: 10,
        top: '50%',
        color: 'white',
        transform: [{ translateY: -8 }], // Half of icon size to center it
    },
    errorText: { color: 'red', fontSize: 16, marginBottom: 10 },
});

export default MonthlyStatements;
function setLoading(arg0: boolean) {
    throw new Error('Function not implemented.');
}





