import {
  faArrowLeft,
  faBed,
  faLocationDot,
  faPeopleGroup,
  faShower,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import NetInfo from '@react-native-community/netinfo';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import propertyService from '../../services/propertyService';
import { Property } from '../../types/property';

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
};

type PropertyDetailsProps = {
  navigation: StackNavigationProp<RootStackParamList, 'PropertyDetails'>;
  route: RouteProp<RootStackParamList, 'PropertyDetails'>;
};

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ navigation, route }) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPropertyDetails();
  }, []);

  const fetchPropertyDetails = async () => {
    try {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        Alert.alert('No Internet Connection', 'Please check your internet connection and try again.');
        setLoading(false);
        return;
      }

      const propertyData = await propertyService.getPropertyById(route.params.propertyId);
      setProperty(propertyData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching property details:', error);
      if (error instanceof Error && error.message === 'Guest token not found') {
        Alert.alert('Session Expired', 'Please login again to continue.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        Alert.alert('Error', 'Failed to fetch property details. Please try again.');
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008489" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Property not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} size={24} color="#008489" />
        </TouchableOpacity>
        <Text style={styles.title}>{property.listing_name}</Text>
      </View>

      <Image source={{ uri: property.url }} style={styles.propertyImage} resizeMode="cover" />

      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Property Details</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <FontAwesomeIcon icon={faPeopleGroup} size={24} color="#008489" />
            <Text style={styles.detailValue}>{property.number_of_guests} guests</Text>
          </View>
          <View style={styles.detailItem}>
            <FontAwesomeIcon icon={faBed} size={24} color="#008489" />
            <Text style={styles.detailValue}>{property.number_of_bedrooms} bedrooms</Text>
          </View>
          <View style={styles.detailItem}>
            <FontAwesomeIcon icon={faShower} size={24} color="#008489" />
            <Text style={styles.detailValue}>{property.number_of_bathrooms} bathroom</Text>
          </View>
          <View style={styles.detailItem}>
            <FontAwesomeIcon icon={faUserPlus} size={24} color="#008489" />
            <Text style={styles.detailValue}>{property.number_of_extra_guests} extra guests</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.locationContainer}>
          <View style={styles.addressItem}>
            <FontAwesomeIcon icon={faLocationDot} size={24} color="#008489" />
            <View style={styles.addressDetails}>
              <Text style={styles.addressText}>{property.address_line_1}</Text>
              {property.address_line_2 && (
                <Text style={styles.addressText}>{property.address_line_2}</Text>
              )}
              <Text style={styles.addressText}>{`${property.city}, ${property.state}`}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Net Booking Value</Text>
            <Text style={styles.metricValue}>₹ {formatCurrency(Number(property.nbv))}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Nights Booked</Text>
            <Text style={styles.metricValue}>{property.nights} nights</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  propertyImage: {
    width: '100%',
    height: 250,
  },
  detailsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  detailItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailValue: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 24,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#008489',
  },
  locationContainer: {
    marginBottom: 24,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressDetails: {
    flex: 1,
    marginLeft: 8,
  },
  addressText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
});

export default PropertyDetails; 