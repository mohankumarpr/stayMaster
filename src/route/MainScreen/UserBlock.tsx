import { faRemove } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast, { ToastConfigParams } from 'react-native-toast-message';
import PropertyService from '../../services/propertyService';
import { handleAuthError } from '../../utils/authUtils';

interface CustomToastProps {
  text1?: string;
  text2?: string;
  props?: {
    onProceed: () => void;
    onCancel: () => void;
  };
  onCancel?: () => void;
  onProceed?: () => void;
}

// Add toast config at the top of the file
const toastConfig = {
  custom: ({ text1, text2, props }: ToastConfigParams<CustomToastProps>) => (
    <View style={styles.toastContainer}>
      <Text style={styles.toastTitle}>{text1}</Text>
      <Text style={styles.toastMessage}>{text2}</Text>
      <View style={styles.toastButtons}>
        <TouchableOpacity 
          style={[styles.toastButton, styles.cancelButton]} 
          onPress={props?.onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toastButton, styles.proceedButton]} 
          onPress={props?.onProceed}
        >
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
    </View>
  ),
};

interface UnblockBlockScreenProps {
  route: any;
  navigation: any;
}


const UnblockBlockScreen: React.FC<UnblockBlockScreenProps> = (props) => {
  const receivedDate = new Date(props.route.params.date);
  const [startDate, setStartDate] = useState<Date>(receivedDate);
  const [endDate, setEndDate] = useState<Date>(receivedDate);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [blockType, _setBlockType] = useState('Owner block');
  const [reason, setReason] = useState('');
  const propertyId = props.route.params.propertyId;
  const [isLoading, setIsLoading] = useState(false);

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleBlockSubmit = async () => {
    if (!blockType) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a block type',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }
    console.log(startDate, endDate);
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(maxEndDate.getDate() + 15);
    if (endDate > maxEndDate) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'End date cannot be more than 15 days after start date',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    if (startDate < new Date()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Start date cannot be in the past',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    // Check if start date is within 15 days from current date
    const today = new Date();
    const fifteenDaysFromNow = new Date(today);
    fifteenDaysFromNow.setDate(today.getDate() + 15);
    
    if (startDate <= fifteenDaysFromNow) {
      // Show warning toast with custom component
      Toast.show({
        type: 'custom',
        text1: 'Warning',
        text2: 'You are blocking the property which is closer and you lose revenue.',
        position: 'bottom',
        visibilityTime: -1, // This makes it stay until manually dismissed
        autoHide: false, // Prevent auto-hiding
        bottomOffset: 40, // Add some space from the bottom
        props: {
          onProceed: () => {
            Toast.hide(); // Hide the toast before proceeding
            proceedWithBlock();
          },
          onCancel: () => {
            Toast.hide(); // Hide the toast when cancelled
          }
        }
      });
      return;
    }

    // If not within 15 days, proceed directly
    proceedWithBlock();
  };

  // Function to handle the actual blocking process
  const proceedWithBlock = async () => {
    setIsLoading(true); // Start loading

    try {
      const blockData = {
        propertyId: propertyId,
        blockType: blockType,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        reason: reason,
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

      // Check for authentication error
      if (response.authError) {
        // Navigate to login screen
        props.navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      if (response && (response.success === true)) {
        if (response.status === 400) {
          Toast.show({
            type: 'error',
            text1: 'Notice',
            text2: 'Booking is currently unavailable. Please contact the administrator for further assistance',
            position: 'top',
            visibilityTime: 4000,
          });
          props.navigation.goBack();
        } else {
          showToast('success', 'Success', 'Blocked Successfully');
          props.navigation.goBack(); // Navigate back after success
        }
      } else if (response && response.success === false) {
        Toast.show({
          type: 'error',
          text1: 'Notice',
          text2: 'This Room block reason is not available in PMS.',
          position: 'top',
          visibilityTime: 4000,
        });
      } else {
        showToast('error', 'Error', 'Failed to create block');
      }
    } catch (error: any) {
      console.error('Error creating block:', error);
      
      // Handle 401 error if not caught by the service
      const isAuthError = await handleAuthError(error, props.navigation);
      if (!isAuthError) {
        showToast('error', 'Error', 'Failed to process request');
      }
    } finally {
      setIsLoading(false); // Stop loading
    }
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

          {/* Start Date Display (Fixed) */}
          <View style={styles.datePickerButton}>
            <Text style={styles.datePickerLabel}>Start Date:</Text>
            <Text style={styles.datePickerValue}>
              {startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
            </Text>
          </View>

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

          {/* Reason Block */}
          <View style={styles.blockTypeContainer}>
            <Text style={styles.datePickerLabel}>Reason:</Text>
            <TextInput
              style={styles.reasonInput}
              multiline
              numberOfLines={4}
              value={reason}
              onChangeText={setReason}
              placeholder="Enter reason for blocking"
              textAlignVertical="top" // Align text at the top for multiline
            />
          </View>
          {/* Block Type Selection */}
          {/* <View style={styles.blockTypeContainer}>
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
          </View> */}

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
      
      <Toast config={toastConfig} />
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
  reasonInput: {
    backgroundColor: '#F9F9F9',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#2E3A59',
    marginTop: 8,
    minHeight: 100,
  },
  toastContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2E3A59',
  },
  toastMessage: {
    fontSize: 14,
    marginBottom: 16,
    color: '#2E3A59',
  },
  toastButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  toastButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  proceedButton: {
    backgroundColor: '#008489',
  },
  cancelButtonText: {
    color: '#2E3A59',
    fontWeight: '600',
  },
  proceedButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default UnblockBlockScreen;

const showToast = (type: string, title: string, message: string) => {
  Toast.show({
    type: type,
    text1: title,
    text2: message,
    visibilityTime: 4000, // Duration for which the toast is visible
    autoHide: true, // Automatically hide the toast after the visibility time
    topOffset: 30, // Offset from the top of the screen
  });
}
