import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import {
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import PropertyService from '../../services/propertyService';
import { Property } from '../../types/property';

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
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.propertyCard} onPress={onPress}>
      <Image source={{ uri: image }}  style={styles.propertyImage} resizeMode="cover" />
      <View style={styles.propertyTitleContainer}>
        <Text style={styles.propertyTitle}>{title}</Text>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={20} color="#008489" />
        </TouchableOpacity>
      </View>
      <Text style={styles.propertyDetails}>
        {guests} guests · {bedrooms} bedrooms · {beds} beds · {bathrooms} bathroom
      </Text>
      <View style={styles.divider} />
      <Text style={styles.metricsTitle}>Performance metrics</Text>
      <View style={styles.metricsContainer}>
        <View>
          <Text style={styles.metricsLabel}>GBV</Text>
          <Text style={styles.metricsValue}>₹ {bookingValue}</Text>
        </View>
        <View>
          <Text style={styles.metricsLabel}>No. of nights booked</Text>
          <Text style={styles.metricsValue}>{nightsBooked}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [totalGBV, setTotalGBV] = React.useState(0);
  const [totalNights, setTotalNights] = React.useState(0);

  React.useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await PropertyService.getAllProperties();
        setProperties(response.properties || []);
        setTotalGBV(response.totalGBV);
        setTotalNights(response.totalNights);
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    fetchProperties();
  }, []);

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
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.welcomeText}>Welcome back,</Text>
                  <Text style={styles.userName}>Arun</Text>
                </View>
              </View>
            </View>


            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
              <TouchableOpacity
                style={styles.summaryCard}
                onPress={() => {
                  // return navigation.navigate('BookingDetails');
                }}
              >
                {/* Top Row - Gross Booking Value & Chevron */}
                <View style={styles.topRow}>
                  <Text style={styles.summaryLabel}>Gross Booking Value</Text>
                  <Ionicons name="chevron-forward" size={15} color="#008489" />
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
                  <Text style={styles.bookingValue}>₹ {totalGBV.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>



              <TouchableOpacity
                style={styles.summaryCard}
                onPress={() => {
                  // return navigation.navigate('BookingDetails');
                }}
              >
                {/* Top Row - Gross Booking Value & Chevron */}
                <View style={styles.topRow}>
                  <Text style={styles.summaryLabel}>No. of Nights Book</Text>
                  <Ionicons name="chevron-forward" size={15} color="#008489" />
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
                  <Text style={styles.bookingValue}>{totalNights} days</Text>
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
            <Text style={styles.sectionTitle}>Our Property</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.propertiesScrollContent}>
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  title={property.listing_name}
                  image={property.url}
                  guests={property.number_of_guests}
                  bedrooms={property.number_of_bedrooms}
                  beds={property.number_of_bedrooms}
                  bathrooms={property.number_of_bathrooms}
                  bookingValue={property.gbv || 0}
                  nightsBooked={property.nights || 0}
                  onPress={() => {
                    // return navigation.navigate('PropertyDetails', { propertyId: property.id });
                  }}
                />
              ))}
            </ScrollView>
          </View>
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
    height: 200, // Adjust this height to match your curved image
  },
  topBackground: {
    width: '100%',
  },
  contentArea: {
    flex: 1,
    marginTop: -10, // Create overlap to hide any potential gap
  },
  scrollContent: {
    paddingBottom: 30,
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
    fontSize: 14,
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
  summaryContent: {
    flex: 1,

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
    fontSize: 18,
    fontWeight: 'bold',
    paddingTop: 5,
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
  metricsTitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 15,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
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
});

export default HomeScreen;