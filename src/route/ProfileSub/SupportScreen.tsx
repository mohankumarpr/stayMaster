import {
  faChevronLeft,
  faPhone
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from 'react';
import {
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Contact information
const SUPPORT_PHONE = '18604550203';
const SUPPORT_EMAIL = 'support@example.com'; // Adding email as a typical option when "Write to us" is clicked

const SupportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // Handle phone call action
  const handleCallSupport = () => {
    const phoneUrl = `tel:${SUPPORT_PHONE}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          console.log("Phone calls are not supported on this device");
        }
      })
      .catch((err) => console.error('An error occurred', err));
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
          {/* Write to us button */}
          <TouchableOpacity 
            style={styles.writeButton} 
            onPress={handleEmailSupport}
          >
            <Text style={styles.writeButtonText}>Write to us</Text>
          </TouchableOpacity>
          
          {/* Phone button */}
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