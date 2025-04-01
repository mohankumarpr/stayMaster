import {
  faChevronLeft,
  faPhone
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from 'react';
import {
  Linking,
  PermissionsAndroid,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Contact information
const SUPPORT_PHONE = '+91 7709790669';
const SUPPORT_EMAIL = 'supply@thestaymaster.com'; // Adding email as a typical option when "Write to us" is clicked

const SupportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // Handle phone call action
  const handleCallSupport = async () => {
    const phoneUrl = `tel:${SUPPORT_PHONE}`;
    const permissionGranted = await askForCallPermission(); // Function to ask for permission
    if (!permissionGranted) {
      console.log("Permission to make calls was denied.");
      return;
    }
    try {
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        console.log("This device does not support making phone calls. Please check your device settings or try a different method to contact support.");
      }
    } catch (err) {
      console.error('An error occurred while trying to make a call', err);
    }
  };

  const askForCallPermission = async () => {
    // Logic to ask for permission (this is a placeholder, implement as needed)
    // For example, using a library or custom modal to request permission
    const permission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      {
        title: 'Call Permission',
        message: 'This app needs access to make phone calls. Please grant permission to proceed.',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
      }
    );
    if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Permission to make calls was denied. Please enable it in settings.");
      return false;
    }
    return true;
  };



  // Handle email action
  const handleEmailSupport = () => {
    const emailUrl = `mailto:${SUPPORT_EMAIL}`;
    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(emailUrl);
        } else {
          console.log("Email is not supported on this device");
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} >
          <FontAwesomeIcon icon={faChevronLeft} size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
      </View>
      
      {/* Support Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.supportMessage}>
          Please get in touch and we will be happy to help you
        </Text>
        
        <View style={styles.contactOptionsContainer}>
          {/* Supply@thestaymaster.com  Write to us button */}
          <TouchableOpacity 
            style={styles.writeButton} 
            onPress={handleEmailSupport}
          >
            <Text style={styles.writeButtonText}>Write to us</Text>
          </TouchableOpacity>
          
          {/* 77097 90669  Phone button */}
          
          <TouchableOpacity 
            style={styles.phoneButton} 
            onPress={handleCallSupport}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesomeIcon icon={faPhone} size={24} color="#000" style={{ marginRight: 8 }} />
              <Text style={styles.phoneButtonText}>{SUPPORT_PHONE}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F5F3', // Light beige background matching the image
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 20,
  },
  supportMessage: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 22,
  },
  contactOptionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  writeButton: {
    backgroundColor: '#00897B', // Teal color for the "Write to us" button
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 15,
  },
  writeButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  phoneButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 5,
    borderColor: 'white',
  },
  phoneButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SupportScreen;