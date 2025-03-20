import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Share,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Define interfaces for our form data
interface PropertyReferralData {
  ownerName: string;
  propertyName: string;
  propertyType: string;
  numberOfRooms: string;
  swimmingPool: string;
  contact: string;
  urlAddress: string;
}

const PropertyReferralScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [formData, setFormData] = useState<PropertyReferralData>({
    ownerName: '',
    propertyName: '',
    propertyType: '',
    numberOfRooms: '',
    swimmingPool: '',
    contact: '',
    urlAddress: '',
  });

  const handleChange = (field: keyof PropertyReferralData, value: string) => {
    setFormData(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      // Here you would typically send the data to an API
      console.log('Form submitted with data:', formData);
      
      // For demonstration, we'll implement a share feature
      await Share.share({
        message: `New Property Referral: ${formData.propertyName} (${formData.propertyType}) with ${formData.numberOfRooms} rooms.`,
        title: 'Property Referral',
      });
      
      // Reset form after submission
      setFormData({
        ownerName: '',
        propertyName: '',
        propertyType: '',
        numberOfRooms: '',
        swimmingPool: '',
        contact: '',
        urlAddress: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} >
            <Icon name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer a Property</Text>
      </View>
      
      <ScrollView style={styles.formContainer}>
        <Text style={styles.label}>Property Owner Name</Text>
        <TextInput
          style={styles.input}
          value={formData.ownerName}
          onChangeText={(text) => handleChange('ownerName', text)}
          placeholder=""
        />
        
        <Text style={styles.label}>Property Name</Text>
        <TextInput
          style={styles.input}
          value={formData.propertyName}
          onChangeText={(text) => handleChange('propertyName', text)}
          placeholder=""
        />
        
        <Text style={styles.label}>Villa or Apartment</Text>
        <TextInput
          style={styles.input}
          value={formData.propertyType}
          onChangeText={(text) => handleChange('propertyType', text)}
          placeholder=""
        />
        
        <View style={styles.rowContainer}>
          <View style={styles.halfContainer}>
            <Text style={styles.label}>No. of Rooms</Text>
            <TextInput
              style={styles.input}
              value={formData.numberOfRooms}
              onChangeText={(text) => handleChange('numberOfRooms', text)}
              placeholder=""
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfContainer}>
            <Text style={styles.label}>Swimming Pool</Text>
            <TextInput
              style={styles.input}
              value={formData.swimmingPool}
              onChangeText={(text) => handleChange('swimmingPool', text)}
              placeholder=""
            />
          </View>
        </View>
        
        <Text style={styles.label}>Contact</Text>
        <TextInput
          style={styles.input}
          value={formData.contact}
          onChangeText={(text) => handleChange('contact', text)}
          placeholder=""
          keyboardType="phone-pad"
        />
        
        <Text style={styles.label}>URL / Address</Text>
        <TextInput
          style={styles.input}
          value={formData.urlAddress}
          onChangeText={(text) => handleChange('urlAddress', text)}
          placeholder=""
        />
        
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="share" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.submitButtonText}>Refer a Property</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F5F3',
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
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfContainer: {
    width: '48%',
  },
  submitButton: {
    backgroundColor: '#7ECEC4',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,

  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PropertyReferralScreen;