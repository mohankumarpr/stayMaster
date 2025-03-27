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
import { ActivityIndicator } from 'react-native';
import PropertyService from '../../services/propertyService';
import { Property } from '../../types/property';

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

interface RatingDetailsResponse {
    [platform: string]: number;
}

interface Propertys {
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
    

    const [selectedPropertyId, setSelectedPropertyId] = useState('1');
    const [properties, setPropertiesvalue] = useState<Property[]>([]);
    const { selectedProperty, setSelectedProperty } = useProperty();
    const [loading, setLoading] = useState(false);
    const [ratingDetails, setRatingDetails] = useState<RatingDetailsResponse | null>(null);


    // Find the selected property object
    const selectedPropertys = properties.find(p => p.id.toString() === selectedPropertyId.toString()) || properties[0];

    console.log("selectedPropertys", selectedPropertys);


    useEffect(() => {
        fetchProperties();
    }, []);


    useEffect(() => {
        if (selectedProperty && !loading) {
            setLoading(true);
            setSelectedPropertyId(selectedProperty);
            console.log("selectedPropertyId", selectedPropertyId);
            fetchRatingDetails(selectedPropertyId);

            setLoading(false);
        }
    }, [selectedProperty, loading]);


    useEffect(() => {
        if (selectedPropertyId) {
            fetchRatingDetails(selectedPropertyId);
        }
    }, [selectedPropertyId]);


    const fetchProperties = async () => {
        try {
            const response = await PropertyService.getAllProperties();
            const propertyList = response.properties || [];
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

    async function fetchRatingDetails(selectedPropertyId: string) {
        console.log("selectedPropertyId for rating details", selectedPropertyId);
        try {
            const response = await PropertyService.getRatingDetails(selectedPropertyId);
            console.log("rating details response", response);
            setRatingDetails(response as unknown as RatingDetailsResponse);
            console.log("rating details", ratingDetails);

        } catch (error) {
            console.error('Error fetching rating details:', error);
        }
    }


    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<AntDesign key={`star-${i}`} name="star" size={14} color="#FFD700" style={styles.star} />);
            } else if (i === fullStars && halfStar) {
                stars.push(<AntDesign key={`star-${i}`} name="starhalf" size={14} color="#FFD700" style={styles.star} />);
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
            case 'MakeMyTrip':
                return (
                    <View style={[styles.logoBox, { backgroundColor: '#EB2026' }]}>
                        <Text style={styles.logoText}>MMT</Text>
                    </View>
                );
            case 'Booking':
                return (
                    <View style={[styles.logoBox, { backgroundColor: '#003580' }]}>
                        <Text style={styles.logoText}>B</Text>
                    </View>
                );
            case 'Expedia':
                return (
                    <View style={[styles.logoBox, { backgroundColor: '#FF6A00' }]}>
                        <Text style={styles.logoText}>E</Text>
                    </View>
                );
            case 'Hostelworld':
                return (
                    <View style={[styles.logoBox, { backgroundColor: '#00A3E0' }]}>
                        <Text style={styles.logoText}>H</Text>
                    </View>
                );
            case 'Agoda':
                return (
                    <View style={[styles.logoBox, { backgroundColor: '#FF6F20' }]}>
                        <Text style={styles.logoText}>A</Text>
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
                                <ActivityIndicator size="large" color="#008489" />
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
                                <Picker.Item label="Select a property" value={properties.length > 0 ? properties[0].id.toString() : ""} />
                                {properties.map((property) => {
                                    console.log("property", property);
                                    console.log("property.id", property.id);

                                    return (
                                        <Picker.Item
                                            key={property.id}
                                            label={property.listing_name}
                                            value={property.id.toString()} />
                                    );
                                })}
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
                                    source={{ uri: selectedPropertys.url }}
                                    style={styles.propertyImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.propertyInfo}>
                                    <View style={styles.nameRatingRow}>
                                        <Text style={styles.propertyName}>{selectedPropertys.listing_name}</Text>
                                        <View style={styles.ratingBadge}>
                                            <AntDesign name="star" size={12} color="#FFD700" />
                                            <Text style={styles.ratingText}>
                                                {selectedPropertys.averageRating?.toString()}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.propertyLocation}>
                                        {selectedPropertys.address_line_1}
                                    </Text>
                                    <Text style={styles.reviewCount}>
                                        ({selectedPropertys.totalReviews?.toLocaleString()})
                                    </Text>

                                    <View style={styles.ratingsListContainer}>

                                        {ratingDetails && Object.entries(ratingDetails).map(([platform, rating]) => {
                                            return (
                                                <View key={platform} style={styles.ratingItem}>
                                                    <View style={[styles.platformInfo, { elevation: 6, padding: 4 }]}>
                                                        {getLogo(platform)}
                                                    </View>
                                                    <View style={[styles.platformInfotext]}>
                                                        <Text style={styles.platformName}>{platform}</Text>
                                                    </View>

                                                    <View style={styles.ratingStars}>
                                                        {renderStars(Number(rating))}
                                                        <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            </View>
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
    ratingDetailsContainer: {
        padding: 16,
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
        height: 55,
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
        backgroundColor: '#FFFFFF',

    },
    platformInfotext: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flex: 1,
        paddingLeft: 10,
    },
    platformName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000000',
        textAlign: 'left',
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

