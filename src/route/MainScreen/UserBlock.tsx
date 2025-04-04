import { faRemove } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import PropertyService from '../../services/propertyService';




interface UnblockBlockScreenProps {
  route: any;
  navigation: any;
}


const UnblockBlockScreen: React.FC<UnblockBlockScreenProps> = (props) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [blockType, setBlockType] = useState('');
  const propertyId = props.route.params.propertyId;
  console.log('propertyId', propertyId);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      // If end date is before start date, update it
      if (endDate < selectedDate) {
        setEndDate(selectedDate);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };



  const handleBlockSubmit = async () => {
    if (!blockType) {
      Alert.alert('Error', 'Please select a block type');
      return;
    }
    console.log(startDate, endDate);
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(maxEndDate.getDate() + 15);
    if (endDate > maxEndDate) {
      Alert.alert('Error', 'End date cannot be more than 15 days after start date');
      return;
    }

    if (startDate < new Date()) {
      Alert.alert('Error', 'Start date cannot be in the past');
      return;
    }

    setIsLoading(true); // Start loading

    // try {
    const blockData = {
      propertyId: propertyId,
      blockType: blockType,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      reason: 'Testing the block functionality',
    };

    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];

    const response = await PropertyService.blockBooking(
      blockData.propertyId,
      blockData.blockType,
      formattedStartDate,
      formattedEndDate
    );
    console.log('response handleBlockSubmit', response);

    if (response && (response.success === true)) {

      if (response.status === 400) {
        Alert.alert(
          'Notice',
          'This Room block reason is not available in PMS.',
          [{ text: 'OK', style: 'destructive', onPress: () => props.navigation.goBack() }],
          { cancelable: false }
        );
       
      } else {
        showToast('success', 'Success', 'Blocked Successfully');
        props.navigation.goBack(); // Navigate back after success
      }

    } else if (response && response.success === false) {
      Alert.alert(
        'Notice',
        'This Room block reason is not available in PMS.',
        [{ text: 'OK', style: 'destructive' }],
        { cancelable: false }
      );
    } else {
      showToast('error', 'Error', 'Failed to create block');
    }
    /*  } catch (error: any) {
       console.error('Error creating block:', error);
       showToast('error', 'Error', 'Failed to process request');
     } finally {
       setIsLoading(false); // Stop loading regardless of outcome
     } */
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {/* Date Selection Section */}
        <View style={styles.datePickerSection}>
          <View style={styles.headerContainer}>
            <Text style={styles.sectionTitle}>Block</Text>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <FontAwesomeIcon icon={faRemove} size={22} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Start Date Picker */}
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.datePickerLabel}>Start Date:</Text>
            <Text style={styles.datePickerValue}>
              {startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
            </Text>
          </TouchableOpacity>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              minimumDate={new Date()}
              onChange={handleStartDateChange}
              display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
            />
          )}

          {/* End Date Picker */}
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.datePickerLabel}>End Date:</Text>
            <Text style={styles.datePickerValue}>
              {endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
            </Text>
          </TouchableOpacity>

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              minimumDate={startDate}
              onChange={handleEndDateChange}
              display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
            />
          )}

          {/* Block Type Selection */}
          <View style={styles.blockTypeContainer}>
            <Text style={styles.datePickerLabel}>Block Type:</Text>
            <View style={styles.blockTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.blockTypeButton,
                  blockType === 'Maintenance Block' && styles.blockTypeButtonActive
                ]}
                onPress={() => setBlockType('Maintenance Block')}
              >
                <Text style={[
                  styles.blockTypeText,
                  blockType === 'Maintenance Block' && styles.blockTypeTextActive
                ]}>Maintenance Block</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.blockTypeButton,
                  blockType === 'Owner block' && styles.blockTypeButtonActive
                ]}
                onPress={() => setBlockType('Owner block')}
              >
                <Text style={[
                  styles.blockTypeText,
                  blockType === 'Owner block' && styles.blockTypeTextActive
                ]}>Owner Block</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isLoading && styles.submitButtonDisabled
            ]}
            onPress={handleBlockSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={[styles.submitButtonText, styles.loadingText]}>
                  Processing...
                </Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Block</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ... existing content ... */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... existing styles ...
  container: {
    flex: 1,
    paddingTop: 100,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  datePickerSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginVertical: 8,
  },
  datePickerLabel: {
    fontSize: 16,
    color: '#2E3A59',
    fontWeight: '500',
  },
  datePickerValue: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
  blockTypeContainer: {
    marginTop: 16,
  },
  blockTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  blockTypeButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  blockTypeButtonActive: {
    backgroundColor: '#4A90E2',
  },
  blockTypeText: {
    color: '#2E3A59',
    fontWeight: '500',
  },
  blockTypeTextActive: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#50cebb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#82dfd1', // lighter shade when disabled
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
});

export default UnblockBlockScreen;

function showToast(type: string, title: string, message: string) {
  Toast.show({
    type: type,
    text1: title,
    text2: message,
    visibilityTime: 4000, // Duration for which the toast is visible
    autoHide: true, // Automatically hide the toast after the visibility time
    topOffset: 30, // Offset from the top of the screen
  });
}
