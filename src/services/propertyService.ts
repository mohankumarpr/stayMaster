import { Alert } from 'react-native';
import api from '../api/api';
import { Property, PropertyResponse, BlockBookingResponse, CalendarResponse, UnblockBookingResponse } from '../types/property';
import Storage, { STORAGE_KEYS } from '../utils/Storage';
import Toast from 'react-native-toast-message';
import { createAuthErrorResponse } from '../utils/authUtils';

interface EarningsByMonth {
  earnings: Array<{
    count: number;
    amount: number;
    date: string;
  }>;
  nights: Array<{
    count: number;
    date: string;
  }>;
  authError?: boolean;
}

interface CalendarBooking {
  booking_id: number;
  effectiveDate: string;
  adults: number;
  children: number;
  value: number;
}
interface RatingResponse {
  ratings: {
    Airbnb: number;
    Booking: number;
    MakeMyTrip: number;
    Expedia: number;
    Agoda: number;
    Hostelworld: number;
  };
  property: any;
  guest: any;
}

interface MonthlyStatement {
  name: string; // e.g., "2024_11.pdf"
  year: string; // e.g., "2024"
  month: string; // e.g., "11"
}

class PropertyService {
  getPropertyStatements(selectedProperty: string) {
    throw new Error('Method not implemented.');
  }
  downloadStatement(selectedProperty: string, selectedYear: number, selectedMonth: string) {
    throw new Error('Method not implemented.');
  }
  private static instance: PropertyService;
  private readonly baseUrl = '/hosts/properties';
  private readonly baseUrl2 = '/hosts';
  private propertiesCache: PropertyResponse | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

  private constructor() { }

  public static getInstance(): PropertyService {
    if (!PropertyService.instance) {
      PropertyService.instance = new PropertyService();
    }
    return PropertyService.instance;
  }

  private async getGuestToken(): Promise<string | null> {
    try {
      console.log('Attempting to retrieve guest token from storage...');
      const token = await Storage.getItem(STORAGE_KEYS.USER_TOKEN);
      console.log('Token status:', token ? 'Found' : 'Not found');
      if (token) {
        console.log('Token value:', token.substring(0, 10) + '...');  // Show first 10 chars for security
      }
      return token;
    } catch (error) {
      console.error('Error retrieving guest token:', error);
      return null;
    }
  }

