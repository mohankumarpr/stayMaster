import { faChevronCircleRight, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { default as PropertyService, default as propertyService } from '../../services/propertyService';
import { Property } from '../../types/property';
import Storage, { STORAGE_KEYS } from '../../utils/Storage';


type ProfileScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'Profile'>;
};

interface Propertys {
    id: string;
    listing_name: string;
    url: string;
    number_of_guests: number;
    number_of_bedrooms: number;
    number_of_beds: number;
    number_of_bathrooms: number;
    onPress: () => void;
}

const PropertyCard: React.FC<Propertys> = ({
    listing_name,
    url,
    number_of_guests,
    number_of_bedrooms,
    number_of_beds,
    number_of_bathrooms,
    onPress,
}) => {
    console.log('Image URL:', url);
    const handleShare = async () => {
        /*  try {
             const result = await Share.share({
                 title: listing_name,
                 message: url ? `${listing_name}\n${url}` : listing_name,
                 url: url
             });
         } */
    };
    return (
        <View style={styles.propertyCard}>
            <Image source={{ uri: url }} style={styles.propertyImage} resizeMode="cover" />
            <TouchableOpacity style={styles.propertyTitleContainer} onPress={onPress}>
                <Text style={styles.propertyTitle}>{listing_name}</Text>
                <FontAwesomeIcon icon={faChevronCircleRight} size={20} color="#008489" />
            </TouchableOpacity>

            <Text style={styles.propertyDetails}>
                {number_of_guests} guests · {number_of_bedrooms} bedrooms · {number_of_beds} beds · {number_of_bathrooms} bathrooms
            </Text>

            <View style={styles.containerborderline}>
                {/* Add your content here */}
            </View>
            <View style={{ height: 40 }} />
            <View style={{ alignItems: 'center' }}>
                {<TouchableOpacity style={[styles.button, { alignItems: 'center' }]}>
                    <FontAwesomeIcon icon={faShareNodes} size={18} color="#666" />
                    <Text style={styles.shareText}>Share</Text>
                </TouchableOpacity>}
            </View>

        </View>
    );
};

