import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { Picker } from '@react-native-picker/picker';
import { useProperty } from '../../context/PropertyContext';

type RatingsScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'RatingsScreen'>;
};

interface PropertyType {
    id: string;
    name: string;
    location: string;
    image: string;
    averageRating: number;
    totalReviews: number;
    ratings: PropertyRating[];
}

interface PropertyRating {
    platform: string;
    logo: string;
    rating: number;
    color: string;
    totalReviews?: number;
}

interface Property {
    id: string;
    name: string;
    location: string;
    image: string;
    averageRating: number;
    totalReviews: number;
    ratings: PropertyRating[];
}

const RatingsScreen: React.FC<RatingsScreenProps> = ({ navigation }) => {
    // Sample properties data
    const sampleProperties = [
        {
            id: '1',
            name: 'Iconic Vally',
            location: 'Fira, Thira 84700, Greece',
            image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2340&auto=format&fit=crop',
            averageRating: 4.8,
            totalReviews: 4339,
            ratings: [
                { platform: 'Airbnb', logo: 'md-globe-outline', rating: 4.8, color: '#FF5A5F' },
                { platform: 'Makemytrip', logo: 'md-globe-outline', rating: 4.0, color: '#EB2026' },
                { platform: 'Booking.com', logo: 'booking', rating: 4.8, color: '#003580' },
            ]
        },
        {
            id: '2',
            name: 'Sunset Villa',
            location: 'Oia, Santorini, Greece',
            image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2340&auto=format&fit=crop',
            averageRating: 4.6,
            totalReviews: 3102,
            ratings: [
                { platform: 'Airbnb', logo: 'md-globe-outline', rating: 4.7, color: '#FF5A5F' },
                { platform: 'Makemytrip', logo: 'md-globe-outline', rating: 4.2, color: '#EB2026' },
                { platform: 'Booking.com', logo: 'booking', rating: 4.5, color: '#003580' },
            ]
        }
    ];

    const [selectedPropertyId, setSelectedPropertyId] = useState('1');
    const [properties, setPropertiesvalue] = useState<Property[]>(sampleProperties);
    const { selectedProperty, setSelectedProperty } = useProperty();


    const [loading, setLoading] = useState(false);




    // Find the selected property object
    const selectedPropertys = properties.find(p => p.id === selectedPropertyId) || properties[0];

    // Load properties data
    useEffect(() => {
        // Simulate loading data
        setLoading(true);
        // In a real app, you would fetch data from an API here
        setTimeout(() => {
            setPropertiesvalue(sampleProperties);
            setLoading(false);
        }, 1000);
    }, []);


    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await fetch('/api/properties'); // Adjust the API endpoint as necessary
            const data = await response.json();
            const propertyList = data.properties || [];
            setPropertiesvalue(propertyList);

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

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<AntDesign key={`star-${i}`} name="star" size={14} color="#FFD700" style={styles.star} />);
            } else if (i === fullStars && halfStar) {
                stars.push(<AntDesign key={`star-${i}`} name="starhalfalt" size={14} color="#FFD700" style={styles.star} />);
            } else {
                stars.push(<AntDesign key={`star-${i}`} name="staro" size={14} color="#FFD700" style={styles.star} />);
            }
        }
        return stars;
    };

    const getLogo = (platform: string) => {
        switch (platform) {
            case 'Airbnb':
                return (
                    <View style={[styles.logoBox, { backgroundColor: '#FF5A5F' }]}>
                        <Text style={styles.logoText}>A</Text>
                    </View>
                );
            case 'Makemytrip':
                return (
                    <View style={[styles.logoBox, { backgroundColor: '#EB2026' }]}>
                        <Text style={styles.logoText}>MMT</Text>
                    </View>
                );
            case 'Booking.com':
                return (
                    <View style={[styles.logoBox, { backgroundColor: '#003580' }]}>
                        <Text style={styles.logoText}>B</Text>
                    </View>
                );
            default:
                return <Icon name="md-globe-outline" size={20} color="#000" />;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { textAlign: 'left' }]}>My Ratings</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Property Selector */}
                <View style={styles.earningsSection}>
                    <Text style={styles.sectionTitle}>Select property</Text>
                    <View style={styles.pickerContainer}>
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <Text>Loading property details...</Text>
                            </View>
                        ) : (
                            <Picker
                                selectedValue={selectedProperty || (properties.length > 0 ? properties[0].id.toString() : '')}
                                 mode="dropdown"
                                dropdownIconColor="#000"
                                onValueChange={(itemValue) => {
                                    console.log('Selected property id:', itemValue.toString());
                                    return setSelectedProperty(itemValue.toString());
                                }}
                                style={styles.picker}
                            >
                                {properties.map((property) => (
                                    <Picker.Item
                                        key={property.id}
                                        label={property.name}
                                        value={property.id}
                                    />
                                ))}
                            </Picker>
                        )}
                    </View>
                </View>

                {/* Property Card */}
                {!loading && selectedPropertys && (
                    <>
                        <View style={styles.propertyCardContainer}>
                            <View style={styles.propertyCard}>
                                <Image
                                    source={{ uri: selectedPropertys.image }}
                                    style={styles.propertyImage}
                                    resizeMode="cover"
                                />

                                <View style={styles.propertyInfo}>
                                    <View style={styles.nameRatingRow}>
                                        <Text style={styles.propertyName}>{selectedPropertys.name}</Text>
                                        <View style={styles.ratingBadge}>
                                            <AntDesign name="star" size={12} color="#FFD700" />
                                            <Text style={styles.ratingText}>
                                                {selectedPropertys.averageRating.toFixed(1)}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.propertyLocation}>
                                        {selectedPropertys.location}
                                    </Text>

                                    <Text style={styles.reviewCount}>
                                        ({selectedPropertys.totalReviews.toLocaleString()})
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Ratings List */}
                        <View style={styles.ratingsListContainer}>
                            <Text style={styles.ratingsTitle}>Platform Ratings</Text>
                            {selectedPropertys.ratings.map((item, index) => (
                                <View key={index} style={styles.ratingItem}>
                                    <View style={styles.platformInfo}>
                                        {getLogo(item.platform)}
                                        <Text style={styles.platformName}>{item.platform}</Text>
                                    </View>

                                    <View style={styles.ratingStars}>
                                        {renderStars(item.rating)}
                                        <Text style={styles.ratingValue}>{item.rating.toFixed(1)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    earningsSection: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    pickerContainer: {
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
    picker: {
        height: 50,
        width: '100%',
        color: '#000', // Added text color black
    },
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
    placeholder: {
        width: 24,
    },
    propertyCardContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
        borderTopLeftRadius: 150,
        borderTopRightRadius: 150,
    },
    propertyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderTopLeftRadius: 150,
        borderTopRightRadius: 150,

    },
    propertyImage: {
        width: '100%',
        height: 180,
    },
    propertyInfo: {
        padding: 12,
    },
    nameRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    propertyName: {
        fontSize: 18,
        fontWeight: '500',
        color: '#000000',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000000',
        marginLeft: 4,
    },
    propertyLocation: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 6,
    },
    reviewCount: {
        fontSize: 14,
        color: '#888888',
    },
    ratingsListContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
    },
    ratingsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginVertical: 10,
        color: '#333',
    },
    ratingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    platformInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    platformName: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 12,
        color: '#000000',
    },
    ratingStars: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    star: {
        marginHorizontal: 1,
    },
    ratingValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
        marginLeft: 8,
    },
    logoBox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default RatingsScreen;