  async getAllProperties(): Promise<PropertyResponse> {
    try {
      // Check if we have valid cached data
      const now = Date.now();
      // if (this.propertiesCache && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      //   console.log('📦 Returning cached properties data');
      //   return this.propertiesCache;
      // }

      console.log('\n=== Starting getAllProperties Request ===');
      const guestToken = await this.getGuestToken();
      if (!guestToken) {
        console.error('❌ Guest token not found in storage');
        throw new Error('Guest token not found');
      }
      console.log('✅ Guest token retrieved successfully');

      console.log(`📡 Making API request to: ${this.baseUrl}`);
      console.log('Request payload:', {
        guestToken: guestToken.substring(0, 10) + '...',
        url: this.baseUrl,
        method: 'POST'
      });

      const response = await api.post<PropertyResponse>(this.baseUrl, {
        guestToken
      });

      // Cache the response
      this.propertiesCache = response.data;
      this.lastFetchTime = now;

      console.log('✅ API Response received and cached');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      // console.log('=== End getAllProperties Request ===\n');

      return response.data;
    } catch (error: any) {
      console.error('\n❌ Error in getAllProperties:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      // Handle 401 Unauthorized error
      if (error.response?.status === 401) {
        // Clear user data and token
        await Storage.clear();
        
        // Show professional error message
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Your session has expired. Please log in again to continue.',
          position: 'top',
          visibilityTime: 4000,
        });
        
        // Return a special response that indicates authentication failure
        return {
          totalNBV: 0,
          totalNights: 0,
          properties: [],
          authError: true
        };
      }
      
      throw error;
    }
  }

  //get monthly statement
  async getMonthlyStatement(propertyId: string): Promise<{ name: string; year: string; month: string }[]> {
    try {
      console.log(`\n=== Starting getMonthlyStatement Request (Property ID: ${propertyId}) ===`);
      const guestToken = await this.getGuestToken();

      if (!guestToken) {
        console.error('❌ Guest token not found in storage');
        throw new Error('Guest token not found');
      }
      console.log('✅ Guest token retrieved successfully');

      const url = `${this.baseUrl2}/monthlyStatements`;
      console.log(`📡 Making API request to: ${url}`);

      const response = await api.post<{ name: string; year: string; month: string }[]>(url, {
        property_id: propertyId,
        guestToken,
      });

      console.log('✅ API Response received');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      console.log(`=== End getMonthlyStatement Request ===\n`);

      return response.data.map(({ name, year, month }) => ({ name, year, month }));
    } catch (error: any) {
      console.error(`\n❌ Error in getMonthlyStatement:`, {
        propertyId,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }


  // download monthly statement
  async downloadMonthlyStatement(propertyId: string, filename: string): Promise<{ url: string }> {
    try {
      console.log(`\n=== Starting downloadMonthlyStatement Request (Property ID: ${propertyId}) ===`);
      const guestToken = await this.getGuestToken();

      if (!guestToken) {
        console.error('❌ Guest token not found in storage');
        throw new Error('Guest token not found');
      }
      console.log('✅ Guest token retrieved successfully');

      const url = `${this.baseUrl2}/downloadStatement`;
      console.log(`📡 Making API request to: ${url}`);

      const response = await api.post<{ url: string }>(url, {
        property_id: propertyId,
        guestToken,
        filename: filename
      });

      console.log('✅ API Response received');
      console.log('Status:', response.status);
      console.log('Data:**', JSON.stringify(response.data, null, 2));
      console.log(`=== End downloadMonthlyStatement Request ===\n`);

      return response.data; // Return the URL directly
    } catch (error: any) {
      console.error(`\n❌ Error in downloadMonthlyStatement:`, {
        propertyId,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }



  // refer a property
  async referProperty(owner_name: string, property_name: string, property_type: string, rooms: number, pool: string, owner_phone: string, url_address: string): Promise<number> {
    try {
      console.log(`\n=== Starting referProperty Request ===`);
      const guestToken = await this.getGuestToken();

      if (!guestToken) {
        console.error('❌ Guest token not found in storage');
        throw new Error('Guest token not found');
      }
      console.log('✅ Guest token retrieved successfully');

      const url = `${this.baseUrl2}/referAProperty`;
      console.log(`📡 Making API request to: ${url}`);

      const response = await api.post<{
        status: { url: string; } | PromiseLike<{ url: string; }>; url: string
      }>(url, {
        guestToken: guestToken,
        owner_name: owner_name,
        property_name: property_name,
        property_type: property_type,
        rooms: rooms,
        pool: pool,
        owner_contact: owner_phone,
        url_address: url_address
      });

      console.log('✅ API Response received');
      console.log('Status:', response.status);
      console.log('Data:**', JSON.stringify(response.data, null, 2));
      console.log(`=== End referProperty Request ===\n`); 
      return response.status; // Return the status directly as a number
    } catch (error: any) {
      /* console.error(`\n❌ Error in referProperty:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      }); */
      throw error;
    }
  }




  async getPropertyById(id: string): Promise<Property> {
    try {
      console.log(`\n=== Starting getPropertyById Request (ID: ${id}) ===`);
      const guestToken = await this.getGuestToken();

      if (!guestToken) {
        console.error('❌ Guest token not found in storage');
        throw new Error('Guest token not found');
      }
      console.log('✅ Guest token retrieved successfully');

      const url = `${this.baseUrl}/${id}`;
      console.log(`📡 Making API request to: ${url}`);

      const response = await api.post<Property>(url, {
        guestToken
      });

      console.log('✅ API Response received');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      console.log(`=== End getPropertyById Request ===\n`);

      return response.data;
    } catch (error: any) {
      console.error(`\n❌ Error in getPropertyById:`, {
        propertyId: id,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Handle 401 Unauthorized error
      if (error.response?.status === 401) {
        // Clear user data and token
        await Storage.clear();
        
        // Show professional error message
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Your session has expired. Please log in again to continue.',
          position: 'top',
          visibilityTime: 4000,
        });
        
        // Return a special response that indicates authentication failure
        return {
          id: '',
          listing_name: '',
          earnings: [],
          location: '',
          image: '',
          amenities: [],
          description: '',
          internal_name: '',
          number_of_bedrooms: 0,
          number_of_bathrooms: 0,
          number_of_beds: 0,
          number_of_guests: 0,
          number_of_extra_guests: 0,
          google_latitude: '',
          google_longitude: '',
          address_line_1: '',
          address_line_2: '',
          city: '',
          state: '',
          country: 0,
          media_filename: '',
          url: '',
          nbv: 0,
          nights: 0,
          average_rating: 0,
          total_reviews: 0,
          authError: true
        };
      }
      
      throw error;
    }
  }

  async updateProperty(id: string, propertyData: Partial<Property>): Promise<Property> {
    try {
      const guestToken = await this.getGuestToken();
      if (!guestToken) {
        throw new Error('Guest token not found');
      }

      const response = await api.put<Property>(`${this.baseUrl}/${id}`, {
        ...propertyData,
        guestToken
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating property with id ${id}:`, error);
      throw error;
    }
  }

  async createProperty(propertyData: Omit<Property, 'id'>): Promise<Property> {
    try {
      const guestToken = await this.getGuestToken();
      if (!guestToken) {
        throw new Error('Guest token not found');
      }

      const response = await api.post<Property>(this.baseUrl, {
        ...propertyData,
        guestToken
      });
      return response.data;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  async deleteProperty(id: string): Promise<void> {
    try {
      const guestToken = await this.getGuestToken();
      if (!guestToken) {
        throw new Error('Guest token not found');
      }

      await api.delete(`${this.baseUrl}/${id}`, {
        data: { guestToken }
      });
    } catch (error) {
      console.error(`Error deleting property with id ${id}:`, error);
      throw error;
    }
  }

  async getEarningsByMonth(propertyId: string): Promise<EarningsByMonth> {
    try {
      console.log(`\n=== Starting getEarningsByMonth Request (Property ID: ${propertyId}) ===`);
      const guestToken = await this.getGuestToken();

      if (!guestToken) {
        console.error('❌ Guest token not found in storage');
        throw new Error('Guest token not found');
      }
      console.log('✅ Guest token retrieved successfully');

      const url = '/hosts/earningsByMonth';
      console.log(`📡 Making API request to: ${url}`);

      const response = await api.post<EarningsByMonth>(url, {
        property_id: propertyId,
        guestToken: guestToken,
      });

      console.log('✅ API Response received');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      console.log(`=== End getEarningsByMonth Request ===\n`);

      return response.data;
    } catch (error: any) {
      console.error(`\n❌ Error in getEarningsByMonth:`, {
        propertyId,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Handle 401 Unauthorized error
      if (error.response?.status === 401) {
        // Clear user data and token
        await Storage.clear();
        
        // Show professional error message
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Your session has expired. Please log in again to continue.',
          position: 'top',
          visibilityTime: 4000,
        });
        
        // Return a special response that indicates authentication failure
        return {
          earnings: [],
          nights: [],
          authError: true
        };
      }
      
      throw error;
    }
  }

  async getPropertyCalendar(propertyId: string): Promise<CalendarResponse> {
    try {
      console.log(`\n=== Starting getPropertyCalendar Request (Property ID: ${propertyId}) ===`);
      const guestToken = await this.getGuestToken();

      if (!guestToken) {
        console.error('❌ Guest token not found in storage');
        throw new Error('Guest token not found');
      }
      console.log('✅ Guest token retrieved successfully');

      const url = '/hosts/calendar';
      console.log(`📡 Making API request to: ${url}`);

      const response = await api.post<CalendarResponse>(url, {
        property_id: propertyId,
        guestToken: guestToken,
      });

      console.log('✅ API Response received');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      console.log(`=== End getPropertyCalendar Request ===\n`);

      return response.data;
    } catch (error: any) {
      console.error(`\n❌ Error in getPropertyCalendar:`, {
        propertyId,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  //block booking
  async blockBooking(propertyId: string, blockType: string, startDate: string, endDate: string): Promise<BlockBookingResponse> {
    try {
      console.log(`\n=== Starting blockBooking Request (Booking Type: ${blockType}, Start Date: ${startDate}, End Date: ${endDate}) Property ID: ${propertyId} ===`);
      const guestToken = await this.getGuestToken();

      if (!guestToken) {
        console.error('❌ Guest token not found in storage');
        throw new Error('Guest token not found');
      }
      console.log('✅ Guest token retrieved successfully');

      const url = '/hosts/block';
      console.log(`📡 Making API request to: ${url}`);

      const response = await api.post<BlockBookingResponse>(url, {
        guestToken: guestToken,
        property_id: propertyId,
        blockType: blockType,
        start: startDate,
        end: endDate,
        reason: 'testing',
      });

      console.log('✅ API Response received');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      console.log(`=== End blockBooking Request ===\n`);

      if (response.status === 200 || response.status === 301 || response.status === 400) {
        if (response.status === 200 || response.status === 301) {
           return response.data;
        } else if (response.status === 400) {
          return response.data;
        }
      }
      return response.data;
    } catch (error: any) {
      console.error(`\n❌ Error in blockBooking:`, {
        blockType,
        startDate,
        endDate,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      // Handle 401 Unauthorized error
      if (error.response?.status === 401) {
        // Clear user data and token
        await Storage.clear();
        
        // Show professional error message
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Your session has expired. Please log in again to continue.',
          position: 'top',
          visibilityTime: 4000,
        });
        
        // Return a special response that indicates authentication failure
        return {
          success: false,
          status: 401,
          blocks: [],
          authError: true
        };
      }

      throw error;
    }
  }


  //unblock booking
  async unblockBooking(blockId: string): Promise<UnblockBookingResponse> {
    try {
      console.log(`\n=== Starting unblockBooking Request (Booking ID: ${blockId}) ===`);
      const guestToken = await this.getGuestToken();

      if (!guestToken) {
        console.error('❌ Guest token not found in storage');
        throw new Error('Guest token not found');
      }
      console.log('✅ Guest token retrieved successfully');

      const url = '/hosts/unblock';
      console.log(`📡 Making API request to: ${url}`);

      const response = await api.post<UnblockBookingResponse>(url, {
        block_id: blockId,
        guestToken
      });

      console.log('✅ API Response received');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      console.log(`=== End unblockBooking Request ===\n`);

      return response.data;
    } catch (error: any) {
      console.error(`\n❌ Error in unblockBooking:`, {
        blockId,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Handle 401 Unauthorized error
      if (error.response?.status === 401) {
        // Clear user data and token
        await Storage.clear();
        
        // Show professional error message
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Your session has expired. Please log in again to continue.',
          position: 'top',
          visibilityTime: 4000,
        });
        
        // Return a special response that indicates authentication failure
        return {
          success: false,
          authError: true
        };
      }
      
      throw error;
    }
  }

  //get booking details
  async getBookingDetails(bookingId: string, startDate: string, endDate: string): Promise<CalendarResponse> {
    try {
      console.log(`\n=== Starting getBookingDetails Request (Booking ID: ${bookingId}, Start Date: ${startDate}, End Date: ${endDate}) ===`);
      const guestToken = await this.getGuestToken();

      if (!guestToken) {
        console.error('❌ Guest token not found in storage');
        throw new Error('Guest token not found');
      }
      console.log('✅ Guest token retrieved successfully');

      const url = '/hosts/bookingDetails';
      console.log(`📡 Making API request to: ${url}`);

      const response = await api.post<CalendarResponse>(url, {
        booking_id: bookingId,
        start: startDate,
        end: endDate,
        guestToken
      });

      console.log('✅ API Response received');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      console.log(`=== End getBookingDetails Request ===\n`);

      return response.data;
    } catch (error: any) {
      console.error(`\n❌ Error in getBookingDetails:`, {
        bookingId,
        startDate,
        endDate,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Handle 401 Unauthorized error
      if (error.response?.status === 401) {
        // Clear user data and token
        await Storage.clear();
        
        // Show professional error message
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Your session has expired. Please log in again to continue.',
          position: 'top',
          visibilityTime: 4000,
        });
        
        // Return a special response that indicates authentication failure
        return {
          data: {},
          booking: {},
          property: {},
          rentalInfo: [],
          tariff: {},
          guest: {},
          calendar: [],
          authError: true
        };
      }
      
      throw error;
    }
  }


  // get rating details
  async getRatingDetails(propertyId: string): Promise<Record<string, number>> {
    try {
      console.log(`\n=== Starting getRatingDetails Request (Property ID: ${propertyId}) ===`);
      const guestToken = await this.getGuestToken();
      if (!guestToken) {
        console.error('❌ Guest token not found in storage');
        throw new Error('Guest token not found');
      }
      console.log('✅ Guest token retrieved successfully');

      const url = '/hosts/ratings';
      console.log(`📡 Making API request to: ${url}`);

      const response = await api.post<Record<string, number>>(url, {
        property_id: propertyId,
        guestToken
      });

      console.log('✅ API Response received');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      console.log(`=== End getRatingDetails Request ===\n`);

      return response.data;
    } catch (error: any) {
      console.error(`\n❌ Error in getRatingDetails:`, {
        propertyId,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  // Add method to clear cache if needed
  public clearCache(): void {
    console.log('🧹 Clearing properties cache');
    this.propertiesCache = null;
    this.lastFetchTime = 0;
  }

  // Add method to handle logout
  public handleLogout(): void {
    this.clearCache();
  }
}

const propertyService = PropertyService.getInstance();
export default propertyService;

function showToast(arg0: { text1: string; type: string; }) {
  throw new Error('Function not implemented.');
}