const SettingsItem: React.FC<{ title: string; onPress: () => void }> = ({
    title,
    onPress,
}) => {
    return (
        <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
            <Text style={styles.settingsItemText}>{title}</Text>
            <FontAwesomeIcon icon={faChevronCircleRight} size={15} color="#999" />
        </TouchableOpacity>
    );
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    const [properties, setProperties] = React.useState<Property[]>([]);
    const [userName, setUserName] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [isUserLoading, setIsUserLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchUserData = async () => {
            setIsUserLoading(true);
            try {
                const userData = await Storage.getObject<{ firstname?: string }>(STORAGE_KEYS.USER_DATA);
                console.log("userData", userData);
                if (userData && userData.firstname) {
                    setUserName(userData.firstname);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setIsUserLoading(false);
            }
        };

        fetchUserData();
    }, []);

    React.useEffect(() => {
        const fetchProperties = async () => {
            setIsLoading(true);
            try {
                const response = await PropertyService.getAllProperties();
                setProperties(response.properties || []);
            } catch (error) {
                console.error('Error fetching properties:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProperties();
    }, []);


    const handleLogout = async () => {
        try {
            // Call PropertyService logout first
            await propertyService.handleLogout();
            // Then clear storage and reset navigation
            await Storage.clear();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' } as never],
            });
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };




    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* User Profile Section */}
                <TouchableOpacity
                    style={styles.userProfileSection}
                    onPress={() => {
                        //   return navigation.navigate('EditProfile');s
                    }}
                >
                    <Image
                        source={require('../../assets/images/logo.png')}
                        style={styles.profileImage}
                    />
                    <View style={styles.userInfo}>
                        {isUserLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#008489" />
                            </View>
                        ) : (
                            <Text style={styles.userName}>{userName}</Text>
                        )}
                        <Text style={styles.userEmail}></Text>
                    </View>
                    <FontAwesomeIcon icon={faChevronCircleRight} size={20} color="#999" />
                </TouchableOpacity>

                {/* Properties Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Our Property</Text>

                    {isLoading ? (
                        <View style={styles.loadingPropertiesContainer}>
                            <ActivityIndicator size="large" color="#008489" />
                            <Text style={styles.loadingText}>Loading properties...</Text>
                        </View>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.propertiesScrollContent}>
                            {properties.map((propertys) => (
                                <PropertyCard
                                    key={propertys.id.toString()}
                                    id={propertys.id.toString()}
                                    listing_name={propertys.listing_name}
                                    url={propertys.url}
                                    number_of_guests={propertys.number_of_guests}
                                    number_of_bedrooms={propertys.number_of_bedrooms}
                                    number_of_beds={propertys.number_of_beds}
                                    number_of_bathrooms={propertys.number_of_bathrooms}
                                    onPress={() => {
                                        // return navigation.navigate('PropertyDetails', { propertyId: propertys.id });
                                    }}
                                />
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>

                    <View style={styles.settingsContainer}>
                        <SettingsItem
                            title="My Ratings"
                            onPress={() => {
                                navigation.navigate('RatingsScreen');
                            }}
                        />
                        <SettingsItem
                            title="Monthly Statements"
                            onPress={() => {
                                // navigation.navigate('Statements');
                                navigation.navigate('MonthlyStatementsScreen');
                            }}
                        />
                        <SettingsItem
                            title="Refer a Property"
                            onPress={() => {
                                // navigation.navigate('ReferProperty');
                                navigation.navigate('PropertyReferralScreen');
                            }}
                        />
                        {/* <SettingsItem
                            title="View your listings"
                            onPress={() => {
                                // navigation.navigate('Listings');
                            }}
                        /> */}
                        <SettingsItem
                            title="Support"
                            onPress={() => {
                                // navigation.navigate('Support');
                                navigation.navigate('SupportScreen');
                            }}
                        />
                        <SettingsItem
                            title="Logout"
                            onPress={() => {
                                handleLogout();
                            }}
                        />
                    </View>

                </View>
            </ScrollView>
            <View style={{ height: 20 }} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F5F3',
    },
    containerborderline: {
        width: 261,
        borderWidth: 1,
        borderColor: '#F2F2F2',
        borderRadius: 4, // Adjust the radius as needed
    },
    button: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 4,
        padding: 10,

        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        width: '90%',
    },
    buttonText: {
        color: '#333333',
        fontWeight: '500',
        fontSize: 14,
    },
    propertiesScrollContent: {
        paddingRight: 15,
        paddingBottom: 20,

    },
    scrollContent: {
        paddingBottom: 30,
    },
    userProfileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 0,
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: '#F9F5F3',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        resizeMode: 'contain',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    userEmail: {
        fontSize: 14,
        color: '#999',
        marginTop: 3,
    },
    section: {
        marginTop: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        paddingHorizontal: 20,
    },
    propertyCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        width: 280,
        height: 320,
        marginLeft: 20,
        marginRight: 5,
        marginBottom: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        overflow: 'hidden',
        borderTopLeftRadius: 150,
        borderTopRightRadius: 150,
        alignContent: 'center',

    },
    propertyImage: {
        width: '100%',
        height: 150,
        borderTopLeftRadius: 150,
        borderTopRightRadius: 150,
    },
    propertyTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 12,

    },
    propertyTitle: {
        fontSize: 22,
        fontWeight: '400',
        fontFamily: 'serif',
    },
    propertyDetails: {
        paddingHorizontal: 15,
        paddingTop: 5,
        paddingBottom: 12,
        fontSize: 12,
        color: '#666',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    shareText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    settingsContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginHorizontal: 20,
        overflow: 'hidden',
    },
    settingsItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    settingsItemText: {
        fontSize: 16,
        color: '#333',
    },
    loadingContainer: {
        height: 20,
        justifyContent: 'center',
    },
    loadingPropertiesContainer: {
        height: 70, // Same height as property card
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F5F3',
        marginHorizontal: 20,
        borderRadius: 10,
        // shadowColor: '#000',
        // shadowOffqqset: { width: 0, height: 1 },
        // shadowOpacity: 0.1,
        // shadowRadius: 3,
        // elevation: 2,
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
        fontSize: 14,
    },
});

export default ProfileScreen;