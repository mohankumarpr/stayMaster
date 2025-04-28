import { faChevronDown, faChevronUp, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PropertyService from '../../services/propertyService';


interface CalendarInfoProps {
  [x: string]: any; 
}

interface BookingDetails {
  data: any;
  booking: any;
  property: any;
  guest: any;
  rentalInfo: any;
  tariff: any;
  calendar: Array<{
    id: number;
    start: string;
    end: string; 
    currentStatus: string;
    status: string;
    type: string;
  }>;
}

  const CalendarInfoScreen: React.FC<CalendarInfoProps> = (props) => {
  const { bookingId, startDate, endDate, numberOfBedrooms } = props.route.params;
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [visibleRentInfo, setVisibleRentInfo] = useState(false);

  // console.log("Booking ID:", bookingId);
  // console.log("Start Date:", startDate);
  // console.log("End Date:", endDate);
  // console.log("Number of Bedrooms:", numberOfBedrooms);

  const fetchBookingDetails = useCallback(async () => {
    try {
      const response = await PropertyService.getBookingDetails(bookingId, startDate, endDate);
      const bookings = response;
      setBookingDetails(bookings);
      console.log('Booking Details:', bookings);
    } catch (error) {
      console.error('Error fetching booking details:', error);
    }
  }, [bookingId, startDate, endDate]);

  useEffect(() => {
    fetchBookingDetails();
  }, [fetchBookingDetails]);

  console.log("Booking Details:", bookingDetails);

  const alpineBlissBooking = {
    bookingDate: 'February 5',
    guest: {
      name: bookingDetails?.guest.firstname  + ' ' + bookingDetails?.guest.lastname,
      bookingId: bookingDetails?.booking.id,
    },
    property: {
      name: bookingDetails?.property.listing_name ?? '',
      location: '',
    },
    contact: '',
    checkInDateTime: bookingDetails?.booking.start,
    checkOutDateTime: bookingDetails?.booking.end,
    checkInDate: bookingDetails?.booking.arrivalTime,
    checkOutDate: bookingDetails?.booking.departureTime,
    nights: bookingDetails?.rentalInfo.length,
    guests: {
      adults: '',
      children: '',
      total: '',
    },
    rentalInfo: bookingDetails?.rentalInfo,
    rooms: numberOfBedrooms ?? 0,
    netBookingValue: bookingDetails?.tariff.totalAmountBeforeTax,
    petCount: 0,
    staffCount: 0,
    source: bookingDetails?.booking.source,
    secondarySource: 'OYO Platform',
    status: 'Confirmed',
    groupType: bookingDetails?.booking.groupType,
    purpose: bookingDetails?.booking.purpose,
  };

  function formatNumber(netBookingValue: any): React.ReactNode {
    if (netBookingValue === undefined) return '0.00';
    return netBookingValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.00$/, '');
  }


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/*  <TouchableOpacity onPress={() => props.onBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity> */}
        {/*  <Text style={styles.headerTitle}>Booking Details</Text> */}
        {/*  <View style={styles.placeholderView} /> */}
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        bounces={true}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Main Booking Card */}
        <View style={styles.mainCard}>
          <View style={styles.propertyHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 12, height: 12, borderRadius: 10, backgroundColor: '#50cebb' }} />
              <Text style={styles.propertyName}>{alpineBlissBooking.property.name}</Text>
            </View>
            <View style={styles.statusBadge}>
              <TouchableOpacity onPress={() => props.navigation.goBack()}>
                <FontAwesomeIcon icon={faTimes} size={22} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Guest Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.guestInfoContent}>
              <View style={styles.guestInfoColumn}>
                <View style={styles.bookingInfoRow}>
                  <View style={styles.bookingInfoItem}>
                    <Text style={styles.guestInfoLabel}>Guest name:</Text>
                    <Text style={styles.guestInfoValue}>{alpineBlissBooking.guest.name ?? '...'}</Text>
                  </View>
                </View>
                <View style={styles.bookingInfoRow}>
                  <View style={styles.bookingInfoItem}>
                    <Text style={styles.guestInfoLabel}>Booking ID:</Text>
                    <Text style={styles.guestInfoValue}>{alpineBlissBooking.guest.bookingId ?? '...'}</Text>
                  </View>
                  <View style={styles.bookingInfoItem}>
                    <Text style={styles.guestInfoLabel}>No. of nights:</Text>
                    <Text style={styles.guestInfoValue}>{alpineBlissBooking.nights ?? '...'}</Text>
                  </View>
                </View>
              </View>
            {/*   <TouchableOpacity style={styles.guestDetailsButton} onPress={() => {
                // Toggle visibility of rental info
                setVisibleRentInfo(prev => !prev);
              }}>
                <Text style={styles.guestDetailsText}>Guest Details</Text>
              </TouchableOpacity> */}
            </View>
          </View>

          {/* Check-in/out Section  connvert into 13/03/2025 to Nov 02, 2024 | 02:00 pm*/}
          <View style={styles.datesSection}>
            <View style={styles.dateColumn}>
              <Text style={styles.dateLabel}>Check-in Date</Text>
              <Text style={styles.dateValue}>{`${new Date(alpineBlissBooking.checkInDateTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`}</Text>
            </View>
            <View style={styles.dateColumn}>
              <Text style={styles.dateLabel}>Check-out Date</Text>
              <Text style={styles.dateValue}>{`${new Date(alpineBlissBooking.checkOutDateTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`}</Text>
            </View>
          </View>

          {/* Stay Details Section */}
          {/* <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { textAlign: 'center' }]}>No. of Rooms</Text>
              <Text style={[styles.metricValue, { textAlign: 'center' }]}>{alpineBlissBooking.rooms ?? '...'}</Text>
            </View>
          </View> */}
         {/*  <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { textAlign: 'center' }]}>Guests</Text>
            <Text style={[styles.infoValue, { textAlign: 'center' }]}>
              {alpineBlissBooking.guests.adults} adults, {'0'} children
            </Text>
          </View> */}

          {/* Additional Information */}
          <View style={styles.additionalInfoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Net Booking Value</Text>
              <Text style={styles.infoValue}>₹ {formatNumber(alpineBlissBooking.netBookingValue ?? 0)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Net Price Per Night</Text>
              <Text style={styles.infoValue}>₹ {formatNumber((alpineBlissBooking.netBookingValue ?? 0) / (alpineBlissBooking.nights ?? 1))}</Text>
            </View>
          </View>

          <View style={styles.sourceSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>No. of Adults</Text>
              <Text style={styles.infoValue}>{alpineBlissBooking?.rentalInfo?.[0]?.adults ?? 0}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>No. of Kids</Text>
              <Text style={styles.infoValue}>{alpineBlissBooking?.rentalInfo?.[0]?.children ?? 0}</Text>
            </View>
          </View>
          {/* Source Information */}
          <View style={styles.sourceSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Primary Source</Text>
              <Text style={styles.infoValue}>{alpineBlissBooking.source ?? '...'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Group Type</Text>
              <Text style={styles.infoValue}>{alpineBlissBooking?.groupType || '...'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Purpose of Visit</Text>
              <Text style={styles.infoValue}>{alpineBlissBooking.purpose ?? '...'}</Text>
            </View>

            {/* <TouchableOpacity 
              style={[styles.infoRow, styles.clickableRow]} 
              onPress={() => {
                setVisibleRentInfo(prev => !prev);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.infoLabel}>Booking Information</Text>
              <FontAwesomeIcon icon={visibleRentInfo ? faChevronUp : faChevronDown} size={22} color="#000" />
            </TouchableOpacity> */}
          </View>

          {/* Rental Info Section - Now inside the main card */}
          {visibleRentInfo && alpineBlissBooking.rentalInfo != null && (
            <View style={styles.rentalInfoSection}>
              {/* <Text style={styles.sectionTitle}>Booking Information</Text> */}
              <View style={styles.rentalInfoHeader}>
                <Text style={[styles.columnHeader, { flex: 0.3 }]}>Sl.No</Text>
                <Text style={[styles.columnHeader, { flex: 0.7 }]}>Date</Text>
                <Text style={[styles.columnHeader, { flex: 0.4 }]}>Adults</Text>
                <Text style={[styles.columnHeader, { flex: 0.4 }]}>Kids</Text>
                <Text style={[styles.columnHeader, { flex: 0.6, textAlign: 'right' }]}>Rent</Text>
              </View>
              {alpineBlissBooking.rentalInfo.map((info: { effectiveDate: string; adults: number; children: number; rent: number }, index: number) => (
                <View key={index} style={styles.rentalInfoRow}>
                  <Text style={[styles.columnData, { flex: 0.3 }]}>{index + 1}</Text>
                  <Text style={[styles.columnData, { flex: 0.7 }]}>{new Date(info.effectiveDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</Text>
                  <Text style={[styles.columnData, { flex: 0.4 }]}>{info.adults}</Text>
                  <Text style={[styles.columnData, { flex: 0.4 }]}>{info.children}</Text>
                  <Text style={[{ flex: 0.6, textAlign: 'right', fontWeight: 'bold', fontSize: 13 }]}>₹ {formatNumber(info.rent)}</Text>
                </View>
              ))}
            </View>
          )}
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
  rentalInfoSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E9F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2E3A59',
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
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32, // Add extra padding at bottom for better scrolling
  },
  mainCard: {
    backgroundColor: '#f9f5f3', // White color
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyHeader: {
    marginBottom: 8,
    position: 'relative',
  },
  propertyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#50cebb', // primary color of our app
    marginBottom: 6,
    left: 10,
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
    backgroundColor: '#C4B385', // Light gray shading color
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
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
    color: '#ffffff',
    marginBottom: 2,
    textAlign: 'center',
  },
  guestInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 6,
    textAlign: 'center',
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
  rentalInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F0',
  },
  columnHeader: {
    fontWeight: 'bold',
    flex: 0.5,
    textAlign: 'center',
    fontSize: 14,
  },
  rentalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  columnData: {
    textAlign: 'center',
    fontSize: 13,
  },
  clickableRow: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  bookingInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  bookingInfoItem: {
    flex: 1,
  },
});

export default CalendarInfoScreen;