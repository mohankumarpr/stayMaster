import {
  faCheckCircle,
  faChevronDown,
  faChevronLeft,
  faShare
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import PropertyService from '../../services/propertyService';
const dummyBanners = [
  {
    id: '1',
    title: 'Luxury Villa',
    image: require('../../assets/images/property.png'),
  },
  /* {
    id: '2',
    title: 'Beach House',
    image: require('../../assets/images/property.png'),
    },
  {
    id: '3',
    title: 'Mountain Cabin',
    image: require('../../assets/images/property.png'),
  }, */
];

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

  // Add error states
  const [errors, setErrors] = useState({
    ownerName: '',
    contact: '',
  });

  const [selectedBanner, setSelectedBanner] = useState<string | null>(null);

  const handleChange = (field: keyof PropertyReferralData, value: string) => {
    setFormData(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      ownerName: '',
      contact: '',
    };

    // Validate owner name
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
      isValid = false;
    }

    // Validate contact number
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.contact.trim())) {
      newErrors.contact = 'Please enter a valid 10-digit contact number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    try {
      // Set loading state to true
      // setLoading(true);
      
      console.log('Form submitted with data:', formData);

      // For demonstration, we'll implement a share feature
   /*    await Share.share({
        message: `New Property Referral: ${formData.propertyName} (${formData.propertyType}) with ${formData.numberOfRooms} rooms.`,
        title: 'Property Referral',
      }); */
      const response = await PropertyService.referProperty(formData.ownerName, formData.propertyName, formData.propertyType, parseInt(formData.numberOfRooms), formData.swimmingPool ?? 'None', formData.contact, formData.urlAddress);
      console.log('Response:', response);

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
    } finally {
      // Set loading state to false
      // setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faChevronLeft} size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer a Property</Text>
      </View>

      <View style={styles.bannerListContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bannerList}
        >
          {/* <TouchableOpacity 
            style={[
              styles.bannerItem, 
              styles.customBannerItem,
              selectedBanner === 'custom' && styles.selectedBanner
            ]}
            onPress={() => setSelectedBanner('custom')}
          >
            <View style={styles.customBannerContent}>
              <FontAwesomeIcon icon={faPlusCircle} size={24} color="#666" />
              <Text style={styles.customBannerText}>Custom Upload</Text>
            </View>
          </TouchableOpacity> */}

          {dummyBanners.map((banner) => (
            <TouchableOpacity
              key={banner.id}
              style={[
                styles.bannerItem,
                selectedBanner === banner.id && styles.selectedBanner
              ]}
              onPress={() => setSelectedBanner(banner.id)}
            >
              <Image source={banner.image} style={styles.bannerItemImage} />
              <View style={styles.bannerItemOverlay}>
                <Text style={styles.bannerItemTitle}>{banner.title}</Text>
              </View>
              {selectedBanner === banner.id && (
                <View style={styles.selectedIndicator}>
                  <FontAwesomeIcon icon={faCheckCircle} size={24} color="#7ECEC4" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>


      <ScrollView style={styles.formContainer}>
        <Text style={styles.label}>
          Property Owner Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.ownerName ? styles.inputError : null]}
          value={formData.ownerName}
          onChangeText={(text) => {
            handleChange('ownerName', text);
            setErrors(prev => ({ ...prev, ownerName: '' }));
          }}
          placeholder="Enter owner name"
        />
        {errors.ownerName ? (
          <Text style={styles.errorText}>{errors.ownerName}</Text>
        ) : null}

        <Text style={styles.label}>Property Name</Text>
        <TextInput
          style={styles.input}
          value={formData.propertyName}
          onChangeText={(text) => handleChange('propertyName', text)}
          placeholder=""
        />

        <Text style={styles.label}>Property Type</Text>
        <RNPickerSelect
          value={formData.propertyType}
          onValueChange={(value) => handleChange('propertyType', value)}
          items={[
            { label: "Villa", value: "Villa" },
            { label: "Condo", value: "Condo" },
            { label: "Apartment", value: "Apartment" }
          ]}
          style={{
            inputIOS: styles.pickerInput,
            inputAndroid: styles.pickerInput,
            iconContainer: {
              top: 12,
              right: 12,
            },
          }}
          placeholder={{ label: "Select property type", value: null }}
          Icon={() => (
            <View style={styles.pickerIcon}>
              <FontAwesomeIcon icon={faChevronDown} size={16} color="#666" />
            </View>
          )}
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
            <Text style={[styles.label]}>Swimming Pool</Text>
            <RNPickerSelect
              value={formData.swimmingPool}
              onValueChange={(value) => handleChange('swimmingPool', value)}
              items={[
                { label: "None", value: "None" },
                { label: "Private", value: "Private" },
                { label: "Shared", value: "Shared" }
              ]}
              style={{
                inputIOS: styles.pickerInput,
                inputAndroid: styles.pickerInput,
                iconContainer: {
                  top: 12,
                  right: 12,
                },
              }}
              placeholder={{ label: "Select pool type", value: null }}
              Icon={() => (
                <View style={styles.pickerIcon}>
                  <FontAwesomeIcon icon={faChevronDown} size={16} color="#666" />
                </View>
              )}
            />
          </View>
        </View>

        <Text style={styles.label}>
          Contact <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.contact ? styles.inputError : null]}
          value={formData.contact}
          onChangeText={(text) => {
            handleChange('contact', text);
            setErrors(prev => ({ ...prev, contact: '' }));
          }}
          placeholder="Enter 10-digit contact number"
          keyboardType="phone-pad"
          maxLength={10}
        />
        {errors.contact ? (
          <Text style={styles.errorText}>{errors.contact}</Text>
        ) : null}

        <Text style={styles.label}>URL / Address</Text>
        <TextInput
          style={styles.input}
          value={formData.urlAddress}
          onChangeText={(text) => handleChange('urlAddress', text)}
          placeholder=""
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FontAwesomeIcon icon={faShare} size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
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
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
    flexDirection: 'row',
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
  required: {
    color: '#FF0000',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF0000',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
  bannerListContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 12
  },
  bannerList: {
    paddingHorizontal: 20,
  },
  bannerItem: {
    width: 350,
    height: 160,
    marginRight: 12,
    borderRadius: 8,
    alignContent: 'center',  
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  customBannerItem: {
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customBannerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customBannerText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  bannerItemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: '#F0F0F0', // Placeholder color while loading
  },
  bannerItemOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
  },
  bannerItemTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
  selectedBanner: {
    borderColor: '#7ECEC4',
    borderWidth: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
  },
  pickerInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: 'black',
    paddingRight: 30, // Make room for the icon
  },
  pickerIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export default PropertyReferralScreen;

function setLoading(arg0: boolean) {
  throw new Error('Function not implemented.');
}
