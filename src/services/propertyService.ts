import api from '../api/api';
import { Property, PropertyResponse } from '../types/property';
import Storage, { STORAGE_KEYS } from '../utils/Storage';

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
}

interface CalendarBooking {
  booking_id: number;
  effectiveDate: string;
  adults: number;
  children: number;
  value: number;
}

interface CalendarResponse {
  calendar: {
    bookings: CalendarBooking[];
    blocks: any[]; // You can define a more specific type if needed
  }
}

class PropertyService {
  private static instance: PropertyService;
  private readonly baseUrl = '/hosts/properties';

  private constructor() {}

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
      console.log('\n=== Starting getAllProperties Request ===11');
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
      
      console.log('✅ API Response received');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      console.log('=== End getAllProperties Request ===\n');
      
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
        guestToken
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
        guestToken
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
}

export default PropertyService.getInstance(); 