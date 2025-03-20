import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useProperty } from '../../context/PropertyContext';
import { Property } from '../../types/property';
import PropertyService from '../../services/propertyService';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native'; 
import Icon from 'react-native-vector-icons/Ionicons';

const MonthlyStatements = ({ navigation }: { navigation: any }) => {
    const { selectedProperty, setSelectedProperty } = useProperty();
    const [selectedYear, setSelectedYear] = useState('2024');
    const [selectedMonth, setSelectedMonth] = useState('October');
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);



    useEffect(() => {
        fetchProperties();
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
                                <Text>Loading property details...</Text>
                            </View>
                        ) : (
                            <Picker
                                selectedValue={selectedProperty}
                                onValueChange={(itemValue) => setSelectedProperty(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select a property" value="" />
                                {properties && properties.length > 0 && properties.map((property) => (
                                    <Picker.Item
                                        key={property.id}
                                        label={property.listing_name}
                                        value={property.id}
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
                                    onValueChange={(itemValue) => setSelectedYear(itemValue)}>
                                    <Picker.Item label="2024" value="2024" style={styles.pickerItem} />
                                    <Picker.Item label="2023" value="2023" style={styles.pickerItem} />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.pickerContainer}>
                            <Text style={styles.cardTitle1}>Select Month</Text>
                            <View style={styles.pickerContainer1}>
                                <Picker
                                    selectedValue={selectedMonth}
                                    onValueChange={(itemValue) => setSelectedMonth(itemValue)}>
                                    <Picker.Item label="October" value="October" style={styles.pickerItem} />
                                    <Picker.Item label="November" value="November" style={styles.pickerItem} />
                                </Picker>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <TouchableOpacity style={styles.downloadButton}>
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





