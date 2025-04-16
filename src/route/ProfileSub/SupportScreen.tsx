import {
  faChevronLeft,
  faPhone
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from 'react';
import {
  Alert,
  Linking,
  PermissionsAndroid,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput
} from 'react-native';

// Contact information
const SUPPORT_PHONE = '+917709790669';
const SUPPORT_EMAIL = 'supply@thestaymaster.com'; // Adding email as a typical option when "Write to us" is clicked

const SupportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [showEmailInput, setShowEmailInput] = React.useState(false);
  const [emailSubject, setEmailSubject] = React.useState('');
  const [emailBody, setEmailBody] = React.useState('');

  const makeCall = async () => {
    const phoneNumber = SUPPORT_PHONE; // Note: remove spaces
    const phoneUrl = `tel:${phoneNumber}`;
    console.log('Phone URL:', phoneUrl);

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
    Linking.openURL('tel:+917709790669');
    return true;
  };

  // Handle email action
  const handleEmailSupport = () => {
    setShowEmailInput(true);
  };

  const handleSendEmail = async () => {
    if (!emailSubject || !emailBody) {
      Alert.alert('Please enter both subject and message');
      return false;
    }
    const emailUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    try {
      const supported = await Linking.openURL(emailUrl);
      if (!supported) {
        Alert.alert(
          'Email Not Supported',
          'No email client is configured or available on this device.',
          [{ text: 'OK' }],
          { cancelable: true }
        );
        return false;
      }
      await Linking.openURL(emailUrl);
 
      setShowEmailInput(false);
      setEmailSubject('');
      setEmailBody('');
      return true;
    } catch (error) {
      console.error('Error opening email client:', error);

      setShowEmailInput(false);
      setEmailSubject('');
      setEmailBody('');
      return false;
    }

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
            onPress={() => {
              return makeCall();
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesomeIcon icon={faPhone} size={24} color="#000" style={{ marginRight: 8 }} />
              <Text style={styles.phoneButtonText}>{SUPPORT_PHONE}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {showEmailInput && (
          <View style={styles.emailInputContainer}>
            <Text style={styles.inputLabel}>Subject</Text>
            <TextInput
              style={styles.input}
              value={emailSubject}
              onChangeText={setEmailSubject}
              placeholder="Enter subject"
            />
            <Text style={styles.inputLabel}>Message</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              value={emailBody}
              onChangeText={setEmailBody}
              placeholder="Enter your message"
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendEmail}
            >
              <Text style={styles.sendButtonText}>Send Email</Text>
            </TouchableOpacity>
          </View>
        )}
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
  emailInputContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#F9FAFB',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#00897B',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default SupportScreen;