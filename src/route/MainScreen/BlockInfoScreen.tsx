import { faLocation } from '@fortawesome/free-solid-svg-icons/faLocation';
import { faMap } from '@fortawesome/free-solid-svg-icons/faMap';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import PropertyService from '../../services/propertyService';
import day from 'react-native-calendars/src/calendar/day';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


interface BlockInfoProps {
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

const BlockInfoScreen: React.FC<BlockInfoProps> = (props) => {
  const { bookingId, startDate, endDate, numberOfBedrooms, type } = props.route.params;
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [guestDetails, setGuestDetails] = useState<any>(null);
  const [visibleRentInfo, setVisibleRentInfo] = useState(false);

  console.log("Booking ID:", bookingId);
  console.log("Start Date:", startDate);
  console.log("End Date:", endDate);
  console.log("Number of Bedrooms:", numberOfBedrooms);

  useEffect(() => {
    fetchBookingDetails();
  }, []);


  const fetchBookingDetails = async () => {
    try {
      const response = await PropertyService.getBookingDetails(bookingId, startDate, endDate);
      const bookings = response;
      setBookingDetails(bookings);
      console.log("Booking Details:", bookings);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };
  console.log("Booking Details:", bookingDetails);

  const alpineBlissBooking = {
    bookingDate: 'February 5',
    guest: {
      name: `${bookingDetails?.guest?.firstname ?? ''} ${bookingDetails?.guest?.lastname ?? ''}`,
      bookingId: bookingDetails?.booking?.id ?? null,
    },
    property: {
      name: bookingDetails?.property?.listing_name ?? '',
      location: '',
    },
    contact: '',
    checkInDateTime: bookingDetails?.booking?.start ?? null,
    checkOutDateTime: bookingDetails?.booking?.end ?? null,
    checkInDate: bookingDetails?.booking?.arrivalTime ?? null,
    checkOutDate: bookingDetails?.booking?.departureTime ?? null,
    nights: bookingDetails?.rentalInfo?.length ? bookingDetails.rentalInfo.length - 1 : 0,
    guests: {
      adults: '',
      children: '',
      total: '',
    },
    rentalInfo: bookingDetails?.rentalInfo ?? [],
    rooms: numberOfBedrooms ?? 0,
    securityDeposit: bookingDetails?.tariff?.totalAmountBeforeTax ?? 0,
    petCount: 0,
    staffCount: 0,
    source: bookingDetails?.booking?.source ?? '',
    secondarySource: 'OYO Platform',
    status: 'Confirmed'
};










  
  function formatNumber(securityDeposit: any): React.ReactNode {
    if (securityDeposit == null) return '0.00'; // Check for both null and undefined
    return securityDeposit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.00$/, '');
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
              <View style={{ width: 12, height: 12, borderRadius: 10, backgroundColor: type === 'Owner block' ? '#FFC107' : '#FF5252' }} />
              <Text style={styles.propertyName}>{alpineBlissBooking.property.name}</Text>
            </View>
            <View style={styles.statusBadge}>
              <TouchableOpacity onPress={() => props.navigation.goBack()}>
                <FontAwesome name={"remove"} size={22} color="#000" /> 
              </TouchableOpacity>
            </View>
          </View>

          {/* Guest Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.guestInfoContent}>
              <View style={styles.guestInfoColumn}>
                <Text style={styles.guestInfoLabel}>Guest name:</Text>
                <Text style={styles.guestInfoValue}>{alpineBlissBooking.guest.name ?? '...'}</Text>
                <Text style={styles.guestInfoLabel}>Booking ID:</Text>
                <Text style={styles.guestInfoValue}>{alpineBlissBooking.guest.bookingId ?? '...'}</Text>
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
              <Text style={styles.dateLabel}>Check-in Date | Time</Text>
              <Text style={styles.dateValue}>{`${new Date(alpineBlissBooking.checkInDateTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} | ${alpineBlissBooking.checkInDate}`}</Text>
            </View>
            <View style={styles.dateColumn}>
              <Text style={styles.dateLabel}>Check-out Date | Time</Text>
              <Text style={styles.dateValue}>{`${new Date(alpineBlissBooking.checkOutDateTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} | ${alpineBlissBooking.checkOutDate}`}</Text>
            </View>
          </View>

          {/* Stay Details Section */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { textAlign: 'center' }]}>No.of nights</Text>
              <Text style={[styles.metricValue, { textAlign: 'center' }]}>{alpineBlissBooking.nights ?? '...'}</Text>
            </View>
           {/*  <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { textAlign: 'center' }]}>Guests</Text>
              <Text style={[styles.metricValue, { textAlign: 'center' }]}>
                {alpineBlissBooking.guests.total}
              </Text>
            </View> */}
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { textAlign: 'center' }]}>No. of Rooms</Text>
              <Text style={[styles.metricValue, { textAlign: 'center' }]}>{alpineBlissBooking.rooms ?? '...'}</Text>
            </View>
          </View>
         {/*  <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { textAlign: 'center' }]}>Guests</Text>
            <Text style={[styles.infoValue, { textAlign: 'center' }]}>
              {alpineBlissBooking.guests.adults} adults, {'0'} children
            </Text>
          </View> */}

          {/* Additional Information */}
          <View style={styles.additionalInfoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Security Deposit</Text>
              <Text style={styles.infoValue}>₹ {formatNumber(alpineBlissBooking.securityDeposit ?? 0)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pet Count</Text>
              <Text style={styles.infoValue}>{alpineBlissBooking.petCount ?? '...'}</Text>
            </View> 
          </View>

          {/* Source Information */}
          <View style={styles.sourceSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Primary Source</Text>
              <Text style={styles.infoValue}>{alpineBlissBooking.source ?? '...'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Booking Information</Text>
              <TouchableWithoutFeedback onPress={() => {
                setVisibleRentInfo(prev => !prev);
              }}>
                <FontAwesome name={visibleRentInfo ? "chevron-up" : "chevron-down"} size={22} color="#000" /> 
              </TouchableWithoutFeedback>
            </View>

          <TouchableOpacity style={styles.actionButton} onPress={() => {
           
          }}>
            <Text style={styles.actionButtonText}>Unblock</Text>
          </TouchableOpacity>
          </View>
        </View> 

        {/* Rental Info Section */}
        {visibleRentInfo && alpineBlissBooking.rentalInfo != null && (
          <View style={styles.rentalInfoSection}>
            <Text style={styles.sectionTitle}>Booking Information</Text>
            <View style={styles.rentalInfoHeader}>
              <Text style={styles.columnHeader}>Sl.No</Text>
              <Text style={styles.columnHeader}>Date</Text>
              <Text style={styles.columnHeader}>Adults</Text>
              <Text style={styles.columnHeader}>Children</Text>
              <Text style={[styles.columnHeader, { textAlign: 'right' }]}>Rent</Text>
            </View>
            {alpineBlissBooking.rentalInfo.map((info: { effectiveDate: string; adults: number; children: number; rent: number }, index: number) => (
              <View key={index} style={styles.rentalInfoRow}>
                <Text style={styles.columnData}>{index + 1}</Text>
                <Text style={styles.columnData}>
                  {info.effectiveDate ? new Date(info.effectiveDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'}
                </Text>
                <Text style={styles.columnData}>{info.adults}</Text>
                <Text style={styles.columnData}>{info.children}</Text>
                <Text style={[{ textAlign: 'right', fontWeight: 'bold', fontSize: 13 }]}>₹ {formatNumber(info.rent)}</Text>
              </View>
            ))}
          </View>
        )}


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
    paddingTop: 16,
    paddingRight: 4, 
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
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
    flex: 0.5,
    textAlign: 'center',
    fontSize: 13,
  },
});

export default BlockInfoScreen;