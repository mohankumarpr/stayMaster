import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useProperty } from '../../context/PropertyContext';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import PropertyService from '../../services/propertyService'; // Changed to match casing
interface BookingInfo {
  name: string;
  source: string;
  property: string;
  location: string;
  contact: string; // Moved contact here to maintain structure
  dates: {
    start: string;
    end: string;
    nights: number;
  };
}


interface MaintenanceInfo {
  reason: string;
  property: string;
  duration: string;
  contact: string;
}

const CalendarScreen: React.FC<any> = ({ route }) => {
  const { selectedProperty, setSelectedProperty } = useProperty();
  const { bookingId, startDate, endDate } = route.params;
  const [guestBooking, setGuestBooking] = useState<BookingInfo | null>(null);
  const [maintenanceBlock, setMaintenanceBlock] = useState<MaintenanceInfo | null>(null);


  useEffect(() => {
    fetchBookingDetails();
  }, []);

  console.log(bookingId, startDate, endDate);

  const fetchBookingDetails = async () => {
    try {
      const response = await PropertyService.getBookingDetails(bookingId, startDate, endDate);
      console.log(response);
      var booking = response.booking;
      var property = response.property;
      var guest = response.guest;

      var s_date = new Date(booking.start);
      var e_date = new Date(booking.end);

      setGuestBooking({
        source: booking.source,
        name: `${guest.firstname} ${guest.lastname}`,
        property: property.listing_name,
        location: `${property.city}, ${property.state}`,
        contact: '+91 12345 54321',
        dates: {
          start: s_date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
          end: e_date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
          nights: booking.nights,
        },
      });


      /*  setMaintenanceBlock({
         reason: 'Title',
         property: 'Iconic Vally',
         duration: 'Duration info',
         contact: '+91 12345 54321',
       }); */

    } catch (error) {
      console.error('Error fetching booking details:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.space}>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.dateHeader}>
          <View style={styles.divider} />
        </View>

        <ScrollView>
          {/* Guest Booking Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIndicator, styles.greenIndicator]} />
              <Text style={styles.cardTitle}>{guestBooking?.source}</Text>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.cardRow}>
                <View style={styles.cardField}>
                  <Text style={styles.cardLabel}>Name</Text>
                  <Text style={styles.cardText}>{guestBooking?.name}</Text>
                </View>
                <View style={styles.cardField}>
                  <Text style={styles.cardLabel}>Property</Text>
                  <Text style={styles.cardText}>{guestBooking?.property}</Text>
                </View>
              </View>

              <View style={styles.cardRow}>
                <View style={styles.cardField}>
                  <Text style={styles.cardLabel}>Location</Text>
                  <Text style={styles.cardText}>{guestBooking?.location}</Text>
                </View>
                <View style={styles.cardField}>
                  <Text style={styles.cardLabel}>Contact</Text>
                  <Text style={styles.cardText}>{guestBooking?.contact}</Text>
                </View>
              </View>
              <View style={styles.cardRow}>
                <View style={styles.cardField}>
                  <Text style={styles.cardLabel}>Booking Dates</Text>
                  <Text style={styles.cardText}>
                    {guestBooking?.dates.start} - {guestBooking?.dates.end}{' '}
                    <Text style={styles.highlightText}>{guestBooking?.dates.nights} nights</Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  space: {
    height: 100,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2e7d32',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
  },
  propertySelector: {
    padding: 16,
    backgroundColor: '#e8e8e8',
  },
  propertyLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 12,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  dateHeader: {
    padding: 16,
    alignItems: 'center',
  },
  dateHeaderText: {
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    width: 100,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 8,
  },
  card: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  greenIndicator: {
    backgroundColor: '#4caf50',
  },
  yellowIndicator: {
    backgroundColor: '#ffc107',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  cardField: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#212121',
  },
  highlightText: {
    color: '#2e7d32',
    fontWeight: '500',
  },
});

export default CalendarScreen;