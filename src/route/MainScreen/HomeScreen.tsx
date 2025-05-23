import { faChevronCircleRight } from '@fortawesome/free-solid-svg-icons/faChevronCircleRight';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import PropertyService from '../../services/propertyService';
// import Storage from '../../services/storageService';
import Toast from 'react-native-toast-message';
import { useProperty } from '../../context/PropertyContext';
import { Property } from '../../types/property';
import Storage, { STORAGE_KEYS } from '../../utils/Storage';

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

interface PropertyCardProps {
  title: string;
  image: any;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  bookingValue: number;
  nightsBooked: number;
  onPress: () => void;
  address: string;
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.8;

const PropertyCard: React.FC<PropertyCardProps> = ({
  title,
  image,
  guests,
  bedrooms,
  beds,
  bathrooms,
  bookingValue,
  nightsBooked,
  address,
  onPress,
}) => {

  function formatAmount(bookingValue: number): string {
    if (bookingValue === undefined) return '0';
    return bookingValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).replace(/\.00$/, '');
  }

  return (
    <TouchableOpacity style={styles.propertyCard} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.propertyImage} resizeMode="cover" />
      <View style={styles.propertyTitleContainer}>
        <Text style={styles.propertyTitle}>{title}</Text>
        <TouchableOpacity>
          <FontAwesomeIcon icon={faChevronCircleRight} size={20} color="#008489" />
        </TouchableOpacity>
      </View>
      <Text style={styles.propertyDetails}>
        {address}
      </Text>
      <View style={styles.divider} />
      <Text style={styles.metricsTitle}>Performance</Text>
      <View style={styles.metricsContainer}>
        <View>
          <Text style={styles.metricsLabel}>Revenue</Text>
          <Text style={styles.metricsValue}>₹ {formatAmount(bookingValue)}</Text>
        </View>
        <View>
          <Text style={styles.metricsLabel}>Nights Booked</Text>
          <Text style={styles.metricsValue}>{nightsBooked}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { setSelectedProperty } = useProperty();
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [totalNBV, settotalNBV] = React.useState(0);
  const [totalNights, setTotalNights] = React.useState(0);
  const [userName, setUserName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await Storage.getObject<{ firstname?: string }>(STORAGE_KEYS.USER_DATA);
        console.log("userData", userData);
        if (userData && userData.firstname) {
          setUserName(userData.firstname);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  React.useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const response = await PropertyService.getAllProperties();
        setProperties(response.properties || []);
        settotalNBV(response.totalNBV);
        setTotalNights(response.totalNights);
      } catch (error) {
        console.error('Error fetching properties:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to fetch properties. Please try again.',
          position: 'bottom',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  function formatAmount(totalNBV: number): string {
    if (totalNBV === undefined) return '0.00';
    return totalNBV.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.00$/, '');
  }

  return (
    <>
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
            
                <View style={styles.userInfo}>
                  <Image source={require('../../assets/images/StayMaster-Logo.png')} style={styles.avatar} />
                  <View style={styles.textContainer}>
                    <Text style={styles.welcomeText}>Welcome</Text>
                    <Text style={styles.userName}>{userName}</Text>
                  </View>
                </View>
              

              {/* Summary Cards */}
              <View style={styles.summaryContainer}>
                <TouchableOpacity
                  style={styles.summaryCard}
                  onPress={() => {
                    // return navigation.navigate('BookingDetails');
                  }}>
                  {/* Top Row - Net Booking Value & Chevron */}
                  <View style={styles.topRow}>
                    <View style={styles.columnContainer}>
                      <Text style={styles.summaryLabel}>Revenue</Text>
                      <Text style={styles.summaryLabel2}>Current FY</Text>
                    </View>
                    <FontAwesomeIcon icon={faChevronCircleRight} size={15} color="#008489" />
                  </View>

                  {/* Bottom Row - Image & Booking Value */}
                  <View style={styles.bottomRow}>
                    <View style={styles.container2}>
                      <View style={styles.curvedContainer}>
                        <Image
                          source={require('../../assets/images/dollar.png')}
                          style={styles.currencyImage}
                        />
                      </View>
                    </View>
                    <Text style={styles.bookingValue}> {formatAmount(totalNBV)}</Text>
                  </View>
                </TouchableOpacity>
                  <View style={styles.divider2} />  

                <TouchableOpacity
                  style={styles.summaryCard}
                  onPress={() => {
                    // return navigation.navigate('BookingDetails');
                  }}
                >
                  {/* Top Row - Net Booking Value & Chevron */}
                  <View style={styles.topRow}>
                    <View style={styles.columnContainer}>
                      <Text style={styles.summaryLabel}>Nights Booked</Text>
                      <Text style={styles.summaryLabel2}>Current FY</Text>
                    </View>
                    <FontAwesomeIcon icon={faChevronCircleRight} size={15} color="#008489" />
                  </View>

                  {/* Bottom Row - Image & Booking Value */}
                  <View style={styles.bottomRow}>
                    <View style={styles.container2}>
                      <View style={styles.curvedContainer}>
                        <Image
                          source={require('../../assets/images/calender.png')}
                          style={styles.currencyImage}
                        />
                      </View>
                    </View>
                    <Text style={styles.bookingValue}>{formatAmount(totalNights)} days</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </ImageBackground>
        </View>

        {/* Content Area with Properties */}
        <View style={styles.contentArea}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Properties Section */}
            <View style={styles.propertiesSection}>
              <Text style={styles.sectionTitle}>My Homes</Text>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#008489" />
                  <Text style={styles.loadingText}>Loading properties...</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.propertiesScrollContent}>
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      title={property.listing_name}
                      image={property.url}
                      guests={property.number_of_guests}
                      bedrooms={property.number_of_bedrooms}
                      beds={typeof property.number_of_beds === 'number' ? property.number_of_beds : 0}
                      bathrooms={typeof property.number_of_bathrooms === 'number' ? property.number_of_bathrooms : 0}
                      bookingValue={typeof property.nbv === 'number' ? property.nbv : 0}
                      nightsBooked={typeof property.nights === 'number' ? property.nights : 0}
                      address={property.address_line_2}

                      onPress={() => {
                        // Navigate to Earnings screen and set the selected property
                        navigation.navigate('Earnings');
                        // Add a small delay to ensure navigation completes before setting the property
                        setTimeout(() => {
                          setSelectedProperty(property.id.toString());
                        }, 100);
                      }}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container2: {
    flex: 1,
    // backgroundColor: '#f0f0f0',
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
    elevation: 0, // For Android shadow
  },
  topContainer: {
    height: 220, // Increased from 220 to give even more space
  },
  topBackground: {
    width: '100%',
    height: 140,
  },
  contentArea: {
    flex: 1,
    marginTop: -20, // Keeping this the same to maintain the curved overlap effect
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 20,
    resizeMode: 'contain',
  },
  textContainer: {
    flexDirection: 'column', 
  },
  welcomeText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 10,
    textAlign: 'right',
    opacity: 0.9,
    marginBottom: 2, // Add small gap between welcome text and username
  },
  userName: {
    color: 'white',
    fontSize: 18,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 30, // Increased from 20 to give more breathing room
    zIndex: 1,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    width: '50%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    paddingRight: 6,
  },
  summaryLabel2: {
    fontSize: 10,
    color: '#666', 
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',  // Ensures spacing between image and value
    marginTop: 8,
  },
  summaryValue: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 2,
  },
  currencyContainer: {
    width: 24,
    height: 24,
    color: '#e8f6f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  currencyImage: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },
  bookingValue: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingTop: 5,
    paddingLeft: 5,
  },
  calendarIcon: {
    marginRight: 5,
    color: '#008489',
  },
  bottomSpace: {
    height: 10, // Adjust the height to create space at the top
  },
  propertiesSection: {
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 15,
    paddingTop: 20,
    flex: 1,
  },
  propertiesScrollContent: {
    paddingRight: 15,
    paddingBottom: 20,

  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginLeft: 5,
    color: '#333',
  },
  propertyCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: cardWidth,
    marginRight: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    borderTopLeftRadius: 150,
    borderTopRightRadius: 150,
  },
  propertyImage: {
    width: '100%',
    height: 170,
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
    fontSize: 12,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 15,
    marginVertical: 10,
  },
  divider2: { 
    marginHorizontal: 2, 
  },
  metricsTitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 15,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 25,
    paddingTop: 5,
  },
  metricsLabel: {
    fontSize: 12,
    color: '#666',
  },
  metricsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  columnContainer: {
    flexDirection: 'column',
  },
});

export default HomeScreen;