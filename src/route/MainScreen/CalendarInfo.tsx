import { faLocation } from '@fortawesome/free-solid-svg-icons/faLocation';
import { faMap } from '@fortawesome/free-solid-svg-icons/faMap';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BookingDetailsProps {
  onBack: () => void;
}

const BookingDetailsScreen: React.FC<BookingDetailsProps> = (props) => {
  const alpineBlissBooking = {
    bookingDate: 'February 5',
    guest: {
      name: 'Paras Patel',
      bookingId: '1146453',
    },
    property: {
      name: 'Alpine Bliss - mussoorie',
      location: 'Mussoorie',
    },
    contact: '+91 12345 54321',
    checkInDateTime: 'Nov 02, 2024 | 02:00 pm',
    checkOutDateTime: 'Nov 05, 2024 | 11:00 am',
    nights: 3,
    guests: {
      adults: 12,
      children: 2,
      total: 14,
    },
    rooms: 5,
    securityDeposit: 0,
    petCount: 0,
    staffCount: 0,
    source: 'Airbnb',
    secondarySource: 'OYO Platform',
    status: 'Confirmed'
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
       {/*  <TouchableOpacity onPress={() => props.onBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity> */}
       {/*  <Text style={styles.headerTitle}>Booking Details</Text> */}
       {/*  <View style={styles.placeholderView} /> */}
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Main Booking Card */}
        <View style={styles.mainCard}>
          <View style={styles.propertyHeader}>
            <Text style={styles.propertyName}>{alpineBlissBooking.property.name}</Text>
            <View style={styles.locationRow}>
              <FontAwesomeIcon icon={faLocation} size={16} color="#4A90E2" />
              <Text style={styles.propertyLocation}>Address</Text>
              <TouchableOpacity style={styles.mapButton}>
                <FontAwesomeIcon icon={faMap} size={16} color="#4A90E2" />
              </TouchableOpacity>
            </View>
           {/*  <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{alpineBlissBooking.status}</Text>
            </View> */}
          </View>

          {/* Guest Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.guestInfoContent}>
              <View style={styles.guestInfoColumn}>
                <Text style={styles.guestInfoLabel}>Guest name:</Text>
                <Text style={styles.guestInfoValue}>{alpineBlissBooking.guest.name}</Text>
                <Text style={styles.guestInfoLabel}>Booking ID:</Text>
                <Text style={styles.guestInfoValue}>{alpineBlissBooking.guest.bookingId}</Text>
              </View>
             {/*  <TouchableOpacity style={styles.guestDetailsButton}>
                <Text style={styles.guestDetailsText}>Guest Details</Text>
              </TouchableOpacity> */}
            </View>
          </View>

          {/* Check-in/out Section */}
          <View style={styles.datesSection}>
            <View style={styles.dateColumn}>
              <Text style={styles.dateLabel}>Check-in date | time</Text>
              <Text style={styles.dateValue}>{alpineBlissBooking.checkInDateTime}</Text>
            </View>
            <View style={styles.dateColumn}>
              <Text style={styles.dateLabel}>Check-out date | time</Text>
              <Text style={styles.dateValue}>{alpineBlissBooking.checkOutDateTime}</Text>
            </View>
          </View>

          {/* Stay Details Section */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { textAlign: 'center' }]}>No.of nights</Text>
              <Text style={[styles.metricValue, { textAlign: 'center' }]}>{alpineBlissBooking.nights} </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { textAlign: 'center' }]}>Guests</Text>
              <Text style={[styles.metricValue, { textAlign: 'center' }]}>
                {alpineBlissBooking.guests.total} 
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { textAlign: 'center' }]}>No. of Rooms</Text>
              <Text style={[styles.metricValue, { textAlign: 'center' }]}>{alpineBlissBooking.rooms}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { textAlign: 'center' }]}>Guests</Text>
            <Text style={[styles.infoValue, { textAlign: 'center' }]}>
              {alpineBlissBooking.guests.adults} adults, {alpineBlissBooking.guests.children} children
            </Text>
          </View>

          {/* Additional Information */}
          <View style={styles.additionalInfoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Security Deposit</Text>
              <Text style={styles.infoValue}>₹ {alpineBlissBooking.securityDeposit}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pet Count</Text>
              <Text style={styles.infoValue}>{alpineBlissBooking.petCount}</Text>
            </View>
            
          </View>

          {/* Source Information */}
          <View style={styles.sourceSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Primary Source</Text>
              <Text style={styles.infoValue}>{alpineBlissBooking.source}</Text>
            </View>
            
          </View>
        </View>

        {/* Quick Action Buttons */}
        {/* <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="call-outline" size={24} color="#4A90E2" />
            <Text style={styles.actionButtonText}>Call Guest</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={24} color="#4A90E2" />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-text-outline" size={24} color="#4A90E2" />
            <Text style={styles.actionButtonText}>Invoice</Text>
          </TouchableOpacity>
        </View> */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F0',
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2E3A59',
  },
  placeholderView: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  mainCard: {
    backgroundColor: '#FFFFFF', // White color
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyHeader: {
    marginBottom: 16,
    position: 'relative',
  },
  propertyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E3A59',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyLocation: {
    fontSize: 16,
    color: '#4A90E2',
    marginLeft: 4,
    marginRight: 8,
  },
  mapButton: {
    padding: 2,
  },
  statusBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#4CD964',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#F0F0F0', // Light gray shading color
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  guestInfoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guestInfoColumn: {
    flex: 1,
  },
  guestInfoLabel: {
    fontSize: 14,
    color: '#8F9BB3',
    marginBottom: 2,
  },
  guestInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 6,
  },
  guestDetailsButton: {
    backgroundColor: '#F1F3F7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  guestDetailsText: {
    color: '#4A90E2',
    fontWeight: '600',
    fontSize: 14,
  },
  datesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateColumn: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: '#8F9BB3',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E3A59',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    color: '#8F9BB3',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3A59',
    textAlign: 'justify',
  },
  additionalInfoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: '#8F9BB3',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E3A59',
  },
  sourceSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E9F0',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    margin: 6,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    marginTop: 6,
    color: '#4A90E2',
    fontWeight: '500',
  },
});

export default BookingDetailsScreen;