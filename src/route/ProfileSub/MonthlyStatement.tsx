import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useProperty } from '../../context/PropertyContext';
import { Property } from '../../types/property';
import PropertyService from '../../services/propertyService';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator } from 'react-native';


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

        return monthsInYear.sort((a, b) => parseInt(b.number) - parseInt(a.number));
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

    function showToast(arg0: { text1: string; type: string; }) {
        throw new Error('Function not implemented.');
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="chevron-back" size={24} color="#000" />
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
                            <Picker
                                selectedValue={selectedProperty}
                                onValueChange={(itemValue) => setSelectedProperty(itemValue)}
                                style={styles.picker}
                                mode="dropdown"
                                dropdownIconColor="#000"
                            >
                                <Picker.Item label="Select a property" value="" />
                                {properties && properties.length > 0 && properties.map((property) => (
                                    <Picker.Item
                                        key={property.id}
                                        label={property.listing_name}
                                        value={property.id.toString()}
                                    />
                                ))}
                            </Picker>
                        )}
                    </View>

                    <View style={styles.grossValueCard}>
                        <Text style={styles.cardTitle}>Total Gross Value</Text>
                        <Text style={styles.grossValue}>₹ 265,450.45</Text>
                    </View>

                    <View style={styles.dropdownContainer}>
                        <View style={styles.pickerContainer}>
                            <Text style={styles.cardTitle1}>Select Year</Text>
                            <View style={styles.pickerContainer1}>
                                <Picker
                                    selectedValue={selectedYear}
                                    mode="dropdown"
                                    dropdownIconColor="#000"
                                    onValueChange={(itemValue) => {
                                        setSelectedYear(itemValue);
                                        // Reset month when year changes
                                        const monthsForYear = monthlyStatements
                                            .filter(statement => statement.year === itemValue);
                                        if (monthsForYear.length > 0) {
                                            setSelectedMonth(monthsForYear[0].month);
                                        }
                                    }}
                                    style={styles.picker}>
                                    {getUniqueYears().map((year) => (
                                        <Picker.Item
                                            key={year}
                                            label={year}
                                            value={year}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.pickerContainer}>
                            <Text style={styles.cardTitle1}>Select Month</Text>
                            <View style={styles.pickerContainer1}>
                                <Picker
                                    selectedValue={selectedMonth}
                                    mode="dropdown"
                                    onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                                    style={styles.picker}>
                                    {getMonthsForSelectedYear().map((month) => (
                                        <Picker.Item
                                            key={month.number}
                                            label={month.name}
                                            value={month.number}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={async () => {
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
                                // Use the download URL directly instead of creating an object URL
                                Linking.openURL(downloadUrl.url).catch(err => console.error('Error opening URL:', err));

                                console.log(`Statement downloaded: ${downloadUrl}`);
                                // Optionally, you can handle the download URL here (e.g., open it)
                            } finally {
                                setLoading(false); // End loading state
                            }
                        } else {
                            console.log('No statement found');
                            showToast({
                                text1: 'No statement found',
                                type: 'error',
                            });
                        }
                    }}>
                    <Text style={styles.downloadButtonText}>Download Statement</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>

    );
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
    dropdownContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
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
    pickerContainer1: { flex: 1, backgroundColor: '#FFF', borderRadius: 8, marginRight: 10 },
    downloadButton: { backgroundColor: '#008281', padding: 15, borderRadius: 8, alignItems: 'center', margin: 20 },
    downloadButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default MonthlyStatements;
function setLoading(arg0: boolean) {
    throw new Error('Function not implemented.');
}





