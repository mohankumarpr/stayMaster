import React, { useState } from 'react';
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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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

const RatingsScreen: React.FC = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);

    const [selectedProperty, setSelectedProperty] = useState<Property>({
        id: '1',
        name: 'Iconic Vally',
        location: 'Fira, Thira 84700, Greece',
        image: 'https://example.com/santorini.jpg', // Replace with actual image URL
        averageRating: 4.8,
        totalReviews: 4339,
        ratings: [
            { platform: 'Airbnb', logo: 'airbnb', rating: 4.8, color: '#FF5A5F' },
            { platform: 'Makemytrip', logo: 'md-globe-outline', rating: 4.0, color: '#EB2026' },
            { platform: 'Booking.com', logo: 'booking', rating: 4.8, color: '#003580' },
        ]
    });

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<AntDesign key={`star-${i}`} name="star" size={14} color="#FFD700" style={styles.star} />);
            } else if (i === fullStars && halfStar) {
                stars.push(<AntDesign key={`star-${i}`} name="staro" size={14} color="#FFD700" style={styles.star} />);
            } else {
                stars.push(<AntDesign key={`star-${i}`} name="staro" size={14} color="#FFD700" style={styles.star} />);
            }
        }
        return stars;
    };

    // In your RatingsScreen component, update the getLogo function
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
                <TouchableOpacity style={styles.backButton}>
                    <Icon name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Ratings</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Property Selector */}
            <View style={styles.propertySelector}>
                <Text style={styles.selectorLabel}>Properties</Text>
                <TouchableOpacity 
                    style={[
                        styles.selectorButton,
                        {
                            backgroundColor: '#fff',
                            padding: 12,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#E0E0E0',
                            shadowColor: '#000',
                            shadowOffset: {width: 0, height: 2},
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 2
                        }
                    ]}
                    onPress={() => setShowDropdown(!showDropdown)}
                >
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={[styles.selectedProperty, {flex: 1}]}>
                            {selectedProperty?.name || 'Select a property'} {selectedProperty?.name && '— Greece'}
                        </Text>
                        <MaterialIcons 
                            name={showDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                            size={24} 
                            color="#000" 
                        />
                    </View>
                </TouchableOpacity>

                {showDropdown && (
                    <View style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: '#fff',
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                        zIndex: 1000
                    }}>
                        {properties.map((property) => (
                            <TouchableOpacity
                                key={property.id}
                                style={{
                                    padding: 12,
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#E0E0E0'
                                }}
                                onPress={() => {
                                    setSelectedProperty(property);
                                    setShowDropdown(false);
                                }}
                            >
                                <Text style={[
                                    {
                                        fontSize: 16,
                                        color: '#000'
                                    },
                                    selectedProperty?.id === property.id && {
                                        color: '#008489',
                                        fontWeight: 'bold'
                                    }
                                ]}>
                                    {property.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Property Card */}
            <View style={styles.propertyCardContainer}>
                <View style={styles.propertyCard}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2340&auto=format&fit=crop' }}
                        style={styles.propertyImage}
                        resizeMode="cover"
                    />

                    <View style={styles.propertyInfo}>
                        <View style={styles.nameRatingRow}>
                            <Text style={styles.propertyName}>{selectedProperty.name}</Text>
                            <View style={styles.ratingBadge}>
                                <AntDesign name="star" size={12} color="#FFD700" />
                                <Text style={styles.ratingText}>
                                    {selectedProperty.averageRating.toFixed(1)}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.propertyLocation}>
                            {selectedProperty.location}
                        </Text>

                        <Text style={styles.reviewCount}>
                            ({selectedProperty.totalReviews.toLocaleString()})
                        </Text>
                    </View>
                </View>
            </View>

            {/* Ratings List */}
            <ScrollView style={styles.ratingsList}>
                {selectedProperty.ratings.map((item, index) => (
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
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
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
    propertySelector: {
        padding: 16,
    },
    selectorLabel: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 8,
    },
    selectorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectedProperty: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000000',

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
    ratingsList: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
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